const express=require("express")
const router=express.Router();
const merchant=require('../controllers/merchant')
const validator=require('../middlewares/validation/validate')


router.post('/merchant/register', (req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            return res.status(200).json({
                status: "ERROR",
                code: 200,
                message: err.message,
            }); 
            
        }
        next();
    }); 
}, validator.addNewUser, merchant.register)

router.post('/edit/merchant/profile', ((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            // console.error(err);
            return res.status(200).json({
                status:"ERROR",
                code:400,
                message:err.message
            })
        }
        next();
    });
}), validator.editUser,merchant.verifyToken, merchant.editMercantProfile)

router.post('/merchant/login', validator.loginNewUser, merchant.login)
router.post('/get/merchant/profile', merchant.verifyToken,merchant.merchantProfile)
router.post('/change/merchant/password',merchant.verifyToken,merchant.changePassword)
router.post('/merchant/forgot/password',merchant.forgetPassword)
router.get('/get/country',merchant.getCountryCode)

router.post('/add/deal',((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.status(200).json({
                status: "ERROR",
                code: 400,
                message: err.message,
            });
        }
        next();
    });
}),validator.addDeal,merchant.verifyToken,merchant.addDeal)

router.post('/edit/deal',((req, res, next)=> {
    merchant.uploadImg.single('image')(req, res, function(err) {
        if (err) {
            console.error(err);
            return res.send(err.message);
        }
        next();
    });
}),validator.editDeal,merchant.verifyToken,merchant.editDeal)

router.post('/delete/deal',merchant.verifyToken,merchant.deleteDeal)
router.get('/get/category',merchant.getCategory)
router.post('/add/member',merchant.verifyToken,merchant.addMember)
router.post('/edit/member',merchant.verifyToken,merchant.editMember)
router.post('/delete/member',merchant.verifyToken,merchant.deleteMember)
router.post('/all/member',merchant.verifyToken,merchant.getAllMember)
router.post('/all/deal',merchant.verifyToken,merchant.getAllDeals)

module.exports=router