import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Bell, Lock, User, CreditCard } from "lucide-react";
import { z } from "zod";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    campaigns: true,
    collaborations: true,
    reports: false,
  });

  // Fetch current user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update password");
      }
      return response.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update password: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update notification preferences
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: typeof notifications) => {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update notifications");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update preferences: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set form values when user data loads
  useEffect(() => {
    if (user) {
      profileForm.setValue("firstName", user.firstName || "");
      profileForm.setValue("lastName", user.lastName || "");
      profileForm.setValue("email", user.email || "");
      profileForm.setValue("role", user.role || "");
    }
  }, [user, profileForm]);

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    updateNotificationsMutation.mutate(newNotifications);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Sarah" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Johnson" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="sarah@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input placeholder="Brand Manager" disabled {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive email updates about campaigns and collaborations</p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(value) => handleNotificationChange('email', value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Campaign Updates</Label>
                      <p className="text-sm text-gray-500">Get notified when campaign status changes</p>
                    </div>
                    <Switch 
                      checked={notifications.campaigns}
                      onCheckedChange={(value) => handleNotificationChange('campaigns', value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Collaboration Requests</Label>
                      <p className="text-sm text-gray-500">Receive notifications for new collaboration requests</p>
                    </div>
                    <Switch 
                      checked={notifications.collaborations}
                      onCheckedChange={(value) => handleNotificationChange('collaborations', value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Get weekly performance summaries</p>
                    </div>
                    <Switch 
                      checked={notifications.reports}
                      onCheckedChange={(value) => handleNotificationChange('reports', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security
                  </CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Billing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Pro Plan</h4>
                    <p className="text-sm text-blue-700">$49/month - Unlimited campaigns and collaborations</p>
                    <p className="text-xs text-blue-600 mt-1">Next billing date: January 15, 2025</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">Update Payment Method</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}