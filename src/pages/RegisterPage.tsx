import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { PersonAddAlt1 } from '@mui/icons-material';
import type { FormEvent } from 'react';
import AuthLayout from '../components/AuthLayout';
import type { RegistrationInput } from '../types';

interface RegisterPageProps {
  onRegister: (input: RegistrationInput) => Promise<void>;
  onLoginClick: () => void;
}

function errorText(error: unknown): string { return error instanceof Error ? error.message : 'Could not create your account.'; }

export default function RegisterPage({ onRegister, onLoginClick }: RegisterPageProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') || '');
    const confirmation = String(data.get('confirmPassword') || '');
    if (password !== confirmation) { setError('The passwords do not match.'); return; }
    setBusy(true); setError('');
    try {
      await onRegister({ name: String(data.get('name') || ''), email: String(data.get('email') || ''), password });
    } catch (problem) { setError(errorText(problem)); }
    finally { setBusy(false); }
  }

  return <AuthLayout><Card sx={{ width: '100%', maxWidth: 450, border: '1px solid #e8eaf1', boxShadow: '0 16px 50px rgba(28,38,80,.08)' }}><CardContent sx={{ p: { xs: 3, sm: 4 } }}>
    <Box sx={{ display: { md: 'none' }, mb: 4 }}><Typography variant="h2" color="primary">Daymark</Typography></Box>
    <Typography variant="overline" color="primary.main">CREATE YOUR WORKSPACE</Typography><Typography variant="h1" sx={{ mt: .5, fontSize: 30 }}>Create an account</Typography><Typography color="text.secondary" sx={{ mt: .75, mb: 3 }}>Start with a clear space for your tasks and projects.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <form onSubmit={submit}><Stack spacing={2}><TextField name="name" label="Your name" autoComplete="name" required inputProps={{ maxLength: 50 }} autoFocus /><TextField name="email" type="email" label="Email" autoComplete="email" required /><TextField name="password" type="password" label="Password" autoComplete="new-password" helperText="Use at least 8 characters." inputProps={{ minLength: 8, maxLength: 128 }} required /><TextField name="confirmPassword" type="password" label="Confirm password" autoComplete="new-password" inputProps={{ minLength: 8, maxLength: 128 }} required /><Button type="submit" variant="contained" size="large" startIcon={<PersonAddAlt1 />} disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button></Stack></form>
    <Divider sx={{ my: 2.5 }} /><Typography variant="body2" color="text.secondary" textAlign="center">Already have an account? <Link component="button" type="button" onClick={onLoginClick} underline="hover" fontWeight={700}>Sign in</Link></Typography>
  </CardContent></Card></AuthLayout>;
}
