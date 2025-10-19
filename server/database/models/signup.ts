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
import type { UserModel } from './user';
import type { MeetModel } from './meet';

class SignupModel extends Model<
  InferAttributes<SignupModel>,
  InferCreationAttributes<SignupModel>
> {
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

function define(sequelize: Sequelize) {
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
      answers: DataTypes.JSON,
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

function associate(sequelize: Sequelize) {
  SignupModel.belongsTo(sequelize.models.meet as typeof MeetModel, {
    foreignKey: {
      name: 'meetID',
      allowNull: false,
    },
  });

  SignupModel.belongsTo(sequelize.models.user as typeof UserModel, {
    foreignKey: {
      name: 'userID',
      allowNull: false,
    },
  });
}

export { SignupModel, define, associate, userFields };
