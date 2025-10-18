import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

class BritRock extends Model<
  InferAttributes<BritRock>,
  InferCreationAttributes<BritRock>
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
  BritRock.init(
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
    }
  );

  return BritRock;
}

function associate(sequelize: Sequelize) {
  // No associations for britrock model
}

export { BritRock, define, associate };
