const {sequelize} = require('../database');
const {Op} = require('sequelize');

function getModel() {
    return sequelize.models.Meet;
}

function getAllUpcoming() {
    return getModel().findAll({
        where: {
            date: {
                [Op.gte]: new Date()
                // Compare against current time
            }
        }
    })
}

function getOneUpcoming(id) {
    return getModel().findByPk(id);
}

module.exports = {
    getAllUpcoming, getOneUpcoming
}