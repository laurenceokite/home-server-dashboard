import express from "express";
import cors from "cors";

const corsOpts = {
    origin: ["http://localhost:5173"]
};

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(cors(corsOpts));
    app.options('*', cors(corsOpts));
}

const port = 5174;
app.listen(port, () => console.log(`Listening on port ${port}.`))
