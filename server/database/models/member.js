const {DataTypes} = require('sequelize');

const schema = {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.DECIMAL
    },
    hasPaid: { // Are they up to date on their membership payment?
        allowNull: false,
        type: DataTypes.BOOLEAN
    },
    hasFree: { // Have they used their one free meet?
        allowNull: false,
        type: DataTypes.BOOLEAN
    },
    committee: DataTypes.STRING, // Do they hold a committee position?
};

function define(sequelize) {
    sequelize.define('Member', schema, {
        tableName: "Members",
    }).belongsTo(sequelize.models.User, {foreignKey: 'id'});
}

module.exports = {
    define, schema
}