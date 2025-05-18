const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Call_LogMaster', {
    RecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    Call_Id: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      primaryKey: true
    },
    AssetCode: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    CallRegDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    AssetType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Empno: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    UserName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IssueType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IssueDetails: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    EnteredBy: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    CallAssignTo: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    ServiceCost: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    CallStatus: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    ClosedBy: {
      type: DataTypes.CHAR(8),
      allowNull: true
    },
    CloseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CallRemarks: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    UpdatedBy: {
      type: DataTypes.CHAR(8),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Call_LogMaster',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_Call_LogMaster",
        unique: true,
        fields: [
          { name: "Call_Id" },
        ]
      },
    ]
  });
};
