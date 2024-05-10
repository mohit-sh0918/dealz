const {Validator}=require('node-input-validator')
const jwt=require("jsonwebtoken");
const merchant = require('../../models/merchant');
const { where } = require('sequelize');
const createError = require('../../helper/error');
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
    try
    {   
        let token=req.body.token
        if (!token) throw next(createError(500,"Invalid Token"))
        const verifyToken=jwt.decode(token)
        const expiryTime=verifyToken.exp*1000;
        if(Date.now()>expiryTime)throw next(createError(404,"Invalid User"))
        const id=jwt.verify(token,process.env.JWT_SECERETE )
        const verifyId=await merchant.findOne({where:{merchant_id:id.id}})
        if(!verifyId)throw new Error("Invalid token")
        req.id=id.id
            next()
}catch(err){
    next(err)
}
}

//verify addDeal
const addDeal = async (req, res, next) => {
    let validator = new Validator(req.body, {
        type: 'required',
        description1: 'required',
        time_to: 'required',
        time_from: 'required',
        date_from: 'required',
        date_to: 'required',
        category: 'required',
        normal_price: 'required',
        offer_price: 'required',
        token: 'required',
        description2: 'required',
        description3: 'required'
    });

    validator.check().then((matched) => {
        if (!matched) {
            res.status(400).send({
                message: (Object.values(validator.errors))[0].message,
                status: "false",
                data: []
            });
        } else {
            next();
        }
    });
};

//verify Edit Deal
const editDeal = async (req, res, next) => {
    let validator = new Validator(req.body, {
        deal_id:'required',
        type: 'required',
        description1: 'required',
        time_to: 'required',
        time_from: 'required',
        date_from: 'required',
        date_to: 'required',
        category: 'required',
        normal_price: 'required',
        offer_price: 'required',
        token: 'required',
        description2: 'required',
        description3: 'required'
    });

    validator.check().then((matched) => {
        if (!matched) {
            res.status(400).send({
                message: (Object.values(validator.errors))[0].message,
                status: "false",
                data: []
            });
        } else {
            next();
        }
    });
};
//exporting Modules
module.exports={
    addNewUser,
    loginNewUser,
    verifyToken,
    addDeal,
    editDeal
}