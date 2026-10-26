import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * Append-only audit log of every PayPal operation we attempt.
 *
 * One row per API call — success or failure. Never updated or deleted.
 * Lets us reconstruct "what happened to this payment and when" months later,
 * e.g. for chargebacks, disputes, or "the user says they were charged twice".
 *
 * No FK constraints: if a Signup or User is deleted the history survives.
 */
class PaymentEventModel extends Model<
  InferAttributes<PaymentEventModel>,
  InferCreationAttributes<PaymentEventModel>
> {
  declare id: CreationOptional<number>;
  declare operation: 'authorize' | 'capture' | 'void';
  declare status: 'success' | 'failure';
  declare intent: 'membership' | 'register' | 'britrock' | null;
  declare userID: string | null;
  declare performedBy: string | null;
  declare signupID: number | null;
  declare paypalReference: string | null;
  declare amount: number | null;
  declare errorCode: string | null;
  declare errorMessage: string | null;
  declare debugId: string | null;
  declare metadata: object | null;
  declare createdAt: CreationOptional<Date>;
}

function define(sequelize: Sequelize): typeof PaymentEventModel {
  PaymentEventModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      operation: {
        allowNull: false,
        type: DataTypes.ENUM('authorize', 'capture', 'void'),
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('success', 'failure'),
      },
      intent: {
        allowNull: true,
        type: DataTypes.ENUM('membership', 'register', 'britrock'),
      },
      userID: DataTypes.STRING,
      performedBy: DataTypes.STRING,
      signupID: DataTypes.INTEGER,
      paypalReference: DataTypes.STRING,
      amount: DataTypes.FLOAT,
      errorCode: DataTypes.STRING,
      errorMessage: DataTypes.TEXT,
      debugId: DataTypes.STRING,
      metadata: DataTypes.JSONB,
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: 'PaymentEvents',
      modelName: 'paymentEvent',
      timestamps: true,
      updatedAt: false,
      indexes: [
        { fields: ['signupID'] },
        { fields: ['userID'] },
        { fields: ['paypalReference'] },
        { fields: ['createdAt'] },
      ],
    }
  );
  return PaymentEventModel;
}

function associate(_sequelize: Sequelize): void {
  // Intentionally no FK constraints — see class comment.
}

export { PaymentEventModel, define, associate };
