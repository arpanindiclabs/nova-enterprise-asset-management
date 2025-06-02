-- Table: OfficeAssetBrands
CREATE TABLE [dbo].[OfficeAssetBrands] (
  [Brands] VARCHAR(100) NULL,
  [AssetTypes] VARCHAR(100) NULL
);


-- Table: IT_Hardware_Actions
CREATE TABLE [dbo].[IT_Hardware_Actions] (
  [Title] VARCHAR(50) NOT NULL,
  [Action_Date] DATE NULL,
  [Action_Type] VARCHAR(50) NULL,
  [Action_Details] TEXT(2147483647) NULL,
  [In_Out] VARCHAR(10) NULL,
  [Received_From] VARCHAR(100) NULL,
  [Issue_To] VARCHAR(100) NULL,
  [Entered_By] VARCHAR(50) NULL,
  [Expenses] DECIMAL NULL,
  [Remarks] TEXT(2147483647) NULL,
  [RecID] INT NOT NULL
);


-- Table: SupportCalls
CREATE TABLE [dbo].[SupportCalls] (
  [RecID] INT NOT NULL,
  [Call_Id] VARCHAR(12) NOT NULL,
  [AssetCode] VARCHAR(50) NULL,
  [AssetType] VARCHAR(50) NULL,
  [CallRegDate] DATETIME NULL,
  [Empno] CHAR(8) NULL,
  [UserName] VARCHAR(100) NULL,
  [IssueType] VARCHAR(100) NULL,
  [IssueDetails] TEXT(2147483647) NULL,
  [EnteredBy] CHAR(8) NULL,
  [CallAssignTo] CHAR(8) NULL,
  [ServiceCost] DECIMAL NULL,
  [CallStatus] VARCHAR(50) NULL,
  [ClosedBy] CHAR(8) NULL,
  [CloseDate] DATETIME NULL,
  [CallRemarks] TEXT(2147483647) NULL,
  [UpdatedBy] CHAR(8) NULL,
  [CallDetail_ID] INT NULL,
  [callAssignedDt] DATETIME NULL,
  [CallAttainedBy] CHAR(8) NULL,
  [ActionTaken] TEXT(2147483647) NULL,
  [ActionTakenDt] DATETIME NULL,
  [CallEscalationNo] VARCHAR(50) NULL,
  [EscalationTo] CHAR(8) NULL,
  [EscalationDt] DATETIME NULL,
  [CallDetailStatus] VARCHAR(50) NULL,
  [CallDetailRemarks] TEXT(2147483647) NULL,
  [ResolveStatus] BIT NULL,
  [EscalationStatus] BIT NULL
);


-- Table: Department
CREATE TABLE [dbo].[Department] (
  [DeptRecID] INT NOT NULL,
  [DeptCode] CHAR(8) NOT NULL,
  [DeptName] NVARCHAR(100) NULL
);


-- Table: Company
CREATE TABLE [dbo].[Company] (
  [CompRecID] INT NOT NULL,
  [CompCode] CHAR(8) NOT NULL,
  [CompName] NVARCHAR(100) NULL
);


-- Table: VendorMast
CREATE TABLE [dbo].[VendorMast] (
  [VendorRecID] INT NOT NULL,
  [VendorCode] CHAR(8) NOT NULL,
  [VendorName] NVARCHAR(100) NULL,
  [VendorDesc] NVARCHAR(200) NULL,
  [VendorAddress] NVARCHAR(100) NULL,
  [VendorCont] NVARCHAR(20) NULL,
  [VendorRemarks] NVARCHAR(100) NULL
);


-- Table: EmployeeMast
CREATE TABLE [dbo].[EmployeeMast] (
  [EmpRecID] INT NOT NULL,
  [EmpNo] CHAR(8) NOT NULL,
  [EmpName] NVARCHAR(100) NULL,
  [EmpCompID] CHAR(8) NULL,
  [EmpDeptID] CHAR(8) NULL,
  [EmpContNo] NVARCHAR(20) NULL,
  [IsActive] INT NULL,
  [Username] NVARCHAR(50) NULL,
  [Password] VARBINARY(256) NULL,
  [LastLogin] DATETIME NULL,
  [LastLocation] VARCHAR(50) NULL,
  [IsAdmin] BIT NULL,
  [location] VARCHAR(400) NULL
);


-- Table: StockReturns
CREATE TABLE [dbo].[StockReturns] (
  [recid] INT NOT NULL,
  [from_empcode] CHAR(8) NOT NULL,
  [assetcode] CHAR(8) NOT NULL,
  [approve_status] BIT NULL,
  [remarks] VARCHAR(255) NULL,
  [approved_by] CHAR(8) NULL,
  [approved_at] DATETIME NULL,
  [remarks_from] VARCHAR(255) NULL,
  [request_time] DATETIME NULL
);


-- Table: Asset_Master
CREATE TABLE [dbo].[Asset_Master] (
  [AssetRecID] INT NOT NULL,
  [AssetCode] CHAR(8) NOT NULL,
  [AssetERP_Code] VARCHAR(30) NULL,
  [AssetType] VARCHAR(30) NULL,
  [AssetDescription] VARCHAR(300) NULL,
  [PurchaseDate] DATE NULL,
  [OwnerCompany] VARCHAR(50) NULL,
  [PurchaseEmployeeName] VARCHAR(50) NULL,
  [PoNo] VARCHAR(30) NULL,
  [PoDate] DATE NULL,
  [PurchasedPrice] FLOAT NULL,
  [VendorName] VARCHAR(50) NULL,
  [WarrantyDate] DATE NULL,
  [IsIssued] INT NULL,
  [UserContNo] VARCHAR(20) NULL,
  [UserCompany] VARCHAR(50) NULL,
  [IssuedDate] DATE NULL,
  [IssuedSite] VARCHAR(50) NULL,
  [IsActive] INT NULL,
  [IsScrraped] BIT NULL,
  [ScrapedDate] DATE NULL,
  [Remarks1] VARCHAR(200) NULL,
  [Remarks2] VARCHAR(200) NULL,
  [Remarks3] VARCHAR(200) NULL,
  [AssetBrand] NVARCHAR(50) NULL,
  [AssetModel] NVARCHAR(50) NULL,
  [AssetSlno] NVARCHAR(30) NULL,
  [Location] NVARCHAR(50) NULL,
  [CurrentEmpNo] NCHAR(10) NULL,
  [InProcess] BIT NULL,
  [ProcessID] NCHAR(10) NULL,
  [InTransit] BIT NULL
);


-- Table: Customers
CREATE TABLE [dbo].[Customers] (
  [CustomerID] INT NOT NULL,
  [Name] NVARCHAR(100) NULL,
  [Email] NVARCHAR(100) NULL,
  [CustomerDescription] VARCHAR(MAX) NULL
);


-- Table: Orders
CREATE TABLE [dbo].[Orders] (
  [OrderID] INT NOT NULL,
  [OrderDate] DATE NULL,
  [Amount] DECIMAL NULL,
  [CustomerID] INT NULL,
  [OrderDescription] VARCHAR(2000) NULL
);


-- Table: Issue_Register
CREATE TABLE [dbo].[Issue_Register] (
  [IssueRecID] INT NOT NULL,
  [IssuedID] INT NOT NULL,
  [AssetCode] CHAR(8) NULL,
  [IssueDate] DATE NULL,
  [IssueType] VARCHAR(20) NULL,
  [IssueEmpno] CHAR(8) NULL,
  [IssueEmpName] VARCHAR(50) NULL,
  [IssueLocation] VARCHAR(50) NULL,
  [IssueStatus] INT NULL,
  [ReturenStatus] INT NULL,
  [ReturnDate] DATE NULL,
  [IssuedBy] VARCHAR(50) NULL,
  [Remarks1] VARCHAR(200) NULL,
  [Remarks2] VARCHAR(200) NULL
);


-- Table: sysdiagrams
CREATE TABLE [dbo].[sysdiagrams] (
  [name] NVARCHAR(128) NOT NULL,
  [principal_id] INT NOT NULL,
  [diagram_id] INT NOT NULL,
  [version] INT NULL,
  [definition] VARBINARY NULL
);


-- Table: AssetTransferRegister
CREATE TABLE [dbo].[AssetTransferRegister] (
  [RecID] INT NOT NULL,
  [TransferCode] CHAR(8) NOT NULL,
  [AssetCode] CHAR(8) NULL,
  [AssetDesc] CHAR(50) NULL,
  [TransferFrom] CHAR(8) NULL,
  [TransferTo] CHAR(8) NULL,
  [ReasonOfTransfer] VARCHAR(200) NULL,
  [ApproveByTransTo] INT NULL,
  [ApproveByAdmin] INT NULL,
  [Remarks] VARCHAR(200) NULL,
  [EnteredBy] CHAR(8) NULL,
  [TimeOfTransfer] DATETIME NULL,
  [TimeOfApproval] DATETIME NULL
);


-- Table: Call_LogMaster
CREATE TABLE [dbo].[Call_LogMaster] (
  [RecID] INT NOT NULL,
  [Call_Id] CHAR(10) NOT NULL,
  [AssetCode] CHAR(8) NULL,
  [CallRegDate] DATETIME NULL,
  [AssetType] VARCHAR(50) NULL,
  [Empno] CHAR(8) NULL,
  [UserName] VARCHAR(50) NULL,
  [IssueType] VARCHAR(50) NULL,
  [IssueDetails] VARCHAR(300) NULL,
  [EnteredBy] CHAR(8) NULL,
  [CallAssignTo] CHAR(8) NULL,
  [ServiceCost] FLOAT NULL,
  [CallStatus] VARCHAR(20) NULL,
  [ClosedBy] CHAR(8) NULL,
  [CloseDate] DATETIME NULL,
  [CallRemarks] VARCHAR(300) NULL,
  [UpdatedBy] CHAR(8) NULL
);


-- Table: CallDetails
CREATE TABLE [dbo].[CallDetails] (
  [RecID] INT NOT NULL,
  [CallDetail_ID] CHAR(8) NOT NULL,
  [callAssignedDt] DATETIME NULL,
  [CallAttainedBy] CHAR(8) NULL,
  [ActionTaken] VARCHAR(250) NULL,
  [ActionTakenDt] DATETIME NULL,
  [CallEscalationNo] INT NULL,
  [EscalationTo] CHAR(8) NULL,
  [EscalationDt] DATETIME NULL,
  [CallStatu] CHAR(10) NULL,
  [Remarks] VARCHAR(200) NULL,
  [Call_Id] CHAR(10) NULL,
  [EnteredBy] CHAR(8) NULL
);

