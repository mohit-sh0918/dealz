const sequelize = require('./index')
const { Sequelize, DataTypes } = require('sequelize')


// Define Category model
const category = sequelize.define("category",
    {
        category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        category_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false,
        freezeTableName: true
    }
)

category.sync({alter:true})
module.exports=category;