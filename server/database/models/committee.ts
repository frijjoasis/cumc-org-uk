import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  ForeignKey,
  Association,
} from 'sequelize';
import type { MemberModel } from './member';
import type { CommitteeRoleModel } from './committeeRole';

class CommitteeModel extends Model<
  InferAttributes<CommitteeModel>,
  InferCreationAttributes<CommitteeModel>
> {
  declare id: CreationOptional<number>;
  declare member_id: ForeignKey<MemberModel['id']> | null;
  declare year: string;
  declare role: string;
  declare person_name: string;
  declare person_email: string | null;
  declare start_date: string | null;
  declare end_date: string | null;
  declare is_current: CreationOptional<boolean | null>;
  declare sort_order: CreationOptional<number | null>;
  declare role_id: ForeignKey<CommitteeRoleModel['id']> | null;
  declare status: CreationOptional<string | null>;
  declare staging_year: string | null;

  // Associations
  declare member?: NonAttribute<MemberModel>;
  declare committeeRole?: NonAttribute<CommitteeRoleModel>;

  // Association methods
  declare getCommitteeRole: () => Promise<CommitteeRoleModel | null>;
  declare setCommitteeRole: (role: CommitteeRoleModel | null) => Promise<void>;
  declare getMember: () => Promise<MemberModel | null>;
  declare setMember: (member: MemberModel | null) => Promise<void>;

  declare static associations: {
    member: Association<CommitteeModel, MemberModel>;
    committeeRole: Association<CommitteeModel, CommitteeRoleModel>;
  };
}

function define(sequelize: Sequelize) {
  CommitteeModel.init(
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
      modelName: 'committee',
      timestamps: false,
    }
  );

  return CommitteeModel;
}

function associate(sequelize: Sequelize) {
  // Associate with member if member model exists
  if (sequelize.models.member) {
    CommitteeModel.belongsTo(sequelize.models.member as typeof MemberModel, {
      foreignKey: 'member_id',
      as: 'member',
    });
  }

  // Associate with committee role
  if (sequelize.models.committeeRole) {
    CommitteeModel.belongsTo(
      sequelize.models.committeeRole as typeof CommitteeRoleModel,
      {
        foreignKey: 'role_id',
        as: 'committeeRole',
      }
    );
  }
}
export { CommitteeModel, define, associate };
