'use client';

import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';


async function deleteAccount() {
    const response = await fetch('/api/user', {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();

  const deleteMutation = useMutation({
      mutationFn: deleteAccount,
      onSuccess: () => {
          signOut({ callbackUrl: '/login' });
      },
      onError: (error) => {
          console.error("Error deleting account:", error);
          alert("Failed to delete account. Please try again.");
      }
  });

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
        deleteMutation.mutate();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader title="Appearance" subheader="Customize the look and feel of the application." />
          <CardContent>
            <FormControl>
              <FormLabel id="theme-radio-buttons-group-label">Theme</FormLabel>
              <RadioGroup
                aria-labelledby="theme-radio-buttons-group-label"
                defaultValue="system"
                name="theme-radio-buttons-group"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                <FormControlLabel value="system" control={<Radio />} label="System" />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        {session?.user && (
            <Card>
                <CardHeader title="Profile" subheader="This is your public profile information." />
                <CardContent className="flex items-center gap-4">
                    {session.user.image && (
                        <Image
                            src={session.user.image}
                            alt="User avatar"
                            width={80}
                            height={80}
                            className="rounded-full"
                        />
                    )}
                    <div>
                        <Typography variant="h6">{session.user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{session.user.email}</Typography>
                    </div>
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader title="Danger Zone" subheader="These actions are permanent and cannot be undone." />
            <CardContent>
                <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
