const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('EmployeeMast', {
    EmpRecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    EmpNo: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      primaryKey: true
    },
    EmpName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    EmpCompID: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    EmpDeptID: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    EmpContNo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Password: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    LastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    LastLocation: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IsAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'EmployeeMast',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__Employee__AF2D66D3DA7B485C",
        unique: true,
        fields: [
          { name: "EmpNo" },
        ]
      },
    ]
  });
};
