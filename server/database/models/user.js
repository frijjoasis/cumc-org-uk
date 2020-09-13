const {DataTypes} = require('sequelize');

const schema = {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.DECIMAL
        // BIGINT doesn't have enough range
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING
    },
    displayName: {
        allowNull: false,
        type: DataTypes.STRING
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    dob: DataTypes.STRING,
    college: DataTypes.STRING,
    phone: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    postCode: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    emergencyName: DataTypes.STRING,
    emergencyPhone: DataTypes.STRING,
    bmc: DataTypes.STRING
};

const required = [
    'firstName', 'lastName', 'dob', 'college', 'phone', 'address1', 'postCode', 'country'
];

function define(sequelize) {
    sequelize.define('User', schema, {
        tableName: "Users",
    });
}

module.exports = {
    define, schema, required
}