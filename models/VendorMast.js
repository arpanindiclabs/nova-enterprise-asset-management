const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('VendorMast', {
    VendorRecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    VendorCode: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      primaryKey: true
    },
    VendorName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VendorDesc: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    VendorAddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VendorCont: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    VendorRemarks: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'VendorMast',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__VendorMa__10C18F5DACBBEC73",
        unique: true,
        fields: [
          { name: "VendorCode" },
        ]
      },
    ]
  });
};
