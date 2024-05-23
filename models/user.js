const sequelize=require("./index")
const DataTypes=require("sequelize")

const user=sequelize.define("user",{
    user_id:{
        type:DataTypes.INTEGER,
        unique:true,
        autoIncrement:true
    },
    device_token:{
        type:DataTypes.BIGINT,
        allowNull:false,
        unique:true,
        primaryKey:true
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
user.sync({alter:false})
module.exports=user