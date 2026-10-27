import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Stack, TextField, Typography } from '@mui/material';
import { ArrowForward, TaskAltOutlined } from '@mui/icons-material';
import type { FormEvent } from 'react';

interface LoginPageProps { onLogin: (credentials: { email: string; password: string }) => Promise<void>; error: string }

export default function LoginPage({ onLogin, error }: LoginPageProps) {
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true);
    try { await onLogin({ email: String(data.get('email') || ''), password: String(data.get('password') || '') }); } catch { /* Parent renders the API error. */ }
    finally { setBusy(false); }
  }
  return <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: 'background.default' }}>
    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: { md: 5, lg: 8 }, bgcolor: '#222e63', color: '#fff', backgroundImage: 'radial-gradient(circle at 12% 12%, rgba(126,145,255,.36), transparent 35%), linear-gradient(145deg,#1d285a,#303f89)' }}>
      <Stack direction="row" alignItems="center" spacing={1.25}><Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: '#fff', color: '#4056c8' }}><TaskAltOutlined /></Box><Typography fontWeight={750} fontSize={19}>Daymark</Typography></Stack>
      <Box sx={{ maxWidth: 500 }}><Typography variant="overline" sx={{ color: '#b9c5ff' }}>A CALMER WAY TO GET THERE</Typography><Typography sx={{ fontSize: { md: 42, lg: 54 }, fontWeight: 750, letterSpacing: '-.05em', lineHeight: 1.08, mt: 1.5 }}>Make room for<br />what matters.</Typography><Typography sx={{ color: '#d7dcf3', lineHeight: 1.8, maxWidth: 390, mt: 2 }}>Bring tasks, projects, and your next small steps together in one clear place.</Typography><Divider sx={{ borderColor: '#ffffff28', my: 4 }} /><Typography variant="body2" sx={{ color: '#e1e5f7' }}>Small steps count. Keep yours moving.</Typography></Box>
      <Typography variant="caption" sx={{ color: '#c0c8ea' }}>Your personal workspace</Typography>
    </Box>
    <Box sx={{ display: 'grid', placeItems: 'center', p: 2.5 }}><Card sx={{ width: '100%', maxWidth: 430, border: '1px solid #e8eaf1', boxShadow: '0 16px 50px rgba(28,38,80,.08)' }}><CardContent sx={{ p: { xs: 3, sm: 4 } }}><Box sx={{ display: { md: 'none' }, mb: 4 }}><Typography variant="h2" color="primary">Daymark</Typography></Box><Typography variant="overline" color="primary.main">YOUR WORKSPACE</Typography><Typography variant="h1" sx={{ mt: .5, fontSize: 30 }}>Welcome back</Typography><Typography color="text.secondary" sx={{ mt: .75, mb: 3 }}>Sign in to pick up where you left off.</Typography>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<form onSubmit={submit}><Stack spacing={2}><TextField name="email" type="email" label="Email" autoComplete="username" defaultValue="demo@daymark.local" required /><TextField name="password" type="password" label="Password" autoComplete="current-password" defaultValue="daymark-demo-123" required /><Button type="submit" variant="contained" size="large" endIcon={<ArrowForward />} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button></Stack></form><Alert severity="info" variant="outlined" sx={{ mt: 3, fontSize: 12 }}>Demo credentials are prefilled. Change them before deployment.</Alert></CardContent></Card></Box>
  </Box>;
}
