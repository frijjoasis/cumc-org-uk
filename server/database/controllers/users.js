const {sequelize} = require('../database');

function upsert(user) {
    return sequelize.models.User.upsert(user);
    // This info comes from the IDP
}

function upsertInfo(user) {
    return sequelize.models.User.upsert(user, {fields: [
            'firstName', 'lastName', //TODO:
        ]});
    // Information provided by user - only allow updating certain fields
}

function getInfo(id) {
    //TODO:
}

function isMissing(id) {
    return this.getInfo(id);
}

module.exports = {
    upsert, upsertInfo, getInfo
}