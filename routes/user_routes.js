const express=require("express");
const router=express.Router();
const user=require("../controllers/user");

router.post("/user/register",user.userRegister)
router.post("/edit/user/profile",user.verifyToken,user.editUser)
router.post("/filter/deal",user.filterDeals)
router.post("/send/email",user.sendEmail)
module.exports=router