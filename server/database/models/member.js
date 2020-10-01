const {DataTypes} = require('sequelize');

const schema = {
    id: {
        primaryKey: true,
        type: DataTypes.DECIMAL
    },
    hasPaid: { // Are they up to date on their membership payment?
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
    },
    hasFree: { // Have they used their one free meet?
        allowNull: false,
        defaultValue: true,
        type: DataTypes.BOOLEAN
    },
    paymentID: DataTypes.STRING,
    committee: DataTypes.STRING, // Do they hold a committee position?
};

function define(sequelize) {
    sequelize.define('member', schema, {
        tableName: "Members",
    });
}

function associate(sequelize) {
    sequelize.models.member.belongsTo(sequelize.models.user, {
        foreignKey: {
            name: 'id',
            primaryKey: true,
            type: DataTypes.DECIMAL
        }
    });
}

module.exports = {
    define, associate, schema
}