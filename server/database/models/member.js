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
    hasFree: { // This variable is a misnomer - it really means whether or not they can attend one meet before they have
        // to purchase membership. I wrote this code before I knew that was the policy; refactor it if you're brave enough.
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