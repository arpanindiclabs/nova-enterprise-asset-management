const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Department', {
    DeptRecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    DeptCode: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      primaryKey: true
    },
    DeptName: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Department',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__Departme__BB9B955151AC6BAF",
        unique: true,
        fields: [
          { name: "DeptCode" },
        ]
      },
    ]
  });
};
