import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import type { FormEvent } from 'react';
import AuthLayout from '../components/AuthLayout';

interface LoginPageProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegisterClick: () => void;
  error: string;
}

export default function LoginPage({ onLogin, onRegisterClick, error }: LoginPageProps) {
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true);
    try { await onLogin({ email: String(data.get('email') || ''), password: String(data.get('password') || '') }); } catch { /* Parent renders the API error. */ }
    finally { setBusy(false); }
  }
  return <AuthLayout><Card sx={{ width: '100%', maxWidth: 430, border: '1px solid #e8eaf1', boxShadow: '0 16px 50px rgba(28,38,80,.08)' }}><CardContent sx={{ p: { xs: 3, sm: 4 } }}>
    <Box sx={{ display: { md: 'none' }, mb: 4 }}><Typography variant="h2" color="primary">Daymark</Typography></Box>
    <Typography variant="overline" color="primary.main">YOUR WORKSPACE</Typography><Typography variant="h1" sx={{ mt: .5, fontSize: 30 }}>Welcome back</Typography><Typography color="text.secondary" sx={{ mt: .75, mb: 3 }}>Sign in to pick up where you left off.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <form onSubmit={submit}><Stack spacing={2}><TextField name="email" type="email" label="Email" autoComplete="username" defaultValue="demo@daymark.local" required /><TextField name="password" type="password" label="Password" autoComplete="current-password" defaultValue="daymark-demo-123" required /><Button type="submit" variant="contained" size="large" endIcon={<ArrowForward />} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button></Stack></form>
    <Alert severity="info" variant="outlined" sx={{ mt: 3, fontSize: 12 }}>Demo credentials are prefilled. You can also register a separate account.</Alert>
    <Divider sx={{ my: 2.5 }} /><Typography variant="body2" color="text.secondary" textAlign="center">New to Daymark? <Link component="button" type="button" onClick={onRegisterClick} underline="hover" fontWeight={700}>Register</Link></Typography>
  </CardContent></Card></AuthLayout>;
}
