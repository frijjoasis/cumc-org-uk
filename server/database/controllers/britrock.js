const {sequelize} = require('../database');

function getModel() {
    return sequelize.models.britrock;
}

function upsert(data) {
    return getModel().upsert({
        name: data.name,
        email: data.email,
        ticket: data.ticket
    });
}

module.exports = {
    upsert
}