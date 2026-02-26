'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Link from 'next/link';
import useDashboard from '@/hooks/useDashboard';
import { StatusChip } from '@/components/common/StatusChip';
import EmptyState from '@/components/common/EmptyState';

const STAT_CARDS = [
  {
    key: 'projects',
    label: 'Projetos',
    icon: FolderRoundedIcon,
    color: '#6C63FF',
    href: '/projects',
  },
  {
    key: 'scopes',
    label: 'Escopos',
    icon: PlaylistAddCheckRoundedIcon,
    color: '#00D9A6',
    href: '/scopes',
  },
  {
    key: 'tasks',
    label: 'Tarefas',
    icon: AssignmentRoundedIcon,
    color: '#29B6F6',
    href: '/kanban',
  },
  {
    key: 'done',
    label: 'Concluídas',
    icon: CheckCircleRoundedIcon,
    color: '#66BB6A',
    href: '/kanban',
  },
  {
    key: 'commands',
    label: 'Comandos',
    icon: TerminalRoundedIcon,
    color: '#FFB74D',
    href: '/terminal',
  },
];

function StatCard({ label, value, icon: Icon, color, href }) {
  return (
    <Card
      component={Link}
      href={href}
      sx={{
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 32px ${alpha(color, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ p: '20px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(color, 0.15),
            }}
          >
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
          <TrendingUpRoundedIcon sx={{ color: alpha(color, 0.3), fontSize: 20 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color, mb: 0.5 }}>
          {value ?? 0}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function RecentScopeCard({ scope }) {
  const progress = scope.task_count > 0
    ? Math.round((scope.done_count / scope.task_count) * 100)
    : 0;

  return (
    <Card
      component={Link}
      href={`/scopes/${scope.id}`}
      sx={{ textDecoration: 'none', cursor: 'pointer' }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" noWrap sx={{ flex: 1, mr: 1 }}>
            {scope.title}
          </Typography>
          <StatusChip status={scope.status} />
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ mb: 1.5, display: 'block' }}>
          {scope.project_name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: (t) => alpha(t.palette.primary.main, 0.08),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #6C63FF 0%, #00D9A6 100%)',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 36 }}>
            {progress}%
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
          {scope.done_count}/{scope.task_count} tarefas concluídas
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, loading, fetchDashboard } = useDashboard();

  if (loading) {
    return (
      <Box>
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const { stats, recentScopes } = data || { stats: {}, recentScopes: [] };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Bem-vindo ao QA Scope 🎯
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie seus escopos de teste de forma interativa
          </Typography>
        </Box>
        <Tooltip title="Atualizar">
          <IconButton onClick={fetchDashboard}>
            <RefreshRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {STAT_CARDS.map(({ key, ...cardProps }) => (
          <Grid key={key} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <StatCard {...cardProps} value={stats[key]} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Escopos Recentes
      </Typography>

      {recentScopes.length === 0 ? (
        <EmptyState
          title="Nenhum escopo criado"
          description="Crie um projeto e adicione seu primeiro escopo de teste"
          actionLabel="Ir para Projetos"
          onAction={() => window.location.href = '/projects'}
        />
      ) : (
        <Grid container spacing={2.5}>
          {recentScopes.map((scope) => (
            <Grid key={scope.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <RecentScopeCard scope={scope} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
