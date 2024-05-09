const nodemailer=require("nodemailer")
const config = require('../config/otherconfig.json')

const mailSender=async(email,title,body)=>{
    try{
        let transporter=nodemailer.createTransport ({
            host:'smtp.gmail.com',
            auth:{
                user:"cisbackend@gmail.com",
                pass:"hkhg cjkv kdla fvpd"

            },
            tls: { rejectUnauthorized: false }
        })

        let info= await transporter.sendMail({
            from:'cisbackend@gmail.com',
            to:`mohit.sh@cisinlabs.com`,
            subject:title,
            text:`${body}`
        })
        return info;
    }catch(err){
        console.log(err)
    }
}

module.exports={
    mailSender
}