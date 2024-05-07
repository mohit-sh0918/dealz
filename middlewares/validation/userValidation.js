const {Validator}=require('node-input-validator')

//validation for registration of new user
const addNewUser= async(req,res,next)=>{
    let validator=new Validator(req.body,{
        device_token:'required',
        email:'required|email',
        password:'required',
        business_name:'required',
        business_address1:'required',
        business_address2:'required',
        mobile:'required',
        country:'required',
        currency:'required',
        currencyvalue:'required',
        _package:'required',
        latitude:'required',
        longitude:'required',
    });
    validator.check().then((matched)=>{
        if(!matched){
            res.status(400).send({
                message: (Object.values(validator.errors))[0].message,
                status: "false",
                data: []
            })
        }
        else{next()}
    });
}




//exporting Modules
module.exports={
    addNewUser
}