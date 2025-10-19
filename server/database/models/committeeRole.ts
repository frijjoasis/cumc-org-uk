import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import type { CommitteeModel } from './committee';

class CommitteeRoleModel extends Model<
  InferAttributes<CommitteeRoleModel>,
  InferCreationAttributes<CommitteeRoleModel>
> {
  declare id: CreationOptional<number>;
  declare role_name: string;
  declare role_slug: string;
  declare description: string | null;
  declare email_alias: string | null;
  declare is_required: CreationOptional<boolean | null>;
  declare max_positions: CreationOptional<number | null>;
  declare sort_order: CreationOptional<number | null>;
  declare is_active: CreationOptional<boolean | null>;
  declare created_at: CreationOptional<Date | null>;
  declare updated_at: CreationOptional<Date | null>;

  // Associations
  declare committeeMembers?: NonAttribute<CommitteeModel[]>;
}

function define(sequelize: Sequelize) {
  CommitteeRoleModel.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      role_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      role_slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email_alias: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      max_positions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'CommitteeRoles',
      modelName: 'committeeRole',
      timestamps: false,
    }
  );

  return CommitteeRoleModel;
}

function associate(sequelize: Sequelize) {
  // A committee role can have many committee members
  if (sequelize.models.committee) {
    CommitteeRoleModel.hasMany(
      sequelize.models.committee as typeof CommitteeModel,
      {
        foreignKey: 'role_id',
        as: 'committeeMembers',
      }
    );
  }
}

export { CommitteeRoleModel, define, associate };
