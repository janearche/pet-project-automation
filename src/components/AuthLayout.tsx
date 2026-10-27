import { Box, Divider, Stack, Typography } from '@mui/material';
import { TaskAltOutlined } from '@mui/icons-material';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: 'background.default' }}>
    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: { md: 5, lg: 8 }, bgcolor: '#222e63', color: '#fff', backgroundImage: 'radial-gradient(circle at 12% 12%, rgba(126,145,255,.36), transparent 35%), linear-gradient(145deg,#1d285a,#303f89)' }}>
      <Stack direction="row" alignItems="center" spacing={1.25}><Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: '#fff', color: '#4056c8' }}><TaskAltOutlined /></Box><Typography sx={{ fontWeight: 750, fontSize: 19 }}>Daymark</Typography></Stack>
      <Box sx={{ maxWidth: 500 }}><Typography variant="overline" sx={{ color: '#b9c5ff' }}>A CALMER WAY TO GET THERE</Typography><Typography sx={{ fontSize: { md: 42, lg: 54 }, fontWeight: 750, letterSpacing: '-.05em', lineHeight: 1.08, mt: 1.5 }}>Make room for<br />what matters.</Typography><Typography sx={{ color: '#d7dcf3', lineHeight: 1.8, maxWidth: 390, mt: 2 }}>Bring tasks, projects, and your next small steps together in one clear place.</Typography><Divider sx={{ borderColor: '#ffffff28', my: 4 }} /><Typography variant="body2" sx={{ color: '#e1e5f7' }}>Small steps count. Keep yours moving.</Typography></Box>
      <Typography variant="caption" sx={{ color: '#c0c8ea' }}>Your personal workspace</Typography>
    </Box>
    <Box sx={{ display: 'grid', placeItems: 'center', p: 2.5 }}>{children}</Box>
  </Box>;
}
