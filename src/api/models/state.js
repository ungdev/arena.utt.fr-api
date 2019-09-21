module.exports = (sequelize, DataTypes) => {
  return sequelize.define('state', {
    id: { primaryKey: true, type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    popover: { type: DataTypes.STRING },
    index: {type: DataTypes.INTEGER, allowNull: false}
  })
}
