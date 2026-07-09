import { Server, Socket } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { redis } from './redis.js'
import type { Server as HTTPServer } from 'http'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../db/client.js'

export let io: Server;

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  const pubClient = redis;
  const subClient = redis.duplicate();
  
  io.adapter(createAdapter(pubClient, subClient));

  // Middleware: Verify JWT from cookies
  io.use(async (socket, next) => {
    try {
      const secret = process.env.NEXTAUTH_SECRET;
      if (!secret) return next(new Error('Server configuration error'));

      const cookieHeader = socket.request.headers.cookie;
      const cookies: Record<string, string> = {};
      if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
          const parts = cookie.split('=');
          cookies[parts.shift()!.trim()] = decodeURI(parts.join('='));
        });
      }

      // getToken can parse from headers.cookie or authorization header
      const token = await getToken({ 
        req: { headers: socket.request.headers, cookies } as any, 
        secret 
      });

      if (!token || !token.sub) {
        return next(new Error('Authentication error'));
      }

      socket.data.userId = token.sub;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Authenticated client connected: ${socket.id} (User: ${socket.data.userId})`);

    // Join a project room
    socket.on('join-project', async (projectId: string, userId: string) => {
      // Security check: ensure the userId matches the authenticated socket
      if (socket.data.userId !== userId) {
        return socket.disconnect();
      }

      // Verify project membership
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId
          }
        }
      });

      if (!membership) {
        console.warn(`[Socket] User ${userId} tried to join project ${projectId} without membership`);
        return socket.emit('error', { message: 'Forbidden' });
      }

      const roomName = `project:${projectId}`;
      socket.join(roomName);
      console.log(`[Socket] User ${userId} joined room ${roomName}`);
      
      socket.data.projectId = projectId;

      // Broadcast presence update to the room
      io.to(roomName).emit('presence.updated', {
        userId,
        status: 'online'
      });
      
      // Fetch currently active users in the room and send them back to the joining socket
      const socketsInRoom = await io.in(roomName).fetchSockets();
      const activeUserIds = Array.from(new Set(socketsInRoom.map(s => s.data.userId).filter(Boolean)));
      
      socket.emit('presence.sync', activeUserIds);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      if (socket.data.projectId && socket.data.userId) {
        const roomName = `project:${socket.data.projectId}`;
        io.to(roomName).emit('presence.updated', {
          userId: socket.data.userId,
          status: 'offline'
        });
      }
    });
  });

  return io;
}
