const {sequelize} = require('../database');
const {schema, required} = require('../models/user');

function getModel() {
    return sequelize.models.User;
}

function upsert(user) {
    return getModel().upsert(user);
    // This info comes from the IDP
    // upsert supported natively by PG
}

function upsertInfo(user, id) {
    const fields = Object.keys(schema).filter(col => !(schema[col].allowNull === false));
    // Information is provided by user, so make sure to update only these fields.
    return getModel().update(user, {
        where: {
            id: id
        },
        fields: fields
    });
}

function getInfo(id) {
    return getModel().findByPk(id);
}

function isMissing(id) {
    return this.getInfo(id).then(info => {
        return !required.every(field => info.dataValues[field]);
    });
}

module.exports = {
    upsert, upsertInfo, getInfo, isMissing
}