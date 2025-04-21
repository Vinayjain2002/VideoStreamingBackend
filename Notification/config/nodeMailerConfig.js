import { text } from 'express';
import nodemailer from 'nodemailer';


async function sendEmail(subject, body, recipients) {
    try{
        const transporter= nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions= {
            from: process.env.GMAIL,
            to: Array.isArray(recipients) ? recipients.join(',') : recipients,
            subject: subject,
            text: body
        };
        
        const info= await transporter.sendMail(mailOptions);
        console.log("Email Sent Successfully", info.response);
    }   
    catch(err){
        console.log("Error Sending the Emails",err);
    } 
}

export default sendEmail;


// use case 
// sendEmail(
//     'Hello from Node.js!',
//     'This is a test email sent using a reusable function!',
//     ['recipient1@example.com', 'recipient2@example.com']
//   );