import {Endpoints} from "./endpoints.js"
import {Server} from "socket.io"
import {createServer} from "http"
import { Helper } from "./helper.js"

export class Socket{
  ep = new Endpoints()
  h = new Helper()
  userSocketMap = {};
  connectedUsers = {};
  server = createServer();

  constructor(){
    this.io = new Server(this.server, {
      cors: {
        origin: 'https://chat-app-tornike-melikishvili.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true,
      }
    });

    this.ioSet()
  }

  ioSet(){
    this.io.on("connection", (socket) => {
      
      console.log('A user connected',socket.id);

      socket.on('registerUser', async (userId) => {
        this.userSocketMap[userId] = socket.id;
        
        this.connectedUsers[userId] = true
        this.io.emit('updateActiveUsers', this.connectedUsers,await this.h.findUser(userId));

        await this.h.userActiveOrNot(userId, true);
      });

      socket.on('userInactive',async (userId) => {
        delete this.connectedUsers[userId]
        this.io.emit('updateActiveUsers', this.connectedUsers);
        await this.h.userActiveOrNot(userId, false);

      });

      socket.on('sendMessage',async (data)=>{
        const {chatId ,senderId, receiverId, message } = data;
        const receiverSocketId = this.userSocketMap[receiverId];
        
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('receiveMessage', { userId:senderId, message,fromMe:false });
          this.h.updateMessagesInDb(data)
        } else {
          console.log('Receiver socket not found');
        }
      })
      
      socket.on('disconnect', () => {
          Object.keys(this.userSocketMap).forEach( userId => {
            if (this.userSocketMap[userId] === socket.id) {
              delete this.userSocketMap[userId];
              console.log(`User ${userId} disconnected`);
            }
          });
      });
  
    });
  }

  ioAttach(httpServer){
    this.io.attach(httpServer);
  }

}

