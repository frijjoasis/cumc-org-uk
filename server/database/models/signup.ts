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
import type { User } from './user';
import type { Meet } from './meet';

class Signup extends Model<
  InferAttributes<Signup>,
  InferCreationAttributes<Signup>
> {
  declare id: CreationOptional<number>;
  declare displayName: string | null;
  declare authID: string | null;
  declare captureID: string | null;
  declare answers: object | null;

  // Foreign keys
  declare userID: ForeignKey<User['id']>;
  declare meetID: ForeignKey<Meet['id']>;

  // Associations
  declare user?: NonAttribute<User>;
  declare meet?: NonAttribute<Meet>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

const userFields = ['displayName', 'userID', 'meetID', 'answers'];

function define(sequelize: Sequelize) {
  Signup.init(
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
      indexes: [
        {
          unique: true,
          fields: ['userID', 'meetID'],
        },
      ],
    }
  );

  return Signup;
}

function associate(sequelize: Sequelize) {
  Signup.belongsTo(sequelize.models.meet as typeof Meet, {
    foreignKey: {
      name: 'meetID',
      allowNull: false,
    },
  });

  Signup.belongsTo(sequelize.models.user as typeof User, {
    foreignKey: {
      name: 'userID',
      allowNull: false,
    },
  });
}

export { Signup, define, associate, userFields };
