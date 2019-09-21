module.exports = (sequelize, DataTypes) => {
  return sequelize.define('cart', {
    id: {primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
    refunded: {type: DataTypes.BOOLEAN, defaultValue: false},
    transactionId: {type: DataTypes.INTEGER},
    transactionState: {type: DataTypes.STRING},
  })
}
