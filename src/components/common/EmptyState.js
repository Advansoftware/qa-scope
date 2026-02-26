'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

export default function EmptyState({
  icon: Icon = InboxRoundedIcon,
  title = 'Nada por aqui',
  description = 'Comece criando um novo item.',
  actionLabel,
  onAction,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (t) => alpha(t.palette.primary.main, 0.08),
          mb: 1,
        }}
      >
        <Icon sx={{ fontSize: 40, color: 'text.disabled' }} />
      </Box>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled" textAlign="center" maxWidth={320}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
