const {sequelize} = require('../database');

function getModel() {
    return sequelize.models.member;
}

function getMember(id) {
    return getModel().findByPk(id);
}

module.exports = {
    getMember
}