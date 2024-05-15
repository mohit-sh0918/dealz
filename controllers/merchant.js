const merchant = require("../models/merchant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const { where } = require("sequelize");
const internal = require("stream");
const baseUrl = "https://dealz-2mm8.onrender.com/";
const mail=require("../helper/mailer");
const OTP = require("../models/otp");
const crypto = require("crypto");
const { throws } = require("assert");
const countryCode=require("../config/csvjson.json");
const createError = require("../helper/error");
const Category=require("../models/category")
const Deal=require("../models/deals");
const member = require("../models/member");
const deal = require("../models/deals");

//utility functions
function generateOTP() {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
function jsToEpoch(date) {
  const currentDate = new Date(date);
  const epochTime = currentDate.getTime();
  return epochTime;
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const uploadImg = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: async function (req, file, cb) {
    try {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error("Only JPG, JPEG, and PNG files are allowed!"));
      }
      if (file.size > 2 * 1024 * 1024) {
        return cb(new Error("File size exceeds 2MB limit!"));
      }
      cb(null, true);
    } catch (error) {
      cb(error, true);
      console.log("Error", error);
    }
  },
});
const getCountryCode=async(req,res,next)=>{
  try {
      const data=[];
      for(i in countryCode)
          data.push({
              "country_id": countryCode[i].ID, 
              "code": countryCode[i].CountryCode, 
              "name": countryCode[i].ValueEn,
              "currency": countryCode[i].CurrencyCode })
      return res.status(200).json({
          status:"OK",
          message:"",
          data:data
      })
  }catch(err){
      next(err)
  }
}

//registering Merchants
const register = async (req, res,next) => {
  //check if merchant exists
  try {
    const data = req.body;
    const merchantExists = await merchant.findOne({
      where: { email: data.email },
    });
    if (merchantExists) throw next(createError(400,"merchant exists"))
    //bcrypting the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(data.password, salt);

    //creating image url and creating merchant
    const fileName = req.file.filename;
    const imageUrl = baseUrl + fileName;
    const newData = { ...data, password: hash, image: imageUrl };

    //creating new merchant
    const newMerchant = await merchant.create(newData);
    //generating authtoken using merchant id
    const auth_token = jwt.sign(
      { id: newMerchant.merchant_id },
      process.env.JWT_SECERETE,
      { expiresIn: "24h" }
    );
    //sending response
    return res.status(201).json({
      status: "OK",
      message: "Merchant created successfully",
      data: {
        merchant_id: newMerchant.merchant_id,
        email: newMerchant.email,
        contact: newMerchant.mobile,
        business_name: newMerchant.business_name,
        business_address1: newMerchant.business_address1,
        business_address2: newMerchant.business_address2,
        country: newMerchant.country,
        currency: newMerchant.currency,
        currencyvalue: newMerchant.currencyvalue,
        _package: newMerchant._package,
        image: newMerchant.image,
        latitude: newMerchant.latitude,
        longitude: newMerchant.longitude,
        referral_code: newMerchant.referral_code || "",
        auth_token: auth_token,
        type: newMerchant.type || "",
        parent_id: newMerchant.parent_id || "",
        subscription: newMerchant.subscription || "",
        expiry: newMerchant.expiry || "",
        is_expired: newMerchant.is_expired || "",
        trial_period: newMerchant.trial_period || "",
      },
    });
  } catch (err) {
    next(err)
  }
};

//login Merchant
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userMerchant = await merchant.findOne({ where: { email: email } });

    if (!userMerchant) throw new Error("No User found")
    const isCorrect = await bcrypt.compare(password, userMerchant.password);
    if (!isCorrect) throw new Error("Invalid Credentials")
    const auth_token = jwt.sign(
      { id: userMerchant.merchant_id },
      process.env.JWT_SECERETE,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      status:"OK",
      message: "Merchant logged In successfully",
      data: {
        merchant_id: userMerchant.merchant_id,
        email: userMerchant.email,
        contact: userMerchant.mobile,
        business_name: userMerchant.business_name,
        business_address1: userMerchant.business_address1,
        business_address2: userMerchant.business_address2,
        country: userMerchant.country,
        currency: userMerchant.currency,
        currencyvalue: userMerchant.currencyvalue,
        _package: userMerchant._package,
        image: userMerchant.image,
        latitude: userMerchant.latitude,
        longitude: userMerchant.longitude,
        referral_code: userMerchant.referral_code || "",
        auth_token: auth_token,
        type: userMerchant.type || "",
        parent_id: userMerchant.parent_id || "",
        subscription: userMerchant.subscription || "",
        expiry: userMerchant.expiry || "",
        is_expired: userMerchant.is_expired || "",
        trial_period: userMerchant.trial_period || "",
      },
    });
  } catch (err) {
    return res.status(404).json({
      status:false,
      code:1052,
      message: err.message
    })
  }
};

//get profile of merchant
const merchantProfile = async (req, res,next) => {
  try {
    const id = req.id

    const userMerchant = await merchant.findOne({
      where: { merchant_id: id },
    });
    if (!userMerchant) throw next(404,"Merchant not found")
    return res.status(200).json({
      status: "OK",
      message: "Merchant profile",
      data: {
        merchant_id: userMerchant.merchant_id,
        email: userMerchant.email,
        contact: userMerchant.mobile,
        business_name: userMerchant.business_name,
        business_address1: userMerchant.business_address1,
        business_address2: userMerchant.business_address2,
        country: userMerchant.country,
        currency: userMerchant.currency,
        currencyvalue: userMerchant.currencyvalue,
        _package: userMerchant._package,
        image: userMerchant.image,
        latitude: userMerchant.latitude,
        longitude: userMerchant.longitude,
        referral_code: userMerchant.referral_code || "",
        auth_token: req.body.token,
        type: userMerchant.type || "",
        parent_id: userMerchant.parent_id || "",
        subscription: userMerchant.subscription || "",
        expiry: userMerchant.expiry || "",
        is_expired: userMerchant.is_expired || "",
        trial_period: userMerchant.trial_period || "",
      },
    });
  } catch (err) {
    next(err)
  }
};

//change merchant password
const changePassword = async (req,res,next) => {
  try {
    const { old_password, new_password } = req.body;
    const id=req.id
    const userMerchant = await merchant.findOne({
      where: { merchant_id: id },
    });
    const isCorrect = await bcrypt.compare(old_password, userMerchant.password);
    if (!isCorrect) throw next(400,"Invalid Password")
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hashSync(new_password, salt);
    await merchant
      .update({ password: hash }, { where: { merchant_id: id} })
      .then((result) => {
        res.status(200).json({
          status: "OK",
          message: "Password changed successfully",
        });
      });
  } catch (err) {
    next(err)
  }
};
//edit merchant profile
const editMercantProfile=async(req,res,next)=>{
  try {
    const data=req.body;
    const id=req.id
    const fileName = req.file.filename;
    const imageUrl = baseUrl + fileName;
    const newdata={...data,image:imageUrl}
    await merchant.update(newdata,{where:{merchant_id:id}})
    const userMerchant=await merchant.findOne({where:{merchant_id:id}})
    res.status(200).json({
      status: "OK",
      message: "Profile updated successfully",
      data:{
        merchant_id: userMerchant.merchant_id,
        email: userMerchant.email,
        contact: userMerchant.mobile,
        business_name: userMerchant.business_name,
        business_address1: userMerchant.business_address1,
        business_address2: userMerchant.business_address2,
        country: userMerchant.country,
        currency: userMerchant.currency,
        currencyvalue: userMerchant.currencyvalue,
        _package: userMerchant._package,
        image: userMerchant.image,
        latitude: userMerchant.latitude,
        longitude: userMerchant.longitude,
        referral_code: userMerchant.referral_code || "",
        auth_token: req.body.token,
        type: userMerchant.type || "",
        parent_id: userMerchant.parent_id || "",
        subscription: userMerchant.subscription || "",
        expiry: userMerchant.expiry || "",
        is_expired: userMerchant.is_expired || "",
        trial_period: userMerchant.trial_period || "",
      }
    });
    
  } catch (err) { 
    next(err)
  }
}
//forget password
const forgetPassword=async(req,res,next)=>{
  try{
    const email=req.body.email;
    if(!email)throw next(404,"Invalid Credentials")
    const merchant_id=await merchant.findOne({
      attributes:[
        'merchant_id'
      ],
      where:{
        email:email
      }
    })
    if(!merchant_id)throw next(404,"Invalid Credentials");
    const otp=generateOTP()
    const date1 = new Date();
    const finalDate = jsToEpoch(date1) + 10 * 60 * 1000;
    const token=crypto.randomBytes(20).toString("hex")
    
    var data={
      otp:otp,
      expire_time:finalDate,
      merchant_id:merchant_id.merchant_id,
      token:token,
    }
    OTP.create(data)
    .then((result=>{
      mail.mailSender(email,'Reset Password',`OTP for resetting the Password is ${otp}`)
      .then((data)=>{
        return res.status(200).json({
          status:200,
          message:"OTP sent to your email",
          data:data
        })
      })
    }))
  }catch(err){
    next(err)
  }
}

//add deals 
const addDeal=async(req,res,next)=>{
  try {
      const token_id =req.id;
      const fileName = req.file.filename;
      const imageUrl = baseUrl + fileName;
      const deal=req.body;
      const newDeal={
        ...deal,
        user_id:token_id,
        category_id:deal.category,
        image:imageUrl,
      }
      await Deal.create(newDeal)
      .then((result)=>{
        res.status(200).json({
          status:"OK",
            message:"Deal added successfully",
        })
      })
  } catch (err) {
      next(err)
  }
}

//edit deals
const editDeal=async(req,res,next)=>{
  try {
      // const isDeal_id=await Deal.findOne({where:{deal_id:req.body.deal_id}})
      // if(!isDeal_id)throw next(createError(400,"invalid deal id"))
      const token_id =req.id
      const fileName = req.file.filename;
      const imageUrl = baseUrl + fileName;
      const category=req.body.category;
      const category_id=await Category.findOne({where:{name:category}});
      const deal=req.body;
      const newDeal={
        ...deal,
        user_id:token_id,
        category_id:category_id.category_id,
        image:imageUrl,
      }
      await Deal.update(newDeal,{where:{deal_id:req.body.deal_id}})
      .then((result)=>{
        res.status(200).json({
          status:"OK",
            message:"Deal updated successfully",
        })
      })
  } catch (err) {
      next(err)
  }
}
//delete deal
const deleteDeal=async(req,res)=>{
  try {
    // const auth=await Deal.findOne({where:{user_id:token_id.id}})
    // if(!auth)throw next(createError(404,"Unauthroised access"))
    const verifyDeal=await Deal.findOne({where:{deal_id:req.body.deal_id}})
      if(!verifyDeal) throw Error("No deal found")
    await Deal.destroy({where:{deal_id:req.body.deal_id}})
    .then((result)=>{
      res.status(200).json({
        status:"OK",
          message:"Deal deleted successfully",
    })
  })
  } catch (err) {
    return res.status(500).json({
      status:false,
      message:err.message
    })
  }
}
//get category
const getCategory=async(req,res,next)=>{
  try {
    const category=await Category.findAll()
    res.status(200).json({
      status:"OK",
      message:"All the Category",
      data:{
        category:category
      }
    })
  } catch (err) {
    next(err)
  }
}
//add memeber
const addMember=async(req,res,next)=>{
  try {
    //check if memeber is a merchant
    const pass=bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10))
    const data={...req.body, merchant_id:req.id,password:pass}
    const newMember=await member.create(data)
    .then((result)=>{
      res.status(200).json({
        status:"OK",
        message:"Member added successfully",
      })
    })
  } catch (err) {
    next(err)
  }
}
//edit member
const editMember=async(req,res,next)=>{
  try {
    const data=req.body;
    const member_id=await member.findOne({where:{id:data.member_id}})
    console.log(member_id)
    if(!member_id)
      throw next(createError(400,"Invalid Credentials"))
    if(req.id!=member_id.merchant_id)
      throw next(createError(404,"Unauthorised Access"))
    const pass=bcrypt.hashSync(data.password,bcrypt.genSaltSync(10))
    const newData={...data,password:pass}
    const newMember=await member.update(newData,{where:{id:data.member_id}})
    .then((newMember)=>{
      res.status(200).json({
        status:"OK",
        message:"Member updated successfully",
      })
    })
  }catch(err){
    next(err)
  }
}
//delete member
const deleteMember=async(req,res,next)=>{
  try{
    const data=req.body;
    const findMember=await member.findOne({where:{id:data.member_id}})
    if(!findMember)throw next(createError(400,"Invalid Member"))
    if(req.id!=findMember.merchant_id)throw next(createError(404,"Unauthorised Access"))
    await member.destroy({where:{id:data.member_id}})
  .then((result)=>{
    res.status(200).json({
      status:"OK",
      message:"Member deleted successfully"
    })
  })
  }catch(err){
    next(err)
  }
}
//get all members
const getAllMember=async(req,res,next)=>{
  try {
    const findMember=await member.findAll({where:{merchant_id:req.id}})
    if(!findMember)throw next(createError(400,"No Member Found"))
    const data=[]
    for(i in findMember)
      data[i]={
          parent_id:findMember[i].id,
          name:findMember[i].name,
          email:findMember[i].email,
          merchant_id:findMember.merchant_id,
          password:findMember[i].password
        }
    res.status(200).json({
      status:"OK",
      message:"Members Found",
      data:data
    })
  } catch (err) {
    next(err)
  }
}
//get all deals
const getAllDeals=async(req,res,next)=>{
  try {
    const data = await deal.findAll({where:{user_id:req.id}})
    console.log(data)
  }catch(err){

  }
}
module.exports = {
  register,
  uploadImg,
  login,
  merchantProfile,
  changePassword,
  forgetPassword,
  getCountryCode,
  addDeal,
  editDeal,
  deleteDeal,
  getCategory,
  editMercantProfile,
  addMember,
  editMember,
  deleteMember,
  getAllMember,
  getAllDeals
}; 