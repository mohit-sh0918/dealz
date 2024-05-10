const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')





const merchant = sequelize.define("merchant", 
{
    merchant_id: {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    password:{
        type:DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
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
    latitude:{
        type:DataTypes.STRING
    },
    longitude:{
        type:DataTypes.STRING
    },
    referal_code:{
        type:DataTypes.STRING
    },
    type:{
        defaultValue:"Merchant",
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
    freezeTableName: true
})

merchant.sync({alter : true})
module.exports = merchant

