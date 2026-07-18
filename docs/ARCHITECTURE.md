# System Architecture Diagram

This diagram outlines the high-level architecture of the Project and Team Task Management Platform.

```mermaid
flowchart TD
    %% Entities
    Client[("Client\n(Browser / React SPA)")]
    ViteServer["Frontend Server\n(Vite Dev Server)"]
    NodeBackend["Backend API\n(Node.js + Express)"]
    WebSocket["WebSocket Server\n(ws)"]
    PrismaORM["Prisma ORM"]
    NeonDB[("PostgreSQL Database\n(Neon Serverless)")]

    %% Layout
    subgraph Frontend ["Frontend (Vite / React)"]
        Client <-->|HMR| ViteServer
    end

    subgraph Backend ["Backend Node Application"]
        NodeBackend
        WebSocket
        PrismaORM
        
        NodeBackend -.->|Uses| PrismaORM
        WebSocket -.->|Triggered by| NodeBackend
    end

    subgraph Database ["Database Layer"]
        NeonDB
    end

    %% Connections
    Client <-->|REST API (HTTPS)| NodeBackend
    Client <-->|Real-time Notifications (WSS)| WebSocket
    PrismaORM <-->|Connection Pool| NeonDB
```
