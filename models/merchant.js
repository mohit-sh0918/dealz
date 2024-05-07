const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')



//{ "status": "", "message": "", 
//"data": { "merchant_id": "", "email": "", "contact": "", "business_name": "", "business_address1": "", 
//"business_address2": "", "country": "", "currency": "", "currencyvalue": "", "_package": "", "image": "", 
//"latitute": "", "longitude": "", "referal_code": "", "auth_token": "", "type": "", "parent_id": "", "subscription": "", 
//"expiry": "", "is_expired": "", "trial_period": "" } }

const merchant = sequelize.define("merchant", {
    merchant_id: {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    password:{
        type:DataTypes.STRING,
    },
    // name: {
    //     type: DataTypes.STRING,
    // },
    email: {
        type: DataTypes.STRING,
    },
    // contact: {
    //     type: DataTypes.STRING,
    // },
    business_name:{
        type: DataTypes.STRING,
    },
    business_address1:{
        type:DataTypes.STRING
    },
    business_address2:{
        type:DataTypes.STRING,
    },
    country:{
        type:DataTypes.STRING,
    },
    currency:{
        type:DataTypes.STRING,
    },
    currencyvalue:{
        type:DataTypes.STRING,
    },
    _package:{
        type:DataTypes.STRING
    },
    image:{
        type:DataTypes.STRING
    },
    latitute:{
        type:DataTypes.STRING
    },
    longitute:{
        type:DataTypes.STRING
    },
    referal_code:{
        type:DataTypes.STRING
    },
    auth_token:{
        type:DataTypes.STRING
    },
    type:{
        type:DataTypes.STRING
    },
    parent_id:{
        type:DataTypes.INTEGER
    },
    subscription:{
        type:DataTypes.STRING
    },
    expiry:{
        type:DataTypes.DATE
    },
    is_expired:{
        type:DataTypes.BOOLEAN
    },
    trial_period:{
        type:DataTypes.BOOLEAN
    },
    device_token:{
        type:DataTypes.STRING
    },
    mobile:{
        type:DataTypes.INTEGER
    }

},
{
    freezeTableName: true,
    timeStamps: false
})

merchant.sync({alter : true})
module.exports = merchant

