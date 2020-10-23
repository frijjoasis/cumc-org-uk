const {sequelize} = require('../database');
const {Op} = require('sequelize');

function getModel() {
    return sequelize.models.member;
}

function getMember(id) {
    return getModel().findByPk(id);
}

function getCommitteeRole(id) {
    return getModel().findByPk(id).then(member => {
        return member ? member.committee : null;
    });
}

function getCommittee() {
    return getModel().findAll({
        attributes: ['committee'],
        where: {
            committee: {
                [Op.not]: null
            }
        },
        include: {
            model: sequelize.models.user,
            attributes: ['firstName', 'lastName']
        }
    });
}

function getInfo(id) {
    return getModel().findByPk(id, {
        include: {
            all: true
        }
    });
}

function upsert(data) {
    return getModel().upsert(data);
}

module.exports = {
    getMember, getCommitteeRole, getCommittee, getInfo, upsert
}