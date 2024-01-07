import {MongoClient} from 'mongodb'

export class Database{
    client;

    constructor(){
        this.connectDb()
    }

    async connectDb() {
        const uri = "mongodb://localhost:27017";
        this.client = new MongoClient(uri);
        try {
            await this.client.connect();
    
            console.log("You successfully connected to MongoDB!")
        } catch (e) {
            console.error(e);
        } 
    }
    
    clientClose(){
        return this.client.close()
    }
    
    usersCol(){
        const db = this.client.db("chatApp")
        return db.collection('users');
    }
    
    messagesCol(){
        const db = this.client.db("chatApp")
        return db.collection('messages');
    }
}

