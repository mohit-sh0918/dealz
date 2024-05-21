const sequelize=require("./index")
const DataTypes=require("sequelize")

const user=sequelize.define("user",{
    user_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    user_name:{
        type:DataTypes.STRING,
        defaultValue:"",

    },
    email:{
        type:DataTypes.STRING,
        defaultValue:""
    },
    contact:{
        type:DataTypes.BIGINT,
        defaultValue:0
    },
    identity:{
        type:DataTypes.STRING,
        defaultValue:""
    }
},{
    freezeTableName:true
})
user.sync({alter:true})
module.exports=user