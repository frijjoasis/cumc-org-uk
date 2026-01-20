import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';

import type { MemberModel } from './member.js';
import type { MeetModel } from './meet.js';
import type { SignupModel } from './signup.js';
import { User } from '@cumc/shared-types';

class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> implements User {
  declare id: string; // Stored as Numeric/Decimal, handled as string in JS
  declare email: string;
  declare displayName: string;
  declare firstName: string | null;
  declare lastName: string | null;
  declare dob: string | null;
  declare college: string | null;
  declare phone: string | null;
  declare address1: string | null;
  declare address2: string | null;
  declare postCode: string | null;
  declare city: string | null;
  declare country: string | null;
  declare emergencyName: string | null;
  declare emergencyPhone: string | null;
  declare bmc: string | null;
  declare medicalInfo: string | null;

  // Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare member?: NonAttribute<MemberModel>;
  declare meets?: NonAttribute<MeetModel[]>;
  declare signups?: NonAttribute<SignupModel[]>;
}

function define(sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.DECIMAL,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      displayName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      dob: DataTypes.STRING,
      college: DataTypes.STRING,
      phone: DataTypes.STRING,
      address1: DataTypes.STRING,
      address2: DataTypes.STRING,
      postCode: DataTypes.STRING,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      emergencyName: DataTypes.STRING,
      emergencyPhone: DataTypes.STRING,
      bmc: DataTypes.STRING,
      medicalInfo: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'Users',
      modelName: 'user',
    }
  );

  return UserModel;
}

function associate(sequelize: Sequelize): void {
  const { member, meet, signup } = sequelize.models;

  if (member) {
    UserModel.hasOne(member as typeof MemberModel, {
      foreignKey: {
        name: 'id',
        field: 'id',
      },
      as: 'member'
    });
  }

  if (meet) {
    UserModel.hasMany(meet as typeof MeetModel, {
      foreignKey: {
        name: 'organiser',
        allowNull: false,
      },
      as: 'meets'
    });
  }

  if (signup) {
    UserModel.hasMany(signup as typeof SignupModel, {
      foreignKey: {
        name: 'userID',
        allowNull: false,
      },
      as: 'signups'
    });
  }
}

const required = [
  'firstName',
  'lastName',
  'dob',
  'college',
  'phone',
  'address1',
  'postCode',
  'country',
  'emergencyName',
  'emergencyPhone',
] as const;

export { UserModel, define, associate, required };
