    const merchant=require("../models/merchant")
    const bcrypt=require("bcrypt")
    const jwt=require("jsonwebtoken")
    require("dotenv").config();
    const multer=require('multer')
    const path = require('path')
    baseUrl="http://localhost:8080/api/dev/merchant/"
    //registering Merchants
    const register=async(req,res)=>{
        //check if merchant exists
        try{
            const data=req.body;
            const merchantExists=await merchant.findOne({where:{email:data.email}})
            if(merchantExists){
                return res.status(400).json({
                    message:"Merchant already exists"
                })
            }

            //bcrypting the password
            const salt=bcrypt.genSaltSync(10);
            const hash =bcrypt.hashSync(data.password,salt);
            const newData={...data,password:hash}   
            
            //generating token
            const auth_token=jwt.sign({id:newData.merchant_id},process.env.JWT_SECERETE)
            const fileName = req.file.filename;
            const imageUrl = baseUrl + fileName;
            //create merchant
            await merchant.create(newData)
            .then((newMerchant)=>{
                return res.status(201).json({
                    status:201,
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
                        image: imageUrl,
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
                // if (file.size > 2 * 1024  *1024) {
                //     return cb(new Error('File size exceeds 2MB limit!'));
                // }
                cb(null, true);
            } catch (error) {
                cb(error, true);
                console.log("Error", error)
            }
            
        },
    })
    

    module.exports={
        register,
        uploadImg
    }