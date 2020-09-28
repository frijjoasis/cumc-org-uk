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
        include: {
            all: true
        } // Eager load associated models
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

module.exports = {
    getAllUpcoming, getOneUpcoming, getAll, upsertMeet, deleteMeet
}