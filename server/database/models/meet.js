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
    subtitle: DataTypes.STRING,
    desc: DataTypes.TEXT, // More than 255 characters
    startDate: { // Start date
        allowNull: false,
        type: DataTypes.DATE
    },
    endDate: { // End date
        allowNull: false,
        type: DataTypes.DATE
    },
    type: {
        allowNull: false,
        type: DataTypes.ENUM('Indoor', 'Outdoor', 'Social', 'Other')
    },
    disabled: { // Are signups disabled?
        allowNull: false,
        type: DataTypes.BOOLEAN
    },
    questions: DataTypes.JSON,
    price: DataTypes.FLOAT,
    members: DataTypes.ARRAY(DataTypes.STRING) // List (of display names) of sign-ups
    //TODO: Many-to-many foreign key
};

function define(sequelize) {
    sequelize.define('Meet', schema, {
        tableName: "Meets",
    }).belongsTo(sequelize.models.User, {
        foreignKey: {
            name: 'organiser',
            allowNull: false
        }
    });
}

module.exports = {
    define, schema
}