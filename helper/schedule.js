const { Op } = require("sequelize");
const OTP=require('../models/otp')
const corn=require('node-cron')

const deleteOtp=corn.schedule('*/1 * * * *',async()=>{
    const currentTime=new Date();
    try {
        await OTP.destroy({where:{
            expire_time:{
                [Op.lt]:currentTime.getTime(),
            }
        }})
        console.log("deleted otp")
    } catch (err) {
        console.log(err)
    }
})

module.exports={
    deleteOtp
}