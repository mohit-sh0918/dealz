const {Validator}=require('node-input-validator')
const jwt=require("jsonwebtoken");
const merchant = require('../../models/merchant');
const { where } = require('sequelize');
require("dotenv").config();


//validation for registration of new user
const addNewUser= async(req,res,next)=>{
    let validator=new Validator(req.body,{
        device_token:'required',
        email:'required|email',
        password:'required',
        business_name:'required',
        business_address1:'required',
        business_address2:'required',
        mobile:'required',
        country:'required',
        currency:'required',
        currencyvalue:'required',
        _package:'required',
        latitude:'required',
        longitude:'required',
    });
    validator.check().then((matched)=>{
        if(!matched){
            res.status(400).send({
                message: (Object.values(validator.errors))[0].message,
                status: "false",
                data: []
            })
        }
        else{next()}
    });
}

//validation for merchant login
const loginNewUser= async(req,res,next)=>{
    let validator=new Validator(req.body,{
        email:'required|email',
        password:'required',
        device_token:'required'
    });
    validator.check().then((matched)=>{
        if(!matched){
            res.status(400).send({
                message: (Object.values(validator.errors))[0].message,
                status: "false",
                data: []
            })
        }
        else{next()}
    });
}

//verify token
const verifyToken=async(req,res,next)=>{
    let token=req.body.token
    if (!token) {
        return res.status(400).json({
        status: 400,
        message: "Token is required",
        data: {},
        });
    }
    try
    {
        const id=jwt.verify(token,process.env.JWT_SECERETE )
        const verifyId=await merchant.findOne({where:{merchant_id:id.id}})
        if(!verifyId){
            return res.status(400).json({
                status:400,
                message:"token is invalid",
                data:{}
            })
        }
        req.id=id.id
            next()
}catch(err){
    res.status(500).json({
        status:500,
        message:"Internal server error",
        data:{}
    })
}
}

//exporting Modules
module.exports={
    addNewUser,
    loginNewUser,
    verifyToken
}