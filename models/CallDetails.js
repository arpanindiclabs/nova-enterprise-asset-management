const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CallDetails', {
    RecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    CallDetail_ID: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      primaryKey: true
    },
    callAssignedDt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CallAttainedBy: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    ActionTaken: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    ActionTakenDt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CallEscalationNo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    EscalationTo: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    EscalationDt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CallStatu: {
      type: DataTypes.CHAR(10),
      allowNull: true
    },
    Remarks: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Call_Id: {
      type: DataTypes.CHAR(10),
      allowNull: true
    },
    EnteredBy: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    }
  }, {
    sequelize,
    tableName: 'CallDetails',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_CallDetails",
        unique: true,
        fields: [
          { name: "CallDetail_ID" },
        ]
      },
    ]
  });
};
