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

module.exports = {
    getAllUpcoming
}