import express from 'express'
import {createServer} from 'http'
import {Socket} from './class/socket.js'
import bodyParser from 'body-parser'
import cors from 'cors'
import {Endpoints} from './class/endpoints.js'
import {MailService} from './class/mail-service.js'
import {Database} from './class/database.js'

class App{
    app = express()
    httpServer = createServer(this.app);
    s = new Socket();
    ms = new MailService();
    db = new Database();
    ep = new Endpoints();

    constructor() {
        this.app.use(cors({
          origin: ['https://chat-app-tornike-melikishvili.vercel.app'],
          methods: ['GET,POST'],
          credentials: true,
        }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    
        this.ms.transporterVerify();
    
        this.setupRoutes();
    
        const PORT = process.env.PORT || 5000;
    
        this.httpServer.listen(PORT,() => {
          this.db.connectDb();
          console.log(`HTTP Server started`);
        });
    
        this.s.ioAttach(this.httpServer);
      }
    
      setupRoutes() {
        this.app.post('/send-verification', async (req, res) => {
          await this.ep.authorization(req, res);
        });
    
        this.app.post('/verify-code', async (req, res) => {
          await this.ep.verification(req, res);
        });
    
        this.app.post('/log-out', async (req, res) => {
          await this.ep.logOut(req, res);
        });
    
        this.app.get('/get-user-id', async (req, res) => {
          await this.ep.getUserId(req, res);
        });
    
        this.app.get('/get-all-users/:id', async (req, res) => {
          await this.ep.getAllUsers(req, res);
        });

        this.app.post('/chat-data', async (req, res) => {
          await this.ep.chatData(req, res);
        });
      }
}
new App()