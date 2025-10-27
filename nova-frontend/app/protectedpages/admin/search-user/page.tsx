'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface User {
  EmpNo: string;
  EmpName: string;
}

interface EmployeeDetails {
  EmpNo: string;
  EmpName: string;
  EmpContNo: string;
  LastLocation: string | null;
}

interface EmployeeDetailsResponse {
  message: string;
  employee: EmployeeDetails;
}

interface Asset {
  AssetCode: string;
  AssetDescription: string;
  AssetType: string;
  AssetBrand?: string;
  AssetModel?: string;
  AssetSlno?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SearchUserPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get auth token from session storage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('token');
    }
    return null;
  };

  // Configure axios with auth header
  const getAuthConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/utils/get-employees`,
          getAuthConfig()
        );
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.EmpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.EmpNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch employee details
  const fetchEmployeeDetails = async (empNo: string) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/utils/employee-details/${empNo}`,
        getAuthConfig()
      );
      setEmployeeDetails(response.data.employee);
      setError('');
    } catch (err) {
      setError('Failed to fetch employee details');
      console.error('Error fetching employee details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Fetch user assets when a user is selected
  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    setEmployeeDetails(null); // Reset employee details
    
    try {
      // Fetch both employee details and assets in parallel
      const [assetsResponse] = await Promise.all([
        axios.post(
          `${apiUrl}/utils/get-current-assets-by-empcode`,
          { empcode: user.EmpNo },
          getAuthConfig()
        ),
        fetchEmployeeDetails(user.EmpNo)
      ]);
      
      setUserAssets(assetsResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Search</h1>

      <Input
        type="text"
        placeholder="Search by name or employee number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6"
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.EmpNo}
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.EmpNo === user.EmpNo
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <h3 className="font-medium">{user.EmpName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Employee No: {user.EmpNo}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Details and Assets */}
        <div className="md:col-span-2">
          {selectedUser ? (
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  {detailsLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : employeeDetails ? (
                    <>
                      <p className="text-lg">
                        <span className="font-medium">Name:</span> {employeeDetails.EmpName}
                      </p>
                      <p className="text-lg">
                        <span className="font-medium">Employee No:</span> {employeeDetails.EmpNo}
                      </p>
                      <p className="text-lg">
                        <span className="font-medium">Contact No:</span> {employeeDetails.EmpContNo}
                      </p>
                      <p className="text-lg">
                        <span className="font-medium">Last Location:</span> {employeeDetails.LastLocation || 'Not specified'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg">
                        <span className="font-medium">Name:</span> {selectedUser.EmpName}
                      </p>
                      <p className="text-lg">
                        <span className="font-medium">Employee No:</span> {selectedUser.EmpNo}
                      </p>
                    </>
                  )}
                </div>

                <h3 className="text-xl font-semibold mb-4">Assigned Assets</h3>
                {loading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : userAssets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userAssets.map((asset) => (
                      <Card key={asset.AssetCode} className="bg-muted/50">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">{asset.AssetDescription}</h4>
                          <p className="text-sm text-muted-foreground">
                            Asset Code: {asset.AssetCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Type: {asset.AssetType}
                          </p>
                          {asset.AssetBrand && (
                            <p className="text-sm text-muted-foreground">
                              Brand: {asset.AssetBrand}
                            </p>
                          )}
                          {asset.AssetModel && (
                            <p className="text-sm text-muted-foreground">
                              Model: {asset.AssetModel}
                            </p>
                          )}
                          {asset.AssetSlno && (
                            <p className="text-sm text-muted-foreground">
                              Serial No: {asset.AssetSlno}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No assets assigned to this user
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  Select a user to view their details and assets
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUserPage;
