# Postman Request Samples for Nova Enterprise Asset Management API

## Base URL
```
http://localhost:3000/api/utils
```
*Note: Replace `localhost:3000` with your actual server URL*

## Authentication
For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. GET Asset Types
**Endpoint:** `GET /asset-types`
**Description:** Returns an array of asset types

### Request
```
GET http://localhost:3000/api/utils/asset-types
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
["Laptop", "Desktop", "Monitor", "Keyboard", "Mouse"]
```

---

## 2. GET Brands
**Endpoint:** `GET /brands`
**Description:** Returns an array of brands

### Request
```
GET http://localhost:3000/api/utils/brands
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
["Dell", "HP", "Lenovo", "Apple", "Samsung"]
```

---

## 3. GET Free Assets
**Endpoint:** `GET /get-free-assets`
**Description:** Returns available assets that are not issued

### Request
```
GET http://localhost:3000/api/utils/get-free-assets
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
[
  {
    "AssetCode": "LAP001",
    "AssetDescription": "Dell Laptop",
    "AssetType": "Laptop",
    "VendorName": "Dell Inc"
  },
  {
    "AssetCode": "DESK002",
    "AssetDescription": "HP Desktop",
    "AssetType": "Desktop",
    "VendorName": "HP Inc"
  }
]
```

---

## 4. GET Employee Codes
**Endpoint:** `GET /get-employee-codes`
**Description:** Returns an array of employee codes

### Request
```
GET http://localhost:3000/api/utils/get-employee-codes
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
["EMP001", "EMP002", "EMP003", "EMP004"]
```

---

## 5. GET Employees
**Endpoint:** `GET /get-employees`
**Description:** Returns employee numbers and names

### Request
```
GET http://localhost:3000/api/utils/get-employees
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
[
  {
    "EmpNo": "EMP001",
    "EmpName": "John Doe"
  },
  {
    "EmpNo": "EMP002",
    "EmpName": "Jane Smith"
  }
]
```

---

## 6. GET Companies
**Endpoint:** `GET /get-companies`
**Description:** Returns company codes and names

### Request
```
GET http://localhost:3000/api/utils/get-companies
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
[
  {
    "CompCode": "COMP001",
    "CompName": "Nova Technologies"
  },
  {
    "CompCode": "COMP002",
    "CompName": "Tech Solutions Inc"
  }
]
```

---

## 7. GET Company Names
**Endpoint:** `GET /get-company-names`
**Description:** Returns an array of company names

### Request
```
GET http://localhost:3000/api/utils/get-company-names
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
["Nova Technologies", "Tech Solutions Inc", "Global Corp"]
```

---

## 8. POST Get Company Code
**Endpoint:** `POST /get-company-code`
**Description:** Get company code by company name

### Request
```
POST http://localhost:3000/api/utils/get-company-code
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "companyName": "Nova Technologies"
}
```

### Expected Response
```json
{
  "CompCode": "COMP001"
}
```

---

## 9. POST Get Current Assets by Employee Code
**Endpoint:** `POST /get-current-assets-by-empcode`
**Description:** Get assets assigned to a specific employee

### Request
```
POST http://localhost:3000/api/utils/get-current-assets-by-empcode
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "empcode": "EMP001"
}
```

### Expected Response
```json
[
  {
    "AssetCode": "LAP001",
    "AssetType": "Laptop",
    "AssetDescription": "Dell Laptop",
    "AssetBrand": "Dell",
    "AssetModel": "Latitude 5520",
    "AssetSlno": "SN123456"
  }
]
```

---

## 10. GET Assets by Employee Number
**Endpoint:** `GET /assets/:empNo`
**Description:** Get assets for a specific employee

### Request
```
GET http://localhost:3000/api/utils/assets/EMP001
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
{
  "message": "Assets for employee EMP001",
  "assets": [
    {
      "AssetCode": "LAP001",
      "AssetDescription": "Dell Laptop"
    }
  ]
}
```

---

## 11. GET Assets for Current User (Protected)
**Endpoint:** `GET /assets-for-emp`
**Description:** Get assets for the authenticated user

### Request
```
GET http://localhost:3000/api/utils/assets-for-emp
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

### Expected Response
```json
{
  "message": "Assets for employee EMP001",
  "assets": [
    {
      "AssetCode": "LAP001",
      "AssetDescription": "Dell Laptop"
    }
  ]
}
```

---

## 12. GET My Profile (Protected)
**Endpoint:** `GET /my-profile`
**Description:** Get current user's profile

### Request
```
GET http://localhost:3000/api/utils/my-profile
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

### Expected Response
```json
{
  "EmpNo": "EMP001",
  "EmpName": "John Doe",
  "EmpContNo": "1234567890",
  "Password": "hashed_password_here"
}
```

---

## 13. PUT Update Password (Protected)
**Endpoint:** `PUT /update-password/:empNo`
**Description:** Update user password

### Request
```
PUT http://localhost:3000/api/utils/update-password/EMP001
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

### Body
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

### Expected Response
```json
{
  "message": "Password updated successfully"
}
```

---

## 14. PUT Update Profile (Protected)
**Endpoint:** `PUT /update-profile/:empNo`
**Description:** Update user profile information

### Request
```
PUT http://localhost:3000/api/utils/update-profile/EMP001
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

### Body
```json
{
  "EmpName": "John Smith",
  "EmpContNo": "9876543210"
}
```

### Expected Response
```json
{
  "message": "Profile updated successfully",
  "user": {
    "EmpNo": "EMP001",
    "EmpName": "John Smith",
    "EmpContNo": "9876543210"
  }
}
```

---

## 15. GET Employee Details
**Endpoint:** `GET /employee-details/:empNo`
**Description:** Get detailed employee information

### Request
```
GET http://localhost:3000/api/utils/employee-details/EMP001
```

### Headers
```
Content-Type: application/json
```

### Expected Response
```json
{
  "message": "Employee details for EMP001",
  "employee": {
    "EmpNo": "EMP001",
    "EmpName": "John Doe",
    "EmpContNo": "1234567890"
  }
}
```

---

## 16. GET Is Admin (Protected)
**Endpoint:** `GET /isadmin`
**Description:** Check if current user is admin

### Request
```
GET http://localhost:3000/api/utils/isadmin
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

### Expected Response
```json
{
  "isAdmin": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Employee number is required and must be a string"
}
```

### 401 Unauthorized
```json
{
  "error": "Current password is incorrect"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized: You can only update your own password"
}
```

### 404 Not Found
```json
{
  "error": "Employee not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Postman Collection Setup

1. **Create a new collection** in Postman
2. **Set up environment variables:**
   - `base_url`: `http://localhost:3000/api/utils`
   - `token`: `<your-jwt-token>`
3. **Use the environment variables** in your requests:
   - URL: `{{base_url}}/endpoint-name`
   - Authorization: `Bearer {{token}}`

## Testing Tips

1. **Start with unprotected endpoints** to test basic functionality
2. **Get a JWT token** by logging in through your authentication endpoint
3. **Test protected endpoints** with the token in the Authorization header
4. **Use different employee codes** to test various scenarios
5. **Test error cases** by providing invalid data or missing required fields
