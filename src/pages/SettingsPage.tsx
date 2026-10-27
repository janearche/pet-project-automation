import { useState } from 'react';
import { Alert, Avatar, Button, Card, CardContent, Checkbox, FormControlLabel, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import type { FormEvent } from 'react';
import type { Preferences } from '../types';

interface SettingsPageProps { preferences: Preferences; email: string; onSave: (preferences: Preferences) => Promise<void> }
function messageFor(error: unknown): string { return error instanceof Error ? error.message : 'Could not save settings.'; }

export default function SettingsPage({ preferences, email, onSave }: SettingsPageProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setSaving(true); setError(''); setSaved(false);
    try { await onSave({ displayName: String(data.get('displayName') || ''), timezone: String(data.get('timezone') || 'UTC'), weekStartsMonday: data.get('weekStartsMonday') === 'on' }); setSaved(true); }
    catch (problem) { setError(messageFor(problem)); }
    finally { setSaving(false); }
  }
  return <Stack spacing={2.5}>
    <div><Typography variant="overline" color="primary.main">PREFERENCES</Typography><Typography variant="h1">Settings</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>Manage your profile and workspace defaults.</Typography></div>
    <form onSubmit={submit}><Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 6 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: { xs: 2, sm: 3 } }}><Stack spacing={2.5}><Stack direction="row" alignItems="center" spacing={1.5}><Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>{preferences.displayName?.[0]?.toUpperCase() || 'D'}</Avatar><div><Typography variant="h2">Personal details</Typography><Typography variant="body2" color="text.secondary">Your account profile</Typography></div></Stack><TextField name="displayName" label="Display name" defaultValue={preferences.displayName} required inputProps={{ maxLength: 50 }} /><TextField label="Email address" value={email} InputProps={{ readOnly: true }} helperText="Email is managed by the demo account configuration." /></Stack></CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 6 }}><Card sx={{ height: '100%' }}><CardContent sx={{ p: { xs: 2, sm: 3 } }}><Stack spacing={2.5}><div><Typography variant="h2">Workspace preferences</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Set how dates and weeks appear for you.</Typography></div><TextField name="timezone" label="Time zone" select defaultValue={preferences.timezone}><MenuItem value="Europe/Prague">Prague (UTC+1)</MenuItem><MenuItem value="Europe/London">London (UTC)</MenuItem><MenuItem value="America/New_York">New York (UTC−5)</MenuItem><MenuItem value="America/Los_Angeles">Los Angeles (UTC−8)</MenuItem><MenuItem value="UTC">UTC</MenuItem></TextField><FormControlLabel control={<Checkbox name="weekStartsMonday" defaultChecked={preferences.weekStartsMonday} />} label={<div><Typography variant="body2" fontWeight={650}>Start the week on Monday</Typography><Typography variant="caption" color="text.secondary">Use Monday as the first day of your week.</Typography></div>} /></Stack></CardContent></Card></Grid>
      <Grid size={{ xs: 12 }}><Stack direction={{ xs: 'column-reverse', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="flex-end" spacing={1.5}>{error && <Alert severity="error" sx={{ mr: 'auto !important' }}>{error}</Alert>}{saved && <Alert severity="success" sx={{ mr: 'auto !important' }}>Your settings are saved.</Alert>}<Button type="submit" variant="contained" startIcon={<SaveOutlined />} disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</Button></Stack></Grid>
    </Grid></form>
  </Stack>;
}
