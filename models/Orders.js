const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Orders', {
    OrderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    OrderDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    CustomerID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Customers',
        key: 'CustomerID'
      }
    },
    OrderDescription: {
      type: DataTypes.STRING(2000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Orders',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__Orders__C3905BAF8D61D1CA",
        unique: true,
        fields: [
          { name: "OrderID" },
        ]
      },
    ]
  });
};
