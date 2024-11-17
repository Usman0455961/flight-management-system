class WebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: ((message: any) => void)[] = [];

    connect() {
        if (!process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET) {
            console.log('WebSocket is disabled');
            return;
        }

        this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        };
    }

    addMessageHandler(handler: (message: any) => void) {
        this.messageHandlers.push(handler);
    }

    removeMessageHandler(handler: (message: any) => void) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }
}

export const websocketService = new WebSocketService(); 