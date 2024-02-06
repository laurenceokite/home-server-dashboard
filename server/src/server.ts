import express from "express";
import cors from "cors";
import MonitorService from "./services/DashboardService";
import fs from "fs";
import { DashboardConfiguration } from "../../shared/types";
import { AppEventEmitter } from "./events/appEmitter";
import DashboardService from "./services/DashboardService";

const isDevEnv = process.env.NODE_ENV === 'development';

const configPath = isDevEnv ? ('./dashboard-config.json') : ('/run/secrets/dashboard-config');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as DashboardConfiguration;

console.log(config);

const appEmitter = new AppEventEmitter();
const dashboardService = new DashboardService(config, appEmitter);

const app = express();

if (isDevEnv) {
    const corsOpts = {
        origin: ["http://localhost:5173"]
    };

    app.use(cors(corsOpts));
    app.options('*', cors(corsOpts));
}

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders();
    res.write('retry: 10000\n\n'); 
    
    dashboardService.handleNewClient(res);

    req.on('close', () => {
        dashboardService.handleClientDisconnect(res); 
    });
});

const port = 5174;
app.listen(port, () => console.log(`Listening on port ${port}.`))
