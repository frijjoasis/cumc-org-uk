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
import type { MeetModel } from './meet.js';
import { Signup } from '@cumc/shared-types';

class SignupModel extends Model<
  InferAttributes<SignupModel>,
  InferCreationAttributes<SignupModel>
> implements Signup {
  declare id: CreationOptional<number>;
  declare displayName: string | null;
  declare authID: string | null;
  declare captureID: string | null;
  declare answers: object | null;

  // Foreign keys
  declare userID: ForeignKey<UserModel['id']>;
  declare meetID: ForeignKey<MeetModel['id']>;

  // Associations
  declare user?: NonAttribute<UserModel>;
  declare meet?: NonAttribute<MeetModel>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

const userFields = ['displayName', 'userID', 'meetID', 'answers'];

function define(sequelize: Sequelize): typeof SignupModel {
  SignupModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      displayName: DataTypes.STRING,
      authID: DataTypes.STRING,
      captureID: DataTypes.STRING,
      answers: DataTypes.JSONB,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'Signups',
      modelName: 'signup',
      indexes: [
        {
          unique: true,
          fields: ['userID', 'meetID'],
        },
      ],
    }
  );

  return SignupModel;
}

function associate(sequelize: Sequelize): void {
  const { meet, user } = sequelize.models;

  if (meet) {
    SignupModel.belongsTo(meet as typeof MeetModel, {
      foreignKey: {
        name: 'meetID',
        allowNull: false,
      },
      as: 'meet' // Added alias for cleaner queries
    });
  }

  if (user) {
    SignupModel.belongsTo(user as typeof UserModel, {
      foreignKey: {
        name: 'userID',
        allowNull: false,
      },
      as: 'user'
    });
  }
}

export { SignupModel, define, associate, userFields };