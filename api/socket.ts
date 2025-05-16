import { Server, Socket } from 'socket.io';

export function registerSocketHandlers(socket: Socket, io: Server) {
  socket.on('message', (data: string) => {
    console.log(`💬 Message from ${socket.id}:`, data);
    
    // Broadcast to all other clients
    socket.broadcast.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
}