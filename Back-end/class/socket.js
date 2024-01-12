import {Endpoints} from "./endpoints.js"
import {Server} from "socket.io"
import {createServer} from "http"
import { Helper } from "./helper.js"

export class Socket{
  ep = new Endpoints()
  h = new Helper()
  userSocketMap = {};
  connectedUsers = {};
  

  constructor(){
    this.server = createServer();
    this.io = new Server(this.server);

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

      socket.on('joinRoom',async (room)=>{
        socket.join(room)
        socket.on('sendMessage',async (data)=>{
          const {chatId ,senderId, receiverId, message } = data;
          await this.h.updateMessagesInDb(data)
          this.io.to(room).emit('receiveMessage', { userId:senderId, message,fromMe:false,chatId });
          this.io.to(room).emit('messageTyping', { typing:false,chatId });
        })

        socket.on('messageTyping', async (data) => {
          const {chatId, receiverId, msg } = data;
          let isTyping = msg != '' ? true : false
          this.io.to(room).emit('messageTyping', { typing:isTyping,chatId });
        })

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

