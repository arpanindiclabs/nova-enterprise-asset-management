var DataTypes = require("sequelize").DataTypes;
var _AssetTransferRegister = require("./AssetTransferRegister");
var _Asset_Master = require("./Asset_Master");
var _CallDetails = require("./CallDetails");
var _Call_LogMaster = require("./Call_LogMaster");
var _Company = require("./Company");
var _Customers = require("./Customers");
var _Department = require("./Department");
var _EmployeeMast = require("./EmployeeMast");
var _IT_Hardware_Actions = require("./IT_Hardware_Actions");
var _Issue_Register = require("./Issue_Register");
var _OfficeAssetBrands = require("./OfficeAssetBrands");
var _Orders = require("./Orders");
var _SupportCalls = require("./SupportCalls");
var _VendorMast = require("./VendorMast");

function initModels(sequelize) {
  var AssetTransferRegister = _AssetTransferRegister(sequelize, DataTypes);
  var Asset_Master = _Asset_Master(sequelize, DataTypes);
  var CallDetails = _CallDetails(sequelize, DataTypes);
  var Call_LogMaster = _Call_LogMaster(sequelize, DataTypes);
  var Company = _Company(sequelize, DataTypes);
  var Customers = _Customers(sequelize, DataTypes);
  var Department = _Department(sequelize, DataTypes);
  var EmployeeMast = _EmployeeMast(sequelize, DataTypes);
  var IT_Hardware_Actions = _IT_Hardware_Actions(sequelize, DataTypes);
  var Issue_Register = _Issue_Register(sequelize, DataTypes);
  var OfficeAssetBrands = _OfficeAssetBrands(sequelize, DataTypes);
  var Orders = _Orders(sequelize, DataTypes);
  var SupportCalls = _SupportCalls(sequelize, DataTypes);
  var VendorMast = _VendorMast(sequelize, DataTypes);

  AssetTransferRegister.belongsTo(Asset_Master, { as: "AssetCode_Asset_Master", foreignKey: "AssetCode"});
  Asset_Master.hasMany(AssetTransferRegister, { as: "AssetTransferRegisters", foreignKey: "AssetCode"});
  Issue_Register.belongsTo(Asset_Master, { as: "AssetCode_Asset_Master", foreignKey: "AssetCode"});
  Asset_Master.hasMany(Issue_Register, { as: "Issue_Registers", foreignKey: "AssetCode"});
  Orders.belongsTo(Customers, { as: "Customer", foreignKey: "CustomerID"});
  Customers.hasMany(Orders, { as: "Orders", foreignKey: "CustomerID"});
  AssetTransferRegister.belongsTo(EmployeeMast, { as: "TransferFrom_EmployeeMast", foreignKey: "TransferFrom"});
  EmployeeMast.hasMany(AssetTransferRegister, { as: "AssetTransferRegisters", foreignKey: "TransferFrom"});
  AssetTransferRegister.belongsTo(EmployeeMast, { as: "TransferTo_EmployeeMast", foreignKey: "TransferTo"});
  EmployeeMast.hasMany(AssetTransferRegister, { as: "TransferTo_AssetTransferRegisters", foreignKey: "TransferTo"});
  AssetTransferRegister.belongsTo(EmployeeMast, { as: "EnteredBy_EmployeeMast", foreignKey: "EnteredBy"});
  EmployeeMast.hasMany(AssetTransferRegister, { as: "EnteredBy_AssetTransferRegisters", foreignKey: "EnteredBy"});
  CallDetails.belongsTo(EmployeeMast, { as: "CallAttainedBy_EmployeeMast", foreignKey: "CallAttainedBy"});
  EmployeeMast.hasMany(CallDetails, { as: "CallDetails", foreignKey: "CallAttainedBy"});
  CallDetails.belongsTo(EmployeeMast, { as: "EscalationTo_EmployeeMast", foreignKey: "EscalationTo"});
  EmployeeMast.hasMany(CallDetails, { as: "EscalationTo_CallDetails", foreignKey: "EscalationTo"});
  CallDetails.belongsTo(EmployeeMast, { as: "EnteredBy_EmployeeMast", foreignKey: "EnteredBy"});
  EmployeeMast.hasMany(CallDetails, { as: "EnteredBy_CallDetails", foreignKey: "EnteredBy"});
  Issue_Register.belongsTo(EmployeeMast, { as: "IssueEmpno_EmployeeMast", foreignKey: "IssueEmpno"});
  EmployeeMast.hasMany(Issue_Register, { as: "Issue_Registers", foreignKey: "IssueEmpno"});
  SupportCalls.belongsTo(EmployeeMast, { as: "CallAssignTo_EmployeeMast", foreignKey: "CallAssignTo"});
  EmployeeMast.hasMany(SupportCalls, { as: "SupportCalls", foreignKey: "CallAssignTo"});
  SupportCalls.belongsTo(EmployeeMast, { as: "CallAttainedBy_EmployeeMast", foreignKey: "CallAttainedBy"});
  EmployeeMast.hasMany(SupportCalls, { as: "CallAttainedBy_SupportCalls", foreignKey: "CallAttainedBy"});
  SupportCalls.belongsTo(EmployeeMast, { as: "ClosedBy_EmployeeMast", foreignKey: "ClosedBy"});
  EmployeeMast.hasMany(SupportCalls, { as: "ClosedBy_SupportCalls", foreignKey: "ClosedBy"});
  SupportCalls.belongsTo(EmployeeMast, { as: "Empno_EmployeeMast", foreignKey: "Empno"});
  EmployeeMast.hasMany(SupportCalls, { as: "Empno_SupportCalls", foreignKey: "Empno"});
  SupportCalls.belongsTo(EmployeeMast, { as: "EnteredBy_EmployeeMast", foreignKey: "EnteredBy"});
  EmployeeMast.hasMany(SupportCalls, { as: "EnteredBy_SupportCalls", foreignKey: "EnteredBy"});
  SupportCalls.belongsTo(EmployeeMast, { as: "EscalationTo_EmployeeMast", foreignKey: "EscalationTo"});
  EmployeeMast.hasMany(SupportCalls, { as: "EscalationTo_SupportCalls", foreignKey: "EscalationTo"});
  SupportCalls.belongsTo(EmployeeMast, { as: "UpdatedBy_EmployeeMast", foreignKey: "UpdatedBy"});
  EmployeeMast.hasMany(SupportCalls, { as: "UpdatedBy_SupportCalls", foreignKey: "UpdatedBy"});

  return {
    AssetTransferRegister,
    Asset_Master,
    CallDetails,
    Call_LogMaster,
    Company,
    Customers,
    Department,
    EmployeeMast,
    IT_Hardware_Actions,
    Issue_Register,
    OfficeAssetBrands,
    Orders,
    SupportCalls,
    VendorMast,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
