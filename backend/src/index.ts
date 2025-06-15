import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { PrismaClient } from '@prisma/client';
import { Server as IoServer } from 'socket.io';
import { uploadToCloudinary } from './utils/cloudinary.config';
import searchRoutes from './routes/search';
// Route Imports
import veterinarianRoutes from './routes/veterinarian';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import userRoutes from './routes/users';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import reservationRouter from './routes/reservations';
import messageRoutes from './routes/messages';
import certificateRoutes from './routes/certificates';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';
import aiRoutes from './routes/ai.route';
import chatRoutes from './routes/chat.route';
import weatherRoutes from './routes/weather.routes';
import commentRoutes from './routes/comment.route';
import { errorHandler } from './middleware/errorHandler';
import googleRoute from './routes/google';
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const io = new IoServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' })); // Increase body size limit for file uploads
app.use(morgan('dev'));

// API Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use('/api/vet', veterinarianRoutes);
app.use('/api', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reservations', reservationRouter);
app.use('/api/messages', messageRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/google', googleRoute);  
app.use('/api/comments', commentRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin',adminRoutes)
app.use('/api/search', searchRoutes);
app.use('/api', weatherRoutes); // ✅ Mount under `/api`
// Central Error Handler
app.use(errorHandler);

// 404 Not Found Fallback
app.use((req, res) => {
  res.status(404).json({ message: 'The requested resource was not found.' });
});

// Socket.IO Connection Handling
const activeUsers = {} as { [key: string]: string }; // Map userId to socketId

io.on("connection", (socket) => {
  const userIdQuery = socket.handshake.query.userId;
  console.log('A user connected');

  // FIX: Ensure userId is a single string before using it as an index
  if (userIdQuery && typeof userIdQuery === 'string') {
    const userId = userIdQuery;
    activeUsers[userId] = socket.id;
    io.emit('update_online_users', Object.keys(activeUsers));
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }

  socket.on('disconnect', () => {
    const userIdQuery = socket.handshake.query.userId;
    if (userIdQuery && typeof userIdQuery === 'string') {
        const userId = userIdQuery;
        // Check if the disconnected socket is the one we have on record
        if (activeUsers[userId] === socket.id) {
            delete activeUsers[userId];
            io.emit('update_online_users', Object.keys(activeUsers));
            console.log(`User ${userId} disconnected.`);
        }
    }
  });

  socket.on('send_message', async (messageData, callback) => {
    try {
      let fileUrl: string | undefined;
      // Handle file upload if file data is present
      if (messageData.fileData && messageData.fileName) {
        // FIX: Convert the base64 string to a Buffer to match the expected type
        const fileBuffer = Buffer.from(messageData.fileData, 'base64');
        fileUrl = await uploadToCloudinary(fileBuffer);
      }

      const savedMessage = await prisma.message.create({
        data: {
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          content: messageData.content,
          fileUrl,
          fileType: messageData.fileType,
          reactions: {}, // Initialize with empty reactions
        },
        include: { sender: true, receiver: true }
      });

      // Emit the message to the receiver if they are online
      const receiverSocketId = activeUsers[savedMessage.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', savedMessage);
      }

      // Acknowledge the message was sent successfully
      callback({ success: true, message: savedMessage });
    } catch (err) {
      console.error('Error sending message:', err);
      callback({ success: false, error: 'Failed to send message.' });
    }
  });

  // Handlers for joining/leaving product comment rooms
  socket.on('join_product_room', (productId: string) => {
    socket.join(`product-comments-${productId}`);
  });

  socket.on('leave_product_room', (productId: string) => {
    socket.leave(`product-comments-${productId}`);
  });
});

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📘 API Docs available at: http://localhost:${PORT}/api-docs`);
});
