const createError = require("../helper/error")
const user=require("../models/user")
const jwt=require("jsonwebtoken")
const merchant = require("../models/merchant");
const Category = require("../models/category");
const Deal = require("../models/deals");
const sequelize=require("../models/index");
const deal = require("../models/deals");
const mail = require("../helper/mailer");
const { Op,NOW } = require("sequelize");
//utility functions
const verifyToken=async(req,res,next)=>{
    try
    {   
        let token=req.body.token
        if (!token) throw next(createError(401,"ERROR","Invalid Token"))
        jwt.verify(token, process.env.JWT_SECERETE, (err, id) => {
    
        if (err) throw next(createError(200, "ERROR", "Token Expired", 401));
        const verifyId = user.findOne({ where: { user_id: id.id } });
        if (!verifyId)
            throw next(createError(200, "ERROR", "Invalid User", 401));
        req.id = id.id;
        });
            next()
}catch(err){
    console.log(err)
    next(err)
}
}

//User registraion
const userRegister=async(req,res,next)=>{
    try {
        const deviceToken=req.body.device_token
        if(!deviceToken)throw next(createError(200,"ERROR","Invalid token",401))
        let data;
        const [result]=await user.findOrCreate({where:{device_token:deviceToken}})
        const auth_token=jwt.sign({id:deviceToken},process.env.JWT_SECERETE,{expiresIn:'24h'})
        data={
            "user_id": result.user_id   , 
            "user_name": result.user_name,
            "email": result.email, 
            "contact": result.contact, 
            "identity": result.identity,
            "auth_token":auth_token,
            "device_token":result.device_token
        }
            res.status(200).json({
                "status": "OK",
                "message": "User registered successfully",
                "data": data
            })
    } catch (err) {
        next(err)
    }
}

//edit user
const editUser=async(req,res,next)=>{
    try {
        const deviceToken=req.id
        const {email,identity,name}=req.body
        const [rowupdates,updatedUser]= await user.update({
            email,
            identity,
            user_name:name
        },{where:{device_token:req.id},returning:false,individualHooks:true}
    )
    const data=updatedUser.map(result=>({
        "user_id": result.user_id, 
        "user_name": result.user_name, 
        "email": result.email, 
        "contact": result.contact, 
        "identity":result.identity, 
        "device_token":result.dev, 
        "auth_token": req.body.token    
    }))
    res.status(200).json({
        "status":"OK",
        "message": "User updated successfully",
        "data":data[0]
    })
    }catch(err){
        next(err)
    }
}

//filter deals
const filterDeals=async(req,res,next)=>{
    try {
        const lat=req.body.latitude;
        const long=req.body.longitude;
        const radius=req.body.radius/1000;
        const country=req.body.country;
        const category=req.body.category_id;
        const limit=req.body.limit/10;  
        const filterDeals = await merchant.findAll({
            attributes: {
                include: [
                    [sequelize.literal(`
                        6371 * acos(
                            cos(radians(${lat})) * 
                            cos(radians(latitude)) * 
                            cos(radians(longitude) - radians(${long})) + 
                            sin(radians(${lat})) * 
                            sin(radians(latitude))
                        )
                    `), 'distance']
                ]
            },
            having: sequelize.literal(`distance < ${radius}`),
            where:{country},
            include:{
                model:deal,
                attributes:[
                    'deal_id',
                    'category_id',
                    'merchant_id',
                    'date_from',
                    'date_to',
                    'description1',
                    'description2',
                    'description3',
                    'normal_price',
                    'offer_price',
                    'time_from',
                    'time_to',
                    'type',
                    'image',
                    [sequelize.literal(`(normal_price-offer_price)/normal_price`),'discount']
                ], 
                required:true,
                where:{
                        category_id:category,
                        date_to:{[Op.gte]:sequelize.literal('NOW()')}
                },
                order:sequelize.literal('discount DESC'),
                limit:limit
            },
        });
        const deals = filterDeals.flatMap(merchant => 
            merchant.deals.map(deal => ({
                deal_id: deal.deal_id,
                distance: merchant.dataValues.distance,
                merchant_id: merchant.merchant_id,
                category_id: deal.category_id,
                deal_type: deal.type,
                description1: deal.description1,
                description2: deal.description2,
                description3: deal.description3,
                from_time: deal.time_from,
                to_time: deal.time_to,
                from_date: deal.date_from,
                to_date: deal.date_to,
                normal_price: deal.normal_price,
                offer_price: deal.offer_price,
                image: deal.image,
                category_name: deal.category_id,
                email: merchant.email,
                contact: merchant.mobile,
                business_name: merchant.business_name,
                business_address1: merchant.business_address_1,
                business_address2: merchant.business_address_2,
                country: merchant.country,
                currency: merchant.currency,
                currencyvalue: merchant.currency_value,
                package: merchant.package,
                latitute: merchant.latitude,
                longitude: merchant.longitude,
                referal_code: merchant.referal_code,
                auth_token:'',
                business_image: merchant.image
            }))
        );

        const response = {
            status:"OK",
            message:"list of Deals",
            data:{
                deal: deals,
                setting: [
                    { name: "", value: "" },
                    { name: "", value: "" }
                ]
            },
            
        };
        res.status(200).json(response)
    } catch (err) {
        console.log(err)
        next(err)
    }
}

//send email
const sendEmail=async(req,res,next)=>{
    try {
        let sender=req.body.sender;
        let receiver=req.body.receiver;
        const to_name=req.body.to_name;
        const from_name=req.body.from_name;
        sender=from_name+"<"+sender+">";
        receiver=to_name+"<"+receiver+">";
        const code=req.body.code;
        let content=req.body.content
        content=`<div>${content}<br>${code}</br></div>`
        const info=await mail.mailSender(sender,receiver,'',content)
        return res.status(200).json({
            "status":"OK",
            "message":"Email sent successfully",
            "code":200,
            "info":info
        })
    } catch (err){
        next(err)
    }
}
//generate token
const generateToken=async(req,res,next)=>{
    try {
        let data=await user.findOne({where:{device_token:req.id}})
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let referal=""
        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            referal += charset[randomIndex];
        }
        data={ 
            "user_id": data.user_id, 
            "user_name": data.user_name, 
            "email": data.email, 
            "contact": data.contact,
            "identity": data.identity, 
            "device_token":data.device_token, 
            "auth_token": req.body.token,
            "referral":referal
        }
        return res.status(200).json({
            "status":"OK",
            "message":"Token generated successfully",
            data
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
}

module.exports={
    userRegister,
    editUser,
    verifyToken,
    filterDeals,
    sendEmail,
    generateToken
}