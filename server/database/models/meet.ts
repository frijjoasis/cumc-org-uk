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
import type { SignupModel } from './signup';

class MeetModel extends Model<
  InferAttributes<MeetModel>,
  InferCreationAttributes<MeetModel>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare subtitle: string | null;
  declare desc: string | null;
  declare startDate: Date;
  declare endDate: Date;
  declare type: 'Indoor' | 'Outdoor' | 'Social' | 'Other';
  declare signupControl: CreationOptional<'Default' | 'Members' | 'Everyone'>;
  declare disabled: boolean;
  declare questions: object | null;
  declare price: number | null;
  declare hidden: CreationOptional<boolean>;

  // Foreign keys
  declare organiser: ForeignKey<UserModel['id']>;

  // Associations
  declare organiserUser?: NonAttribute<UserModel>;
  declare signups?: NonAttribute<SignupModel[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize) {
  MeetModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      subtitle: DataTypes.STRING,
      desc: DataTypes.TEXT,
      startDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM('Indoor', 'Outdoor', 'Social', 'Other'),
      },
      signupControl: {
        allowNull: false,
        type: DataTypes.ENUM('Default', 'Members', 'Everyone'),
        defaultValue: 'Default',
      },
      disabled: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      questions: DataTypes.JSON,
      price: DataTypes.FLOAT,
      hidden: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'Meets',
      modelName: 'meet',
    }
  );

  return MeetModel;
}

function associate(sequelize: Sequelize) {
  MeetModel.belongsTo(sequelize.models.user as typeof UserModel, {
    foreignKey: {
      name: 'organiser',
      allowNull: false,
    },
    as: 'organiserUser',
  });

  MeetModel.hasMany(sequelize.models.signup as typeof SignupModel, {
    foreignKey: {
      name: 'meetID',
      allowNull: false,
    },
  });
}

export { MeetModel, define, associate };
