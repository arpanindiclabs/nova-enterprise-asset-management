const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('StockReturns', {
    recid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    from_empcode: {
      type: DataTypes.CHAR(8),
      allowNull: false
    },
    assetcode: {
      type: DataTypes.CHAR(8),
      allowNull: false
    },
    approve_status: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    approved_by: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remarks_from: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    request_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'StockReturns',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__StockRet__1B427A0AE84276BF",
        unique: true,
        fields: [
          { name: "recid" },
        ]
      },
    ]
  });
};
