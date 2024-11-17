export const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL,
    jwtStorageKey: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY,
    enableWebsocket: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true'
} as const; 