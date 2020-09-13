const {DataTypes} = require('sequelize');

const schema = {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    title: {
        allowNull: false,
        type: DataTypes.STRING
    },
    desc: DataTypes.STRING,
    longDesc: DataTypes.STRING,
    date: {
        allowNull: false,
        type: DataTypes.DATE
    },
    members: DataTypes.STRING
};

function define(sequelize) {
    sequelize.define('Meet', schema, {
        tableName: "Meets",
    }).belongsTo(sequelize.models.User, {foreignKey: 'organiser'});
}

module.exports = {
    define, schema
}