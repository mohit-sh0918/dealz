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

router.post('/edit/merchant/profile', ((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.send(err.message);
        }
        next();
    });
}), validator.editUser,validator.verifyToken, merchant.editMercantProfile)

router.post('/merchant/login', validator.loginNewUser, merchant.login)
router.post('/get/merchant/profile', validator.verifyToken,merchant.merchantProfile)
router.post('/change/merchant/password',validator.verifyToken,merchant.changePassword)
router.post('/merchant/forgot/password',merchant.forgetPassword)
router.get('/get/country',merchant.getCountryCode)

router.post('/add/deal',((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.send(err.message);
        }
        next();
    });
}),validator.addDeal,validator.verifyToken,merchant.addDeal)

router.post('/edit/deal',((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.send(err.message);
        }
        next();
    });
}),validator.editDeal,validator.verifyToken,merchant.editDeal)

router.post('/delete/deal',validator.verifyToken,merchant.deleteDeal)
router.get('/get/category',merchant.getCategory)
router.post('/add/member',validator.verifyToken,merchant.addMember)
router.post('/edit/member',validator.verifyToken,merchant.editMember)
router.post('/delete/member',validator.verifyToken,merchant.deleteMember)
router.post('/all/member',validator.verifyToken,merchant.getAllMember)
router.post('/all/deal',validator.verifyToken,merchant.getAllDeals)

module.exports=router