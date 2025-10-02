import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/apiConfig";

class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    connect(userId: string) {
        if (!this.socket) {
            this.socket = io(API_BASE_URL, {
                query: {
                    id: userId
                },
                transports: ['polling'],
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionAttempts: 10,
                timeout: 30000,
                forceNew: false
            });

            // Handle connection events
            this.socket.on('connect', () => {
                console.log('Connected to server:', this.socket?.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Disconnected from server:', reason);
                if (reason === 'io server disconnect') {
                    // Server disconnected, reconnect manually
                    this.socket?.connect();
                }
            });

            this.socket.on('reconnect', (attemptNumber) => {
                console.log('Reconnected to server on attempt:', attemptNumber);
            });

            this.socket.on('reconnect_attempt', (attemptNumber) => {
                console.log('Attempting to reconnect:', attemptNumber);
            });

            this.socket.on('reconnect_error', (error) => {
                console.log('Reconnection error:', error);
            });

            this.socket.on('reconnect_failed', () => {
                console.log('Failed to reconnect to server');
            });

            this.socket.on('connect_error', (error) => {
                console.log('Connection error:', error.message);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }

    getSocketId() {
        return this.socket ? this.socket.id : null;
    }

    // Helper method to check if connected
    isConnected() {
        return this.socket ? this.socket.connected : false;
    }

    // Helper method to emit events
    emit(event: string, data: any) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit event:', event);
        }
    }

    // Helper method to listen for events
    on(event: string, callback: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
        return this;
    }

    // Helper method to stop listening to events
    off(event: string, callback?: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
        return this;
    }
}

export default SocketService.getInstance();