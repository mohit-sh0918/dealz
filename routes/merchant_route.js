const express=require("express")
const router=express.Router();
const merchant=require('../controllers/merchant')
const validator=require('../middlewares/validation/validate')


router.post('/merchant/register', ((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.send(err.message);
        }
        next();
    });
}), validator.addNewUser, merchant.register)

router.post('/merchant/login', validator.loginNewUser, merchant.login)
router.get('/get/merchant/profile', validator.verifyToken,merchant.merchantProfile)
router.post('/change/merchant/password',validator.verifyToken,merchant.changePassword)
router.post('/merchant/forgot/password',merchant.forgetPassword)
module.exports=router