'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Check, X, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface UserProfile {
  EmpNo: string;
  EmpName: string;
  EmpContNo: string;
  Latitude?: number;
  Longitude?: number;
  Password: {
    type: string;
    data: number[];
  };
}

export default function UserSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${apiUrl}/utils/my-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setFormData(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.EmpName?.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.EmpContNo?.trim()) {
      toast.error('Contact number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const requestData = {
        ...formData,
        Latitude: formData.Latitude ? Number(formData.Latitude) : null,
        Longitude: formData.Longitude ? Number(formData.Longitude) : null
      };

      const response = await fetch(`${apiUrl}/utils/update-profile/${sessionStorage.getItem('EmpNo')?.slice(1, -1)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${apiUrl}/utils/update-password/${sessionStorage.getItem('EmpNo')?.slice(1, -1)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight">Profile Settings</CardTitle>
              <CardDescription className="mt-1">Manage your account information and preferences</CardDescription>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
              disabled={submitting}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="EmpNo" className="text-sm font-medium text-muted-foreground">Employee Number</Label>
                  <p className="mt-1 text-xl font-semibold">{profile?.EmpNo}</p>
                </div>
                <div>
                  <Label htmlFor="EmpName" className="text-sm font-medium text-muted-foreground">Name</Label>
                  {isEditing ? (
                    <Input
                      id="EmpName"
                      name="EmpName"
                      value={formData.EmpName || ''}
                      onChange={handleInputChange}
                      className="mt-1 text-lg"
                      required
                    />
                  ) : (
                    <p className="mt-1 text-xl font-semibold">{profile?.EmpName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="EmpContNo" className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                  {isEditing ? (
                    <Input
                      id="EmpContNo"
                      name="EmpContNo"
                      value={formData.EmpContNo || ''}
                      onChange={handleInputChange}
                      className="mt-1 text-lg"
                      required
                    />
                  ) : (
                    <p className="mt-1 text-xl font-semibold">{profile?.EmpContNo}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Coordinates</Label>
                  {isEditing ? (
                    <div className="space-y-4 mt-1">
                      <Input
                        type="number"
                        name="Latitude"
                        placeholder="Latitude"
                        value={formData.Latitude || ''}
                        onChange={handleInputChange}
                        className="text-lg"
                        step="any"
                      />
                      <Input
                        type="number"
                        name="Longitude"
                        placeholder="Longitude"
                        value={formData.Longitude || ''}
                        onChange={handleInputChange}
                        className="text-lg"
                        step="any"
                      />
                    </div>
                  ) : (
                    <p className="mt-1 text-xl font-semibold">
                      {profile?.Latitude && profile?.Longitude 
                        ? `${profile.Latitude}, ${profile.Longitude}`
                        : 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={submitting}
                  className="gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={passwordSubmitting}
                className="gap-2"
              >
                {passwordSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {passwordSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 