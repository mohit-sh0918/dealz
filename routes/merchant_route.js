const express=require("express")
const router=express.Router();
const merchant=require('../controllers/merchant')
const validator=require('../middlewares/validation/userValidation')


router.post('/auth/register', function(req, res, next) {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.send(err.message);
        }
        next();
    });
}, validator.addNewUser, merchant.register)

module.exports=router
