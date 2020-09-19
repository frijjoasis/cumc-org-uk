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
    sequelize.define('user', schema, {
        tableName: "Users",
    });
}

function associate(sequelize) {
    sequelize.models.user.hasMany(sequelize.models.member, {
        foreignKey: {
            name: 'id',
            primaryKey: true,
            type: DataTypes.DECIMAL
        }
    });
    sequelize.models.user.hasMany(sequelize.models.meet, {
        foreignKey: {
            name: 'organiser',
            allowNull: false
        }
    });
    sequelize.models.user.hasMany(sequelize.models.signup, {
        foreignKey: {
            name: 'userID',
            allowNull: false
        }
    });
}

module.exports = {
    define, associate, schema, required
}