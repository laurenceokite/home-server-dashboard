import { Response } from "express";
import { SSEMessage } from "../../../shared/sse.types";

export default class SSEClientManager {
    private clients: Set<Response>;

    constructor() {
        this.clients = new Set();
    }

    addClient(client: Response, initMessage?: SSEMessage) {
        this.clients.add(client);
        if (initMessage) {
            client.write(`data: ${JSON.stringify(initMessage)}\n\n`);
        }
        client.on('close', () => this.removeClient(client));
    }

    removeClient(client: Response) {
        this.clients.delete(client);
    }

    sendToAll(data: SSEMessage) {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        this.clients.forEach(client => client.write(message));
    }

    hasClients() {
        return this.clients.size > 0;
    }     
}

