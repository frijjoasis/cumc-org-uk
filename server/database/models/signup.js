const {DataTypes} = require('sequelize');

const schema = {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    displayName: DataTypes.STRING,
    payment: DataTypes.ENUM('upfront', 'delayed'),
    answers: DataTypes.JSON
    // Sequelize also creates a 'created at' for us
};

const userFields = ['displayName', 'userID', 'meetID', 'answers']

function define(sequelize) {
    sequelize.define('signup', schema, {
        tableName: "Signups",
        indexes: [
            {
                unique: true,
                fields: ['userID', 'meetID']
            }
        ]
    });
}

function associate(sequelize) {
    sequelize.models.signup.belongsTo(sequelize.models.meet, {
        foreignKey: {
            name: 'meetID',
            allowNull: false
        }
    });
    sequelize.models.signup.belongsTo(sequelize.models.user, {
        foreignKey: {
            name: 'userID',
            allowNull: false
        }
    });
}

module.exports = {
    define, associate, schema, userFields
}