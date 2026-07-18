import { WebSocket } from 'ws';

class ConnectionManager {
  private activeConnections: Map<number, WebSocket[]> = new Map();

  connect(ws: WebSocket, userId: number) {
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, []);
    }
    this.activeConnections.get(userId)!.push(ws);
  }

  disconnect(ws: WebSocket, userId: number) {
    if (this.activeConnections.has(userId)) {
      const connections = this.activeConnections.get(userId)!;
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
      }
      if (connections.length === 0) {
        this.activeConnections.delete(userId);
      }
    }
  }

  sendPersonalMessage(message: any, userId: number) {
    if (this.activeConnections.has(userId)) {
      const msgStr = JSON.stringify(message);
      for (const connection of this.activeConnections.get(userId)!) {
        connection.send(msgStr);
      }
    }
  }
}

export const wsManager = new ConnectionManager();
