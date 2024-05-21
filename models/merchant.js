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
    business_address_1:{
        type:DataTypes.STRING
    },
    business_address_2:{
        type:DataTypes.STRING,
    },
    country:{
        type:DataTypes.STRING,
    },
    currency:{
        type:DataTypes.STRING,
    },
    currency_value:{
        type:DataTypes.STRING,
    },
    package:{
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
        defaultValue:"merchant",
        type:DataTypes.STRING
    },
    parent_id:{
        type:DataTypes.INTEGER
    },
    subscription:{
        type:DataTypes.STRING,
        defaultValue:"no"
    },
    expiry:{
        type:DataTypes.DATE
    },
    is_expired:{
        defaultValue:0,
        type:DataTypes.BOOLEAN
    },
    trial_period:{
        defaultValue:"yes",
        type:DataTypes.STRING
    },
    device_token:{
        type:DataTypes.STRING
    },
    mobile:{
        type:DataTypes.STRING
    }

},
{
    freezeTableName: true
})

merchant.sync({alter : true})
module.exports = merchant