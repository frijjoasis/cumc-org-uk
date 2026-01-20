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
import type { MemberModel } from './member.js';
import type { CommitteeRoleModel } from './committeeRole.js';
import { Committee } from '@cumc/shared-types';

class CommitteeModel extends Model<
  InferAttributes<CommitteeModel>,
  InferCreationAttributes<CommitteeModel>
> implements Committee {
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

  declare member?: NonAttribute<MemberModel>;
  declare committeeRole?: NonAttribute<CommitteeRoleModel>;

  declare getCommitteeRole: () => Promise<CommitteeRoleModel | null>;
  declare setCommitteeRole: (role: CommitteeRoleModel | null) => Promise<void>;
  declare getMember: () => Promise<MemberModel | null>;
  declare setMember: (member: MemberModel | null) => Promise<void>;

  declare static associations: {
    member: Association<CommitteeModel, MemberModel>;
    committeeRole: Association<CommitteeModel, CommitteeRoleModel>;
  };
}

function define(sequelize: Sequelize): typeof CommitteeModel {
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
        defaultValue: false, 
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
        defaultValue: 'past',
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

function associate(sequelize: Sequelize): void {
  const { member, committeeRole } = sequelize.models;

  if (member) {
    CommitteeModel.belongsTo(member, {
      foreignKey: 'member_id',
      as: 'member',
    });
  }

  if (committeeRole) {
    CommitteeModel.belongsTo(committeeRole, {
      foreignKey: 'role_id',
      as: 'committeeRole',
    });
  }
}

export { CommitteeModel, define, associate };