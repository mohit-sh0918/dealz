// Define sequelize
const sequelize = require("./index");
const { DataTypes } = require("sequelize");
const category=require("./category");
const merchant = require("./merchant");
// Define Deal model
const deal=sequelize.define("deal",
{
    deal_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    merchant_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model:merchant,
            key:"merchant_id",
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    time_to: {
        type: DataTypes.TIME,
    },
    time_from: {
        type: DataTypes.TIME,
    },
    date_from: {
        type: DataTypes.DATE,
    },
    date_to: {
        type: DataTypes.DATE,
    },
    category_id: {
        type: DataTypes.INTEGER,
        references: {
            model: category,
            key: 'category_id',
        },
        onUpdate: 'CASCADE', 
        onDelete: 'CASCADE'
    },
    normal_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    offer_price: {
        type: DataTypes.FLOAT,
    },
    image: {
        type: DataTypes.STRING,
    },
    description2: {
        type: DataTypes.STRING,
    },
    description3: {
        type: DataTypes.STRING,
    },
},{
    freezeTableName: true
}
)

// Establishing association between Category and Deal
category.hasMany(deal, { foreignKey: "category_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
deal.belongsTo(category, { foreignKey: "category_id",onDelete: "CASCADE", onUpdate: "CASCADE" });
merchant.hasMany(deal,{ foreignKey: "merchant_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
deal.belongsTo(merchant,{ foreignKey: "merchant_id",onDelete: "CASCADE", onUpdate: "CASCADE" });
deal.sync({alter:false})


// Export models
module.exports = deal
