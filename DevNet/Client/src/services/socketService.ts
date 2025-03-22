import { io, Socket } from "socket.io-client";

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
            this.socket = io('http://localhost:8000', {
                query: {
                    id: userId
                },
                transports: ['websocket']
            });

            this.socket.on('connect', () => {
                console.log('Connected to socket server with ID:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from socket server');
            });

            // Listen for online users updates
            this.socket.on('getOnlineUsers', (onlineUsers: string[]) => {
                console.log('Online users:', onlineUsers);
                // You might want to dispatch this to Redux if needed
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

    // Helper method to emit events
    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    // Helper method to listen for events
    on(event: string, callback: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
        return this; // For method chaining
    }

    // Helper method to stop listening to events
    off(event: string, callback?: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
        return this; // For method chaining
    }
}

export default SocketService.getInstance();