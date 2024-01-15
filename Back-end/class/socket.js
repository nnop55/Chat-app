import { Endpoints } from "./endpoints.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { Helper } from "./helper.js";

export class Socket {
  ep = new Endpoints();
  h = new Helper();
  userSocketMap = {};
  connectedUsers = {};
  userConversations = {};

  constructor() {
    this.server = createServer();
    this.io = new Server(this.server);

    this.ioSet();
  }

  ioSet() {
    this.io.on("connection", (socket) => {
      console.log('A user connected', socket.id);
      
      
      socket.on('registerUser', async (userId) => {
        this.userSocketMap[userId] = socket.id;
        this.connectedUsers[userId] = true;

        this.io.emit('updateActiveUsers', this.connectedUsers, await this.h.findUser(userId));
        await this.h.userActiveOrNot(userId, true);
      });

      socket.on('userInactive', async (userId) => {
        delete this.connectedUsers[userId];
        this.io.emit('updateActiveUsers', this.connectedUsers);
        await this.h.userActiveOrNot(userId, false);
      });

      socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, message } = data;
        await this.h.updateMessagesInDb(data);
        if (this.connectedUsers[senderId] && this.connectedUsers[receiverId]) {
          const conversationKey = this.getConversationKey(senderId, receiverId);
          let fromMe = senderId == cookieUserId
          this.io.to(this.userConversations[conversationKey]).emit('sendMessage', { userId: senderId, message });
        }
      });

      socket.on('startConversation', async (data) => {
        const { senderId, receiverId } = data;
        const conversationKey = this.getConversationKey(senderId, receiverId);

        this.userConversations[conversationKey] = this.userConversations[conversationKey] || [];
        this.userConversations[conversationKey].push(socket.id);
      });

      socket.on('messageTyping', async (data) => {
        const { senderId, receiverId, msg } = data;
        let isTyping = msg !== '';
        if (this.connectedUsers[senderId] && this.connectedUsers[receiverId]) {
          const conversationKey = this.getConversationKey(senderId, receiverId);
          this.io.to(this.userConversations[conversationKey]).emit('messageTyping', { typing: isTyping, userId:senderId });
        }
      });

      socket.on('disconnect', () => {
        const userId = Object.keys(this.userSocketMap).find((userId) => this.userSocketMap[userId] === socket.id);
        if(userId) {
          delete this.userSocketMap[userId];

          this.removeUserFromConversations(userId);

          console.log(`User ${userId} disconnected`);    
        }
      });
    });
  }

  ioAttach(httpServer) {
    this.io.attach(httpServer);
  }

  getConversationKey(user1, user2) {
    return [user1, user2].sort().join('-');
  }

  removeUserFromConversations(userId) {
    Object.keys(this.userConversations).forEach((conversationKey) => {
      this.userConversations[conversationKey] = this.userConversations[conversationKey].filter(
        (socketId) => socketId !== this.userSocketMap[userId]
      );

      if (this.userConversations[conversationKey].length === 0) {
        delete this.userConversations[conversationKey];
      }
    });
  }

}
