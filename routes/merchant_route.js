const express=require("express")
const router=express.Router();
const merchant=require('../controllers/merchant')
const validator=require('../middlewares/validation/userValidation')


router.post('/register', ((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.send(err.message);
        }
        next();
    });
}), validator.addNewUser, merchant.register)

router.post('/login', validator.loginNewUser, merchant.login)
module.exports=router
