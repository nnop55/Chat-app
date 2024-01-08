import nodemailer from "nodemailer"
import { config } from 'dotenv';

config();

export class MailService{

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'appchat194@gmail.com',
            pass: process.env.NODE_MAILER_PASS
        }
    });

    constructor(){}
    
    sentMail(email,verificationCode,res){
        const mailMessage = {
            from: 'appchat194@gmail.com',
            to: email,
            subject: 'Verify code from chat application',
            text: 'Code: ' + verificationCode
        };
    
        this.transporter.sendMail(mailMessage, function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log('Nodemailer Email sent: ' + success.response);
                res.status(200).json({ message: 'Verification code sent successfully' });
            }
        });
    }
    
    transporterVerify(){
        this.transporter.verify(function (error, success) {
            if(error) {
                console.log(error);
            } else {
                console.log('Server validation done and ready for messages.')
            }
        });
    }
}

