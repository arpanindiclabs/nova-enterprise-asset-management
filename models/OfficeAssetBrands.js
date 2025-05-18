const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('OfficeAssetBrands', {
    Brands: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    AssetTypes: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'OfficeAssetBrands',
    schema: 'dbo',
    timestamps: false
  });
};
