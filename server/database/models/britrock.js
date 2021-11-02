const {DataTypes} = require('sequelize');

const schema = {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING
    },
    ticket: {
        allowNull: false,
        type: DataTypes.STRING
    }
};

function define(sequelize) {
    sequelize.define('britrock', schema, {
        tableName: "BritRock",
    });
}

function associate(sequelize) {

}

module.exports = {
    define, associate, schema
}