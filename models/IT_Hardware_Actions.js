const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('IT_Hardware_Actions', {
    Title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    Action_Date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Action_Type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Action_Details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    In_Out: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    Received_From: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Issue_To: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Entered_By: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Expenses: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    Remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    RecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    }
  }, {
    sequelize,
    tableName: 'IT_Hardware_Actions',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__IT_Hardw__2CB664DD788F0335",
        unique: true,
        fields: [
          { name: "Title" },
        ]
      },
    ]
  });
};
