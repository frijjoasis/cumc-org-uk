const {sequelize} = require('../database');
const {Op} = require('sequelize');

function getModel() {
    return sequelize.models.meet;
}

function getAllUpcoming() {
    return getModel().findAll({
        where: {
            startDate: {
                [Op.gte]: new Date()
                // Compare against current time
            }
        }
    });
}

function getAll() {
    return getModel().findAll();
}

function getOneUpcoming(id) {
    return getModel().findByPk(id, {
        include: [
            {
                model: sequelize.models.signup,
                include: {
                    model: sequelize.models.user,
                    attributes: ['email']
                }
            },
            {
                model: sequelize.models.user,
                attributes: ['email', 'firstName', 'lastName', 'phone']
            }
        ] // Eager load associated models, recursively
    });
}

function getOneUpcomingRestricted(id) { // Same as above, but don't reveal user answers.
    return getModel().findByPk(id, {
        include: [
            {
                model: sequelize.models.signup,
                attributes: ['displayName'],
                include: {
                    model: sequelize.models.user,
                    attributes: ['email']
                }
            },
            {
                model: sequelize.models.user,
                attributes: ['email', 'firstName', 'lastName', 'phone']
            }
        ] // Eager load associated models, recursively
    });
}

function deleteMeet(id) {
    return getModel().destroy({
        where: {
            id: id
        }
    })
}

function upsertMeet(data, id) {
    data.organiser = id;
    return getModel().upsert(data);
}

function upsertQuestions(data, id) {
    return getModel().update({questions: data}, {
        where: {
            id: id
        }
    })
}

module.exports = {
    getAllUpcoming, getOneUpcoming, getOneUpcomingRestricted, getAll, upsertMeet, deleteMeet, upsertQuestions
}