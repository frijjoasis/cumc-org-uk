const {DataTypes} = require('sequelize');

const schema = {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
    },
    member_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    year: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    person_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    person_email: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'current'
    },
    staging_year: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
};

function define(sequelize) {
    sequelize.define('committee', schema, {
        tableName: "Committee",
        timestamps: false
    });
}

function associate(sequelize) {
    // Associate with member if member model exists
    if (sequelize.models.member) {
        sequelize.models.committee.belongsTo(sequelize.models.member, {
            foreignKey: 'member_id',
            as: 'member'
        });
    }

    // Associate with committee role
    if (sequelize.models.committeeRole) {
        sequelize.models.committee.belongsTo(sequelize.models.committeeRole, {
            foreignKey: 'role_id',
            as: 'committeeRole'
        });
    }
}

module.exports = {
    define, associate, schema
}
