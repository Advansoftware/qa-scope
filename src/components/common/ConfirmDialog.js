'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (t) =>
              variant === 'danger'
                ? alpha(t.palette.error.main, 0.1)
                : alpha(t.palette.warning.main, 0.1),
          }}
        >
          <WarningRoundedIcon
            color={variant === 'danger' ? 'error' : 'warning'}
            fontSize="small"
          />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={variant === 'danger' ? 'error' : 'warning'}
          size="small"
          disabled={loading}
        >
          {loading ? 'Aguarde...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
