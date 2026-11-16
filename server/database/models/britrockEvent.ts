import { BritRockEvent, BritRockStatus } from '@cumc/shared-types';
import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * One row per year's screening, set up by committee. The newest row is the
 * one the public page shows.
 */
class BritRockEventModel
  extends Model<
    InferAttributes<BritRockEventModel>,
    InferCreationAttributes<BritRockEventModel>
  >
  implements BritRockEvent
{
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string | null;
  declare location: string;
  declare startsAt: Date;
  declare price: number;
  declare capacity: number | null;
  declare memberMeetID: number | null;
  declare refundNote: string | null;
  declare status: CreationOptional<BritRockStatus>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize): typeof BritRockEventModel {
  BritRockEventModel.init(
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
      description: DataTypes.TEXT,
      location: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      startsAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      price: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      capacity: DataTypes.INTEGER,
      memberMeetID: DataTypes.INTEGER,
      refundNote: DataTypes.STRING,
      status: {
        allowNull: false,
        defaultValue: 'draft',
        type: DataTypes.ENUM('draft', 'open', 'closed'),
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'BritRockEvents',
      modelName: 'britrockEvent',
      timestamps: true,
    }
  );

  return BritRockEventModel;
}

function associate(): void {}

export { BritRockEventModel, define, associate };
