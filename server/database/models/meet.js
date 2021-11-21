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
    signupControl: {
        allowNull: false,
        type: DataTypes.ENUM('Default', 'Members', 'Everyone'),
        defaultValue: 'Default',
    },
    disabled: { // Are signups disabled?
        allowNull: false,
        type: DataTypes.BOOLEAN
    },
    questions: DataTypes.JSON,
    price: DataTypes.FLOAT,
    hidden: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
    } // Note this option is not secure, the API will still leak hidden meets. The IDs are sequential anyway.
      // It just hides it from the upcoming menu for cleanliness.
};

function define(sequelize) {
    sequelize.define('meet', schema, {
        tableName: "Meets",
    });
}

function associate(sequelize) {
    sequelize.models.meet.belongsTo(sequelize.models.user, {
        foreignKey: {
            name: 'organiser',
            allowNull: false
        }
    });
    sequelize.models.meet.hasMany(sequelize.models.signup, {
        foreignKey: {
            name: 'meetID',
            allowNull: false
        }
    });
}

module.exports = {
    define, associate, schema
}