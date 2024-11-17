# Flight Management Server

A Node.js backend service for managing flight information with real-time updates.

## Features

- User Authentication with JWT
- Role-based Access Control
- Real-time Flight Status Updates using WebSocket
- Redis Caching
- Kafka Integration for Event Streaming
- MongoDB Database
- Docker Support

## Tech Stack

- Node.js & Express
- MongoDB (Database)
- Redis (Caching)
- Kafka (Event Streaming)
- WebSocket (Real-time Updates)
- Docker & Docker Compose

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Git

## Installation & Setup

1. Clone the repository:
2. npm install
    To install the dependencies.
2. docker-compose up -d
    This will start MongoDB, Redis, Kafka, and other required services.
3. Start the Node.js server:
    npm run serve (The server will start on http://localhost:3001)
4. npm run seed
   This will create default users and other required data.

Default Seeded Users:
- Admin: username: `admin`, password: `admin123`
- User: username: `user`, password: `user123`

## Architecture
```mermaid
graph TD
Client[Next.js Client] --> |HTTP/WS| Server[Express Server]
subgraph Server Architecture
Server --> |Authentication| Auth[Auth Middleware]
Auth --> |Cache Check| Redis[(Redis Cache)]
Auth --> |DB Query| MongoDB[(MongoDB)]
Server --> |Routes| Routes[Route Handlers]
Routes --> |Business Logic| Controllers[Controllers]
Controllers --> |Data Access| Services[Services]
Services --> Redis
Services --> MongoDB
Services --> Kafka[Kafka Service]
Kafka --> |Produce| KafkaBroker[Kafka Broker]
KafkaBroker --> |Consume| WebSocket[WebSocket Service]
WebSocket --> |Real-time Updates| Client
end
