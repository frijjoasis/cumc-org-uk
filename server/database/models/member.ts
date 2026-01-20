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
import type { UserModel } from './user.js';
import type { CommitteeModel } from './committee.js';
import { Member } from '@cumc/shared-types';

class MemberModel extends Model<
  InferAttributes<MemberModel>,
  InferCreationAttributes<MemberModel>
> implements Member {
  // id is both primary key AND foreign key to User
  declare id: ForeignKey<UserModel['id']>;

  declare hasPaid: CreationOptional<boolean>;
  declare hasFree: CreationOptional<boolean>;
  declare paymentID: string | null;
  declare committee: string | null;

  // Associations
  declare user?: NonAttribute<UserModel>;
  declare committeeMembers?: NonAttribute<CommitteeModel[]>;

  // Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize): typeof MemberModel {
  MemberModel.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.DECIMAL, 
      },
      hasPaid: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      hasFree: {
        allowNull: false,
        defaultValue: true,
        type: DataTypes.BOOLEAN,
      },
      paymentID: DataTypes.STRING,
      committee: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'Members',
      modelName: 'member',
      timestamps: true,
    }
  );

  return MemberModel;
}

function associate(sequelize: Sequelize): void {
  const { user, committee } = sequelize.models;

  if (user) {
    MemberModel.belongsTo(user as typeof UserModel, {
      foreignKey: {
        name: 'id',
        field: 'id',
      },
      as: 'user',
    });
  }

  if (committee) {
    MemberModel.hasMany(committee as typeof CommitteeModel, {
      foreignKey: 'member_id',
      as: 'committeeMembers',
    });
  }
}

export { MemberModel, define, associate };