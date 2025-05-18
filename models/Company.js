const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Company', {
    CompRecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    CompCode: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      primaryKey: true
    },
    CompName: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Company',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__Company__969C5CE2ECD4888C",
        unique: true,
        fields: [
          { name: "CompCode" },
        ]
      },
    ]
  });
};
