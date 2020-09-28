const {sequelize} = require('../database');
const {userFields} = require('../models/signup');

function getModel() {
    return sequelize.models.signup;
}

function handleRegister(data, user) {
    const signup = {
        answers: data.answers,
        meetID: data.meetID,
        userID: user.id,
        displayName: user.displayName
    }; // Contains a (composite) unique index, so upsert will work
    return getModel().upsert(signup, {
        fields: userFields // Only allow modifying these fields
    });
}

function getHistory(id) {
    return getModel().findAll({
        where: {
            userID: id
        },
        include: {
            model: sequelize.models.meet,
            attributes: ['title', 'startDate', 'type', 'price']
        }
    });
}

module.exports = {
    handleRegister, getHistory
}