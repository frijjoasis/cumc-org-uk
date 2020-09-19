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
    })
}

function getOneUpcoming(id) {
    return getModel().findByPk(id, {
        include: {
            all: true
        } // Eager load associated models
    });
}

module.exports = {
    getAllUpcoming, getOneUpcoming
}