const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('AssetTransferRegister', {
    RecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    TransferCode: {
      type: DataTypes.CHAR(8),
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
    AssetDesc: {
      type: DataTypes.CHAR(50),
      allowNull: true
    },
    TransferFrom: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    TransferTo: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    ReasonOfTransfer: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    ApproveByTransTo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ApproveByAdmin: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Remarks: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    EnteredBy: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    TimeOfTransfer: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'AssetTransferRegister',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_AssetTransferRegister",
        unique: true,
        fields: [
          { name: "TransferCode" },
        ]
      },
    ]
  });
};
