    const nodemailer=require("nodemailer")
    const config = require('../config/otherconfig.json')

    const mailSender=async(from,email,title,body)=>{
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
                from:from,
                to:email,
                subject:title,
                html:`${body}`
            })
            return info;
        }catch(err){
            console.log(err)
        }
    }

    module.exports={
        mailSender
    }