import { ObjectId } from "mongodb";
import {Database} from "./database.js";
import { MailService } from "./mail-service.js";
import { pickColor } from "./pick-color.js";
import { Helper } from "./helper.js";

export class Endpoints{
    userData = new Object();
    db = new Database();
    ms = new MailService()
    h = new Helper();

    constructor(){}

 async authorization (req, res) {

    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const user = { email:email, code: verificationCode, isActive: false, bgColor: pickColor(),isFirstSign:true };
    const userCollection = this.db.usersCol();
    const userExist = await userCollection.findOne({ email:email });
    
    if(userExist && userExist.isActive){
        return res.status(200).json({status:"Already", message: 'User already connected' });
    }

    if(userExist){
        await userCollection.updateOne({ _id: userExist._id }, { $set: { code: verificationCode }}); 
    }else{
        await userCollection.insertOne(user);
    }

    this.ms.sentMail(email,verificationCode,res)
}

async verification(req,res){
    const {code,email}  = req.body;
    this.userData = {code, email}
    const userCollection = this.db.usersCol();
    const verification = await userCollection.findOne({ email, code });
  
    if (!verification) {
      return res.status(400).json({status:"Error", message: 'Invalid verification code' });
    }

    if(verification.isActive){
        return res.status(200).json({status:"Already", message: 'User already connected' });
    }
          
    this.userData['id'] = verification._id;
    res.status(200).json({status:"Ok", message: 'Verification code is valid' });

    await userCollection.updateOne({ _id: verification._id }, { $set: { code: null }});
    this.h.setUserProperty(email, {isFirstSign: false})
}

async logOut(req,res){
    const { id }  = req.body;
    const userCollection = this.db.usersCol();
    const objId = new ObjectId(id)
    const user = await userCollection.findOne({ _id:objId });
  
    if (!user) {
      return res.status(400).json({ message: 'Error' });
    }
  
    res.status(200).json({ message: 'Log out' });
}

async getUserId(req,res){
    if(!this.userData['id']){
        return res.status(400).json({ message: 'Error' });
    }

    return res.status(200).json({ id: this.userData['id'] });
}

async getAllUsers(req,res){
    const id = new ObjectId(req.params.id)
    const userCollection = this.db.usersCol();
    const allUsers = await userCollection.find({ _id: { $ne: id } }).toArray()

    return res.status(200).json({status:"Ok", data:allUsers})
}

async chatData(req,res){
    const data = req.body
    const messages = this.db.messagesCol()
    const isChat = await messages.findOne({
        $or: [
            { firstUser: data.firstUser, secondUser: data.secondUser },
            { firstUser: data.secondUser, secondUser: data.firstUser }
        ]
    })
    
    if(!isChat){
        await messages.insertOne(data);
        let newChat = await messages.findOne({ firstUser:data.firstUser, secondUser:data.secondUser })
        return res.status(200).json({status:"Ok", data: {chatId: newChat['_id']}});
    }


    
    if(isChat.messagesData){
        var messagesNew = isChat.messagesData.map((x)=>{
            return {
                userId:x.user,
                message:x.message,
                fromMe:x.user == data['secondUser']
            }
        })
    }
    
    return res.status(200).json({status:"Ok", data:{chatId:isChat['_id'],messages:(isChat.messagesData ? messagesNew : [])}})
}


}
// function (err,data)  {
//     this.db.clientClose()
//     if(err) console.log(JSON.stringify(err))
//     else console.log("updateOne")
// }