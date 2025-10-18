import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  ForeignKey,
} from 'sequelize';
import type { Member } from './member';
import type { CommitteeRole } from './committeeRole';

class Committee extends Model<
  InferAttributes<Committee>,
  InferCreationAttributes<Committee>
> {
  declare id: CreationOptional<number>;
  declare member_id: ForeignKey<Member['id']> | null;
  declare year: string;
  declare role: string;
  declare person_name: string;
  declare person_email: string | null;
  declare start_date: string | null;
  declare end_date: string | null;
  declare is_current: CreationOptional<boolean | null>;
  declare sort_order: CreationOptional<number | null>;
  declare role_id: ForeignKey<CommitteeRole['id']> | null;
  declare status: CreationOptional<string | null>;
  declare staging_year: string | null;

  // Associations
  declare member?: NonAttribute<Member>;
  declare committeeRole?: NonAttribute<CommitteeRole>;
}

function define(sequelize: Sequelize) {
  Committee.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      year: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      person_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      person_email: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      is_current: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'current',
      },
      staging_year: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'Committee',
      timestamps: false,
    }
  );

  return Committee;
}

function associate(sequelize: Sequelize) {
  // Associate with member if member model exists
  if (sequelize.models.member) {
    Committee.belongsTo(sequelize.models.member as typeof Member, {
      foreignKey: 'member_id',
      as: 'member',
    });
  }

  // Associate with committee role
  if (sequelize.models.committeeRole) {
    Committee.belongsTo(
      sequelize.models.committeeRole as typeof CommitteeRole,
      {
        foreignKey: 'role_id',
        as: 'committeeRole',
      }
    );
  }
}

export { Committee, define, associate };
