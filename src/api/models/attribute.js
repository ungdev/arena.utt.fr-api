module.exports = (sequelize, DataTypes) => sequelize.define('attribute', {
  key: { type: DataTypes.STRING },
  value: { type: DataTypes.STRING },
});
