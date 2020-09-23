const {sequelize} = require('../database');

function getModel() {
    return sequelize.models.member;
}

function getMember(id) {
    return getModel().findByPk(id);
}

function getCommitteeRole(id) {
    return getModel().findByPk(id).then(member => {
        return member.committee;
    });
}

module.exports = {
    getMember, getCommitteeRole
}