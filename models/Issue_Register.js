const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Issue_Register', {
    IssueRecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    IssuedID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    AssetCode: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'Asset_Master',
        key: 'AssetCode'
      }
    },
    IssueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    IssueType: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    IssueEmpno: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    IssueEmpName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IssueLocation: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IssueStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ReturenStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ReturnDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    IssuedBy: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Remarks1: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Remarks2: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Issue_Register',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__Issue_Re__96CDAAD55D116C4B",
        unique: true,
        fields: [
          { name: "IssuedID" },
        ]
      },
    ]
  });
};
