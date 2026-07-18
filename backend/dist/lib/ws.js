"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsManager = void 0;
class ConnectionManager {
    constructor() {
        this.activeConnections = new Map();
    }
    connect(ws, userId) {
        if (!this.activeConnections.has(userId)) {
            this.activeConnections.set(userId, []);
        }
        this.activeConnections.get(userId).push(ws);
    }
    disconnect(ws, userId) {
        if (this.activeConnections.has(userId)) {
            const connections = this.activeConnections.get(userId);
            const index = connections.indexOf(ws);
            if (index !== -1) {
                connections.splice(index, 1);
            }
            if (connections.length === 0) {
                this.activeConnections.delete(userId);
            }
        }
    }
    sendPersonalMessage(message, userId) {
        if (this.activeConnections.has(userId)) {
            const msgStr = JSON.stringify(message);
            for (const connection of this.activeConnections.get(userId)) {
                connection.send(msgStr);
            }
        }
    }
}
exports.wsManager = new ConnectionManager();
//# sourceMappingURL=ws.js.map