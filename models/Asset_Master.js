const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Asset_Master', {
    AssetRecID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true
    },
    AssetCode: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      primaryKey: true
    },
    AssetERP_Code: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    AssetType: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    AssetDescription: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    PurchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    OwnerCompany: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PurchaseEmployeeName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    PoNo: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    PoDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    PurchasedPrice: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    VendorName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    WarrantyDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    IsIssued: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    UserContNo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    UserCompany: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IssuedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    IssuedSite: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    IsScrraped: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ScrapedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Remarks1: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Remarks2: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    Remarks3: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    AssetBrand: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    AssetModel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    AssetSlno: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    Location: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CurrentEmpNo: {
      type: DataTypes.CHAR(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Asset_Master',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__Asset_Ma__2DDE52412DF7F801",
        unique: true,
        fields: [
          { name: "AssetCode" },
        ]
      },
    ]
  });
};
