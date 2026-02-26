'use client';

import Chip from '@mui/material/Chip';

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'default' },
  in_progress: { label: 'Em Progresso', color: 'info' },
  done: { label: 'Concluído', color: 'success' },
  todo: { label: 'A Fazer', color: 'default' },
  testing: { label: 'Testando', color: 'warning' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'success' },
  medium: { label: 'Média', color: 'info' },
  high: { label: 'Alta', color: 'warning' },
  critical: { label: 'Crítica', color: 'error' },
};

export function StatusChip({ status, size = 'small', ...props }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'default' };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
      {...props}
    />
  );
}

export function PriorityChip({ priority, size = 'small', ...props }) {
  const config = PRIORITY_CONFIG[priority] || { label: priority, color: 'default' };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="filled"
      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
      {...props}
    />
  );
}
