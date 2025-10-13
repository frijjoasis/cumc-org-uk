const {Sequelize} = require('sequelize');
const logger = require('../logger').logger;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    },
    logging: false
});

const models = [
    require('./models/user'),
    require('./models/member'),
    require('./models/meet'),
    require('./models/signup'),
    require('./models/britrock'),
    require('./models/committee'),
    require('./models/committeeRole'),
]

module.exports = {
    init: async () => {
        await sequelize.authenticate();
        logger.info('Database connection established.');

        models.forEach(model => {
            model.define(sequelize);
        }); // Initialise models

        models.forEach(model => {
            model.associate(sequelize);
        }); // Setup associations
        await sequelize.sync(); // 'touch' relevant SQL tables
        logger.info("All models synchronized successfully.")
    },

    sequelize: sequelize
}