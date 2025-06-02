import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAssets, setUserAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/utils/get-employees');
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

  // Fetch user assets when a user is selected
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const response = await axios.post('/api/utils/get-current-assets-by-empcode', {
        empcode: user.EmpNo
      });
      setUserAssets(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch user assets');
      console.error('Error fetching user assets:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Search
      </Typography>

      <TextField
        fullWidth
        label="Search by name or employee number"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Users
              </Typography>
              {filteredUsers.map((user) => (
                <Box
                  key={user.EmpNo}
                  onClick={() => handleUserSelect(user)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: selectedUser?.EmpNo === user.EmpNo ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="subtitle1">{user.EmpName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employee No: {user.EmpNo}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* User Details and Assets */}
        <Grid item xs={12} md={8}>
          {selectedUser ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Details
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">
                    Name: {selectedUser.EmpName}
                  </Typography>
                  <Typography variant="subtitle1">
                    Employee No: {selectedUser.EmpNo}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Assigned Assets
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : userAssets.length > 0 ? (
                  <Grid container spacing={2}>
                    {userAssets.map((asset) => (
                      <Grid item xs={12} sm={6} key={asset.AssetCode}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1">
                              {asset.AssetDescription}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Asset Code: {asset.AssetCode}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: {asset.AssetType}
                            </Typography>
                            {asset.AssetBrand && (
                              <Typography variant="body2" color="text.secondary">
                                Brand: {asset.AssetBrand}
                              </Typography>
                            )}
                            {asset.AssetModel && (
                              <Typography variant="body2" color="text.secondary">
                                Model: {asset.AssetModel}
                              </Typography>
                            )}
                            {asset.AssetSlno && (
                              <Typography variant="body2" color="text.secondary">
                                Serial No: {asset.AssetSlno}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary">
                    No assets assigned to this user
                  </Typography>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Select a user to view their details and assets
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserSearch; 