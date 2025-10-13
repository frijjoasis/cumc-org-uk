const {DataTypes} = require('sequelize');

const schema = {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
    },
    role_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role_slug: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    email_alias: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    max_positions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
};

function define(sequelize) {
    sequelize.define('committeeRole', schema, {
        tableName: "CommitteeRoles",
        timestamps: false
    });
}

function associate(sequelize) {
    // A committee role can have many committee members
    if (sequelize.models.committee) {
        sequelize.models.committeeRole.hasMany(sequelize.models.committee, {
            foreignKey: 'role_id',
            as: 'committeeMembers'
        });
    }
}

module.exports = {
    define, associate, schema
}
