    const merchant=require("../models/merchant")
    const bcrypt=require("bcrypt")
    const jwt=require("jsonwebtoken")
    require("dotenv").config();
    const multer=require('multer')
    const path = require('path')
    const baseUrl="https://dealz-2mm8.onrender.com/"
    
    
    //registering Merchants
    const register=async(req,res)=>{
        //check if merchant exists
        try{
            const data=req.body;
            const merchantExists=await merchant.findOne({where:{email:data.email}})
            if(merchantExists){
                return res.status(400).json({
                    status:400,
                    message:"Merchant already exists",
                    data:{}
                })
            }

            //bcrypting the password
            const salt=bcrypt.genSaltSync(10);
            const hash =bcrypt.hashSync(data.password,salt);
            
            //creating image url and creating merchant 
            const fileName = req.file.filename;
            const imageUrl = baseUrl + fileName;
            const newData={...data,password:hash,image: imageUrl}
            
            //creating new merchant
            const newMerchant=await merchant.create(newData)
            //generating authtoken using merchant id
            const auth_token=jwt.sign({id:newMerchant.merchant_id},process.env.JWT_SECERETE,{expiresIn:'24h'})
            //sending response
            return res.status(201).json({
                status:200,
                message:"Merchant created successfully",
                data:{
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
                    referral_code: newMerchant.referral_code||'',
                    auth_token:auth_token,
                    type: newMerchant.type||'',
                    parent_id: newMerchant.parent_id||'',
                    subscription: newMerchant.subscription||'',
                    expiry: newMerchant.expiry||'',
                    is_expired: newMerchant.is_expired||'',
                    trial_period: newMerchant.trial_period||''
                }
            })
        }catch(err){
            console.log(err)
            return res.send(err)
        }
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './images');
        },
        filename: function (req, file, cb) {
            cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)  
    
        }
    })
    
    const uploadImg = multer({
        storage: storage,
        limits: {
            fileSize: 2 *1024 * 1024 // 2MB limit
        },
        fileFilter: async function (req, file, cb) {
            try{
                if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return cb(new Error('Only JPG, JPEG, and PNG files are allowed!'))
                }
                if (file.size > 2 * 1024  *1024) {
                    return cb(new Error('File size exceeds 2MB limit!'));
                }
                cb(null, true);
            } catch (error) {
                cb(error, true);
                console.log("Error", error)
            }
            
        },
    })
    
    //login Merchant
    const login=async(req,res)=>{
        try{
            const {email,password}=req.body;
            const userMerchant=await merchant.findOne({where:{email:email}});
            
            if(!userMerchant){
                return res.status(400).json({
                    status:400,
                    message:"Merchant not found",
                    data:{}
                }) 
            }
            const isCorrect=await bcrypt.compare(password,userMerchant.password)
            if(!isCorrect){
                return res.status(400).json({
                    status:400,
                    message:"Invalid Password"
                })
            }
            const auth_token=jwt.sign({id:userMerchant.merchant_id},process.env.JWT_SECERETE, { expiresIn: '24h' })
            res.status(200).json({
                status:200,
                message:"Merchant logged In successfully",
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
                    referral_code: userMerchant.referral_code||'',
                    auth_token:auth_token,
                    type: userMerchant.type||'',
                    parent_id: userMerchant.parent_id||'',
                    subscription: userMerchant.subscription||'',
                    expiry: userMerchant.expiry||'',
                    is_expired: userMerchant.is_expired||'',
                    trial_period: userMerchant.trial_period||''
                }
            });
        }catch(err){
            return res.status(400).send('user not found')
        }
    }
    module.exports={
        register,
        uploadImg,
        login
    }