import express from "express";
import cors from "cors";
import MonitorService from "./services/MonitorService";
import fs from "fs";
import { DashboardConfiguration } from "./types";

const isDevEnv = process.env.NODE_ENV === 'development';

const configPath = isDevEnv ? '/dashboard-config.json' : '/run/secrets/dashboard-config';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as DashboardConfiguration;

const monitorService = new MonitorService();

const app = express();

if () {
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

    // Send an initial message to the connected client
    res.flushHeaders();
    res.write('retry: 10000\n\n'); // Retry every 10 seconds if the connection is lost


    req.on('close', () => {
        console.log('Client closed connection');
        // Stop sending events, cleanup, etc.
    });
});

const port = 5174;
app.listen(port, () => console.log(`Listening on port ${port}.`))
