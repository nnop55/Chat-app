import {Database} from "./database.js";
import { ObjectId } from "mongodb";

export class Helper{

    db = new Database();

    constructor(){}

    async userActiveOrNot(id, active){
        const userCollection = this.db.usersCol();
        const objId = new ObjectId(id)
        await userCollection.updateOne({ _id: objId}, { $set: { isActive: active }}); 
    }

    async findUser(id){
        const userCollection = this.db.usersCol();
        const objId = new ObjectId(id)
        const user = await userCollection.findOne({ _id: objId}); 
        return user['isFirstSign'] ? user : null
    }

    async updateMessagesInDb(data){
        const messages = this.db.messagesCol();
        const objId = new ObjectId(data['chatId'])
        const chat = await messages.findOne({ _id: objId })

        if(!chat.messagesData){
            chat.messagesData = []
        }

        chat.messagesData.push({user:data['senderId'], message:data['message']})
        await messages.updateOne({ _id: objId }, { $set: { messagesData: chat.messagesData }});
        // return chat
    }

    async setUserProperty(email,row){
        setTimeout(async () => {
            const userCollection = this.db.usersCol();
            await userCollection.updateOne({ email: email }, { $set: row});
        },10000)
    }
}