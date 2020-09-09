const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('User', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.DECIMAL
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
    }, {
        tableName: "Users",
    });
}