import express, { type Response, type Request } from "express";

const router = express.Router();

router.get('/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an initial message to the connected client
    res.flushHeaders();
    res.write('retry: 10000\n\n'); // Retry every 10 seconds if the connection is lost

    // Setup a function to send data to the client
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Mock some data or fetch from your services
    setInterval(() => {
        const data = {
            timestamp: new Date(),
            // ... other monitoring data
        };
        sendEvent(data);
    }, 5000); // Send data every 5 seconds

    // Handle client closing the connection
    req.on('close', () => {
        console.log('Client closed connection');
        // Stop sending events, cleanup, etc.
    });
});

export default router;
