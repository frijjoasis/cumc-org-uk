const {DataTypes} = require('sequelize');

const schema = {
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