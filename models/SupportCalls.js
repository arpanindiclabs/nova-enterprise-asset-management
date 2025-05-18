const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SupportCalls', {
    RecID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Call_Id: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: "UQ__SupportC__19E6F48A8FBF54F8"
    },
    AssetCode: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    AssetType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CallRegDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Empno: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    UserName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    IssueType: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    IssueDetails: {
      type: DataTypes.TEXT,
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
    CallAssignTo: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    ServiceCost: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    CallStatus: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ClosedBy: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    CloseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CallRemarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: {
        model: 'EmployeeMast',
        key: 'EmpNo'
      }
    },
    CallDetail_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
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
      type: DataTypes.TEXT,
      allowNull: true
    },
    ActionTakenDt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CallEscalationNo: {
      type: DataTypes.STRING(50),
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
    CallDetailStatus: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CallDetailRemarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ResolveStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    EscalationStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'SupportCalls',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__SupportC__360414FF9B1F6CD8",
        unique: true,
        fields: [
          { name: "RecID" },
        ]
      },
      {
        name: "UQ__SupportC__19E6F48A8FBF54F8",
        unique: true,
        fields: [
          { name: "Call_Id" },
        ]
      },
    ]
  });
};
