const createError = require("../helper/error")
const user=require("../models/user")
const jwt=require("jsonwebtoken")

//utility functions
const verifyToken=async(req,res,next)=>{
    try
    {   
        let token=req.body.token
        if (!token) throw next(createError(401,"ERROR","Invalid Token"))
        jwt.verify(token, process.env.JWT_SECERETE, (err, id) => {
    
        if (err) throw next(createError(200, "ERROR", "Invalid token", 401));
        const verifyId = user.findOne({ where: { user_id: id.id } });
        if (!verifyId)
            throw next(createError(200, "ERROR", "Invalid User", 401));
        req.id = id.id;
        });
            next()
}catch(err){
    next(err)
}
}


//User registraion
const userRegister=async(req,res,next)=>{
    try {
        const deviceToken=req.body.device_token
        if(!deviceToken)throw next(createError(200,"ERROR","Invalid token",401))
        let data;
        const [result]=await user.findOrCreate({where:{user_id:deviceToken}})
        const auth_token=jwt.sign({id:deviceToken},process.env.JWT_SECERETE,{expiresIn:'24h'})
        data={
            "user_id": result.user_id   , 
            "user_name": result.user_name,
            "email": result.email, 
            "contact": result.contact, 
            "identity": result.identity,
            "auth_token":auth_token,
            "device_token":deviceToken
        }
            res.status(200).json(data)
    } catch (err) {
        next(err)
    }
}
const editUser=async(req,res,next)=>{
    try {
        const {email,identity,name}=req.body
        const [rowupdates,[updatedUser]]= await user.update({
            email,
            identity,
            user_name:name
        },{where:{user_id:req.id},returning:true,individualHooks:true}
    )
    
    console.log(updatedUser)
    res.status(200).json(updatedUser.dataValues)
    }catch(err){
        next(err)
    }
}


module.exports={
    userRegister,
    editUser,
    verifyToken
}