const { INTEGER } = require("sequelize");
const sequelize=require("./index");
const merchant = require("./merchant");
const {DataTypes}=require("sequelize");
const member=sequelize.define("member",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        },
    name:{
        type:DataTypes.STRING(50),
        allowNull:false,
    },
    merchant_id:{
        type:DataTypes.INTEGER,
        references:{
            model:merchant,
            key:"merchant_id",
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    email:{
        type:DataTypes.STRING,
    },
    password:{
        type:DataTypes.STRING,
    }
},{
    freezeTableName:true
});

member.belongsTo(merchant,{foreignKey:"merchant_id",onDelete:"CASCADE",onUpdate:"CASCADE"});
merchant.hasMany(member,{foreignKey:"merchant_id",onDelete:"CASCADE",onUpdate:"CASCADE"});
member.sync({alter:false})
module.exports=member;
