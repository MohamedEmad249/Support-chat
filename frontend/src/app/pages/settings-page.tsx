import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Save, Upload } from 'lucide-react';
import { roleLabel, useAuth } from '../../features/auth/AuthProvider';
import { usePreferences } from '../../features/preferences/PreferencesProvider';
import { avatarUrl } from '../../features/conversations/utils';
import { supabase } from '../../lib/supabaseClient';

export default function SettingsPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { preferences, updateNotifications, updateAppearance } = usePreferences();
  const [mounted, setMounted] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('Student Services');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!profile) return;
    const parts = profile.full_name.split(' ');
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' ') ?? '');
  }, [profile]);

  const displayTheme = mounted ? theme ?? 'light' : 'light';

  const handleSaveProfile = () => {
    toast.success('Profile saved locally', {
      description: `${firstName} ${lastName} · ${roleLabel(profile?.role)}`,
    });
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleSaveAppearance = () => {
    toast.success('Appearance updated', { description: `Theme: ${displayTheme}` });
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Password updated');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSignOutAll = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    await signOut();
    toast.success('Signed out of all sessions');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid lg:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account from the support chat system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl(profile?.full_name ?? 'User')} />
                  <AvatarFallback>{profile?.full_name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => toast.info('Photo upload is not connected to storage in this demo')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload new photo
                </Button>
              </div>
              <Separator />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={roleLabel(profile?.role)} disabled className="bg-gray-50 dark:bg-gray-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => void refreshProfile()}>
                  Refresh from server
                </Button>
                <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ['emailNewConversation', 'New conversation assigned', preferences.notifications.emailNewConversation],
                  ['emailDailySummary', 'Daily summary', preferences.notifications.emailDailySummary],
                  ['emailUrgent', 'Urgent escalations', preferences.notifications.emailUrgent],
                  ['pushBrowser', 'Browser notifications', preferences.notifications.pushBrowser],
                  ['pushSound', 'Sound alerts', preferences.notifications.pushSound],
                  ['teamMentions', 'Team mentions', preferences.notifications.teamMentions],
                  ['weeklyReports', 'Weekly reports', preferences.notifications.weeklyReports],
                ] as const
              ).map(([key, label, checked]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label>{label}</Label>
                  <Switch
                    checked={checked}
                    onCheckedChange={(v) => updateNotifications({ [key]: v })}
                  />
                </div>
              ))}
              <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={displayTheme}
                  onValueChange={(v) => {
                    setTheme(v);
                    toast.success(`Theme set to ${v}`);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary color</Label>
                <div className="grid grid-cols-6 gap-3">
                  {['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-12 h-12 rounded-lg border-2 transition-colors ${
                        preferences.appearance.primaryColor === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        updateAppearance({ primaryColor: color });
                        toast.success('Primary color updated');
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Compact mode</Label>
                <Switch
                  checked={preferences.appearance.compactMode}
                  onCheckedChange={(v) => updateAppearance({ compactMode: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show sidebar labels</Label>
                <Switch
                  checked={preferences.appearance.sidebarLabels}
                  onCheckedChange={(v) => updateAppearance({ sidebarLabels: v })}
                />
              </div>
              <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveAppearance}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" onClick={() => void handleChangePassword()}>
                Change Password
              </Button>
              <Separator />
              <p className="text-sm text-gray-500">
                Each browser tab keeps its own login (session storage). Use below to sign out everywhere.
              </p>
              <Button type="button" variant="destructive" onClick={() => void handleSignOutAll()}>
                Sign out all sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
