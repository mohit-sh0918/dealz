const merchant = require("../models/merchant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const { where } = require("sequelize");
const internal = require("stream");
const baseUrl = "https://outgoing-crab-notably.ngrok-free.app/";
const mail = require("../helper/mailer");
const OTP = require("../models/otp");
const crypto = require("node:crypto");
const { throws } = require("assert");
const countryCode = require("../config/csvjson.json");
const createError = require("../helper/error");
const Category = require("../models/category");
const Deal = require("../models/deals");
const member = require("../models/member");
const deal = require("../models/deals");
const category = require("../models/category");
const { Op } = require('sequelize');

//utility functions
function generateOTP() {
  var digits = "0123456789";
  let OTP = "";
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
const getCountryCode = async (req, res, next) => {
  try {
    const data = [];
    for (i in countryCode)
      data.push({
        country_id: countryCode[i].ID,
        code: countryCode[i].CountryCode,
        name: countryCode[i].ValueEn,
        currency: countryCode[i].CurrencyCode,
      });
    return res.status(200).json({
      status: "OK",
      code: 200,
      message: "",
      data: data,
    });
  } catch (err) {
    next(err);
  }
};
function encrypt(text) {
  let algorithm = process.env.ALGORITHM; 
  let key = process.env.KEY; 
  let iv = process.env.IV;
  let cipher = crypto.createCipheriv(algorithm, key, iv);  
  let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  return encrypted;
  }
function decrypt(text) {
  try {
    let algorithm = process.env.ALGORITHM; 
  let key = process.env.KEY; 
  let iv = process.env.IV;
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
  
  return decrypted;
  } catch (error) {
    createError(200,"false","Invalid Credentials",401)
  }
}
const verifyToken=async(req,res,next)=>{
  try
  {   
      let token=req.body.token
      if (!token) throw next(createError(401,"ERROR","Invalid Token"))
      jwt.verify(token, process.env.JWT_SECERETE, (err, user) => {
        if (err) throw next(createError(200, "ERROR", "Token Expired", 401));
        const verifyId = merchant.findOne({ where: { merchant_id: user.id } });
        if (!verifyId)
          throw next(createError(200, "ERROR", "Invalid User", 401));
        req.id = user.id;
      });
          next()
}catch(err){
  next(err)
}
}


//registering Merchants
const register = async (req, res, next) => {
  //check if merchant exists
  try {
    const data = req.body;
    const merchantExists = await merchant.findOne({
      where: { email: data.email },
    });
    if (merchantExists)
      throw next(createError(200, "error", "Merchant already exists",400));
    //bcrypting the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(data.password, salt);

    //creating image url and creating merchant
    const fileName = req.file.filename;
    const imageUrl = baseUrl + fileName;
    const expire = new Date();
    expire.setDate(expire.getDate() + 10);
    const newData = {
      ...data,
      password: hash,
      image: imageUrl,
      expiry: expire,
    };
    //creating new merchant
    const newMerchant = await merchant.create(newData);
    //generating authtoken using merchant id
    const auth_token = jwt.sign(
      { id: newMerchant.merchant_id },
      process.env.JWT_SECERETE,
      { expiresIn: "24h" }
    );
    //sending email
    const paymentLink="https://www.google.com/"
    const emailBody = `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <h2>Welcome to the Merchant Portal</h2>
            <p>Dear Merchant,</p>
            <p>Thank you for joining our platform. To get started, please complete your payment by clicking the button below:</p>
            <a href="${paymentLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Pay Now</a>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Merchant Portal Team</p>
        </div>
    `;
    mail.mailSender(
      newMerchant.email,
      "Welcome to the Merchant Portal",
      emailBody
    )
    //sending response
    return res.status(201).json({
      status: "OK",
      code: 200,
      message: "Merchant created successfully",
      data: {
        merchant_id: newMerchant.merchant_id,
        email: newMerchant.email,
        contact: newMerchant.mobile,
        business_name: newMerchant.business_name,
        business_address1: newMerchant.business_address_1,
        business_address2: newMerchant.business_address_2,
        country: newMerchant.country,
        currency: newMerchant.currency,
        currencyvalue: newMerchant.currency_value,
        _package: newMerchant.package,
        image: newMerchant.image,
        latitude: newMerchant.latitude,
        longitude: newMerchant.longitude,
        referal_code: newMerchant.referal_code,
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
    next(err);
  }
};

//login Merchant
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let userMerchant = await merchant.findOne({ 
      where: { email: email },
      });

    //for memeber login with merchent details
    if (!userMerchant) {
      const newMember = await member.findOne({
        where: { email: email },
        include: {
          model: merchant,
          attributes: [
            "business_name",
            "business_address_1",
            "business_address_2",
            "country",
            "currency",
            "currency_value",
            "image",
            "latitude",
            "longitude",
            "referal_code",
            "parent_id",
            "subscription",
            "expiry",
            "is_expired",
            "trial_period",
            "device_token",
            "mobile",
            "package",
          ],
        },
      });
      if (!newMember) throw next(createError(200, "false", "No User found",401));
      userMerchant = {
        merchant_id: newMember.merchant_id,
        password: newMember.password,
        email: newMember.email,
        business_name: newMember.merchant.business_name,
        business_address_1: newMember.merchant.business_address_1,
        business_address_2: newMember.merchant.business_address_2,
        country: newMember.merchant.country,
        currency: newMember.merchant.currency,
        currency_value: newMember.merchant.currency_value,
        package: newMember.merchant.package,
        image: newMember.merchant.image,
        latitude: newMember.merchant.latitude,
        longitude: newMember.merchant.longitude,
        referal_code: newMember.merchant.referal_code,
        type: newMember.type,
        parent_id: newMember.merchant.parent_id || "",
        subscription: newMember.merchant.subscription || "",
        expiry: newMember.merchant.expiry,
        is_expired: newMember.merchant.is_expired,
        trial_period: newMember.merchant.trial_period,
        device_token: newMember.merchant.device_token,
        mobile: newMember.merchant.mobile,
        createdAt: newMember.createdAt,
        updatedAt: newMember.updatedAt,
      };
    }
    var isCorrect = await bcrypt.compare(password, userMerchant.password);
    if (!isCorrect)
      {
        isCorrect=(decrypt(userMerchant.password)===password?true:false);
        if(!isCorrect)
        throw next(createError(200, "false", "Invalid Credentials",401));
      }
    const auth_token = jwt.sign(
      { id: userMerchant.merchant_id },
      process.env.JWT_SECERETE,
      { expiresIn: "24h" }
    );
    const presentDate = new Date();
    if (presentDate > userMerchant.expiry && userMerchant.subscription=="no") {
      userMerchant.is_expired = 1;
      userMerchant.trial_period="no"
      merchant.update(
        {
          is_expired: 1,
          trial_period: "no",
        },
        {
          where: {
            merchant_id: userMerchant.merchant_id,
          },
        }
      );
    }
    // userMerchant=await merchant.findOne({ where: { email: email } });
    const code=( userMerchant.is_expired==0?200:1052);
    const stat=(userMerchant.is_expired==0?"OK":"false")
    const message=(userMerchant.is_expired==0?"Merchant logged In successfully":"Trial Period is over Please Subscribe")
    res.status(200).json({
      status:stat,
      code: code,
      message,
      data: {
        merchant_id: userMerchant.merchant_id,
        email: userMerchant.email,
        contact: userMerchant.mobile,
        business_name: userMerchant.business_name,
        business_address1: userMerchant.business_address_1,
        business_address2: userMerchant.business_address_2,
        country: userMerchant.country,
        currency: userMerchant.currency,
        currencyvalue: userMerchant.currency_value,
        _package: "10",
        image: userMerchant.image,
        latitude: userMerchant.latitude,
        longitude: userMerchant.longitude,
        referal_code: userMerchant.referal_code || "",
        auth_token: auth_token,
        type: userMerchant.type || "",
        parent_id: userMerchant.parent_id || "",
        subscription: userMerchant.subscription || "",
        expiry: userMerchant.expiry || "",
        is_expired: userMerchant.is_expired,
        trial_period: userMerchant.trial_period,
      },
    });
  } catch (err) {
    next(err);
  }
};

//get profile of merchant
const merchantProfile = async (req, res, next) => {
  try {
    const id = req.id;

    const userMerchant = await merchant.findOne({
      where: { merchant_id: id },
    });
    if (!userMerchant)
      throw next(createError(404, "error", "Merchant not found"));
    const code=( userMerchant.is_expired==0?200:1052);
    const stat=(userMerchant.is_expired==0?"OK":"false")
    return res.status(200).json({
      status: stat,
      code: code,
      message: "Merchant profile",
      data: {
        merchant_id: userMerchant.merchant_id,
        email: userMerchant.email,
        contact: userMerchant.mobile,
        business_name: userMerchant.business_name,
        business_address1: userMerchant.business_address_1,
        business_address2: userMerchant.business_address_2,
        country: userMerchant.country,
        currency: userMerchant.currency,
        currencyvalue: userMerchant.currency_value,
        _package: "10",
        image: userMerchant.image,
        latitude: userMerchant.latitude,
        longitude: userMerchant.longitude,
        referal_code: userMerchant.referal_code || "",
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
    next(err);
  }
};

//change merchant password
const changePassword = async (req, res, next) => {
  try {
    const {current_password, new_password} = req.body;
    const id = req.id;
    const userMerchant = await merchant.findOne({
      where: { merchant_id: id },
    });
    const isCorrect = await bcrypt.compare(current_password, userMerchant.password);
    if (!isCorrect) throw next(createError(200, "error", "Invalid Password"));
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hashSync(new_password, salt);
    await merchant
      .update({ password: hash }, { where: { merchant_id: id } })
      .then((result) => {
        res.status(200).json({
          status: "OK",
          code: 200,
          message: "Password changed successfully",
        });
      });
  } catch (err) {
    next(err);
  }
};
//edit merchant profile
const editMercantProfile = async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.id;
    const fileName = req.file.filename;
    const imageUrl = baseUrl + fileName;
    const newdata = { ...data, image: imageUrl };
    await merchant.update(newdata, { where: { merchant_id: id } });
    const userMerchant = await merchant.findOne({ where: { merchant_id: id } });
    res.status(200).json({
      status: "OK",
      code: 200,
      message: "Profile updated successfully",
      data: {
        merchant_id: userMerchant.merchant_id,
        email: userMerchant.email,
        contact: userMerchant.mobile,
        business_name: userMerchant.business_name,
        business_address1: userMerchant.business_address_1,
        business_address2: userMerchant.business_address_2,
        country: userMerchant.country,
        currency: userMerchant.currency,
        currencyvalue: userMerchant.currency_value,
        _package: "10",
        image: userMerchant.image,
        latitude: userMerchant.latitude,
        longitude: userMerchant.longitude,
        referal_code: userMerchant.referal_code || "",
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
    next(err);
  }
};
  //forget password
  const forgetPassword = async (req, res, next) => {
    try {
      const email = req.body.email;
      if (!email) throw next(createError(404, "error", "Invalid Credentials"));
      const merchant_id = await merchant.findOne({
        attributes: ["merchant_id"],
        where: {
          email: email,
        },
      });
      if (!merchant_id)
        throw next(createError(404, "error", "Invalid Credentials"));
      const otp = generateOTP();
      const date1 = new Date();
      const finalDate = jsToEpoch(date1) + 10 * 60 * 1000;
      const token = crypto.randomBytes(20).toString("hex");

      var data = {
        otp: otp,
        expire_time: finalDate,
        merchant_id: merchant_id.merchant_id,
        token: token,
      };
      OTP.create(data).then((result) => {
        mail
          .mailSender(
            email,
            "Reset Password",
            `OTP for resetting the Password is ${otp}`
          )
          .then((data) => {
            return res.status(200).json({
              status: "OK",
              code: 200,
              message: "OTP sent to your email",
              data: data,
            });
          });
      });
    } catch (err) {
      next(err);
    }
  };

//add deals
const addDeal = async (req, res, next) => {
  try {
    const token_id = req.id;
    const {count,rows}=await Deal.findAndCountAll({where:{
      merchant_id: {
        [Op.eq]: token_id
      }
    }})
    if(count>9) throw next(createError(200,"ERROR","You Cannot add more than 10 deals",401))
    const fileName = req.file.filename;
    const imageUrl = baseUrl + fileName;
    const deal = req.body;
    const newDeal = {
      ...deal,
      merchant_id: token_id,
      category_id: deal.category,
      image: imageUrl,
    };
    console.log("creating deals")
    Deal.create(newDeal).then((result) => {
      res.status(200).json({
        status: "OK",
        code: 200,
        message: "Deal added successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};

//edit deals
const editDeal = async (req, res, next) => {
  try {
    // const isDeal_id=await Deal.findOne({where:{deal_id:req.body.deal_id}})
    // if(!isDeal_id)throw next(createError(400,"invalid deal id"))
    const token_id = req.id;
    let imageUrl;
    if(req.file!=null)
    {
      const fileName = req.file.filename;
      imageUrl = baseUrl + fileName;
    }else{
      imageUrl=await deal.findOne({where:{deal_id:req.body.deal_id},attributes:['image']})
      imageUrl=imageUrl.image
    }
    const deals = req.body;
    const newDeal = {
      ...deals,
      merchant_id: token_id,
      category_id: deals.category,
      image:imageUrl
    };
    await Deal.update(newDeal, { where: { deal_id: req.body.deal_id } }).then(
      (result) => {
        res.status(200).json({
          status: "OK",
          code: 200,
          message: "Deal updated successfully",
        });
      }
    );
  } catch (err) {
    next(err);
  }
};
//delete deal
const deleteDeal = async (req, res, next) => {
  try {
    // const auth=await Deal.findOne({where:{user_id:token_id.id}})
    // if(!auth)throw next(createError(404,"Unauthroised access"))
    const verifyDeal = await Deal.findOne({
      where: { deal_id: req.body.deal_id },
    });
    if (!verifyDeal) throw next(createError(404, false, "Deal does not exist"));
    await Deal.destroy({ where: { deal_id: req.body.deal_id } }).then(
      (result) => {
        res.status(200).json({
          status: "OK",
          code: 200,
          message: "Deal deleted successfully",
        });
      }
    );
  } catch (err) {
    next(err);
  }
};
//get category
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findAll();
    res.status(200).json({
      status: "OK",
      code: 200,
      message: "All the Category",
      data: {
        category: category,
      },
    });
  } catch (err) {
    next(err);
  }
};
//add memeber
const addMember = async (req, res, next) => {
  try {
    //checking the number of member
    const {count,rows}=await member.findAndCountAll({where:{
      merchant_id:{
        [Op.eq]:req.id
      }
    }})
    if(count>4) throw next(createError(200,"ERROR","Cannnot add more than 5 members",401))
    //check if memeber is a merchant
    const membr = await member.findOne({ where: { email: req.body.email } });
    if (membr) throw next(createError(200, "false", "Member already exist",401));
    const pass = encrypt(req.body.password)
    const data = { ...req.body, merchant_id: req.id, password: pass };
    await member.create(data).then((result) => {
      res.status(200).json({
        status: "OK",
        code: 200,
        message: "Member added successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};
//edit member
const editMember = async (req, res, next) => {
  try {
    const data = req.body;
    const member_id = await member.findOne({ where: { id: data.member_id } });
    if (!member_id)
      throw next(createError(400, "error", "Invalid Credentials"));
    if (req.id != member_id.merchant_id)
      throw next(createError(404, "error", "Unauthorised Access"));
    const pass = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10));
    const newData = { ...data, password: pass };
    const newMember = await member
      .update(newData, { where: { id: data.member_id } })
      .then((newMember) => {
        res.status(200).json({
          status: "OK",
          code: 200,
          message: "Member updated successfully",
        });
      });
  } catch (err) {
    next(err);
  }
};
//delete member
const deleteMember = async (req, res, next) => {
  try {
    const data = req.body;
    const findMember = await member.findOne({ where: { id: data.member_id } });
    if (!findMember) throw next(createError(400, false, "Invalid Member"));
    if (req.id != findMember.merchant_id)
      throw next(createError(404, false, "Unauthorised Access"));
    await member.destroy({ where: { id: data.member_id } }).then((result) => {
      res.status(200).json({
        status: "OK",
        code: 200,
        message: "Member deleted successfully",
      });
    });
  } catch (err) {
    next(err);
  }
};
//get all members
const getAllMember = async (req, res, next) => {
  try {
    const findMember = await member.findAll({ where: { merchant_id: req.id } });
    if (!findMember) throw next(createError(400, "error", "No Member Found"));
    const data = ([] = findMember.map((findMember) => ({
      parent_id: findMember.id,
      name: findMember.name,
      email: findMember.email,
      merchant_id: findMember.merchant_id,
      password:decrypt(findMember.password),
    })));
    res.status(200).json({
      status: "OK",
      code: 200,
      message: "Members Found",
      data: data,
    });
  } catch (err) {
    next(err);
  }
};
//get all deals
const getAllDeals = async (req, res, next) => {
  try {
    const data = await deal.findAll({
      where: {
        merchant_id: req.id,
      },
      include: {
        model: category,
        attributes: ["name"],
        required: true,
      },
    });
    const newData = data.map((values) => ({
      deal_id: values.deal_id,
      merchant_id: values.merchant_id,
      category_id: values.category_id,
      deal_type: values.type,
      description1: values.description1,
      description2: values.description2,
      description3: values.description3,
      from_time: values.time_from,
      to_time: values.time_to,
      from_date: values.date_from,
      to_date: values.date_to,
      normal_price: values.normal_price,
      offer_price: values.offer_price,
      image: values.image,
      category_name: values.category.dataValues.name,
    }));
    res.status(200).json({
      status: "OK",
      code: 200,
      message: "All Deals",
      data: newData,
    });
  } catch (err) {
    next(err);
  }
};
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
  getAllDeals,
  verifyToken
};
