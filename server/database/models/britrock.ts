import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

class BritRockModel extends Model<
  InferAttributes<BritRockModel>,
  InferCreationAttributes<BritRockModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare ticket: string;

  // Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize) {
  BritRockModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      ticket: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'BritRock',
      modelName: 'britrock',
    }
  );

  return BritRockModel;
}

function associate(sequelize: Sequelize) {
  // No associations for britrock model
}

export { BritRockModel, define, associate };
