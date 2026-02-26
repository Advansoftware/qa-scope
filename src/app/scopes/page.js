'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import useScopes from '@/hooks/useScopes';
import useProjects from '@/hooks/useProjects';
import { StatusChip } from '@/components/common/StatusChip';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Link from 'next/link';

function ScopeFormDialog({ open, onClose, onSubmit, scope = null, projects = [] }) {
  const searchParams = useSearchParams();
  const defaultProjectId = scope?.project_id || searchParams.get('project_id') || '';

  const [title, setTitle] = useState(scope?.title || '');
  const [description, setDescription] = useState(scope?.description || '');
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, project_id: Number(projectId) });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{scope ? 'Editar Escopo' : 'Novo Escopo de Teste'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            select
            fullWidth
            label="Projeto"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            sx={{ mb: 2 }}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Título do Escopo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            placeholder="Descreva o objetivo e critérios de aceitação do escopo de teste..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || !title.trim() || !projectId}>
            {loading ? 'Salvando...' : scope ? 'Salvar' : 'Criar Escopo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function ScopeCard({ scope, onEdit, onDelete }) {
  const progress = scope.task_count > 0
    ? Math.round((scope.done_count / scope.task_count) * 100)
    : 0;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography variant="h6" noWrap>{scope.title}</Typography>
            <Typography variant="caption" color="text.disabled">{scope.project_name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <StatusChip status={scope.status} />
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => onEdit(scope)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton size="small" onClick={() => onDelete(scope)}>
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {scope.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {scope.description}
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
            <Typography variant="caption" color="text.secondary">{progress}%</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Typography variant="caption" color="text.disabled">
              📋 {scope.task_count} tarefas
            </Typography>
            <Typography variant="caption" color="text.disabled">
              ✅ {scope.done_count} concluídas
            </Typography>
            <Typography variant="caption" color="text.disabled">
              ⌨️ {scope.command_count} comandos
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button component={Link} href={`/scopes/${scope.id}`} size="small" variant="outlined" fullWidth>
          Abrir Escopo
        </Button>
        <Button component={Link} href={`/kanban?scope_id=${scope.id}`} size="small" variant="text" sx={{ minWidth: 'auto' }}>
          Kanban
        </Button>
      </CardActions>
    </Card>
  );
}

function ScopesContent() {
  const { projects } = useProjects();
  const { scopes, loading, createScope, updateScope, deleteScope } = useScopes();
  const [formOpen, setFormOpen] = useState(false);
  const [editScope, setEditScope] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleEdit = (scope) => {
    setEditScope(scope);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editScope) {
      await updateScope(editScope.id, data);
    } else {
      await createScope(data);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditScope(null);
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={40} width={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={250} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Escopos de Teste</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
          Novo Escopo
        </Button>
      </Box>

      {scopes.length === 0 ? (
        <EmptyState
          icon={PlaylistAddCheckRoundedIcon}
          title="Nenhum escopo de teste"
          description="Crie um escopo para começar a organizar seus testes e checklists"
          actionLabel="Criar Escopo"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <Grid container spacing={2.5}>
          {scopes.map((scope) => (
            <Grid key={scope.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ScopeCard scope={scope} onEdit={handleEdit} onDelete={setDeleteTarget} />
            </Grid>
          ))}
        </Grid>
      )}

      <ScopeFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        scope={editScope}
        projects={projects}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteScope(deleteTarget.id)}
        title="Excluir Escopo"
        message={`Excluir o escopo "${deleteTarget?.title}"? Todas as tarefas e comandos associados serão removidos.`}
        confirmText="Excluir"
      />
    </Box>
  );
}

export default function ScopesPage() {
  return (
    <Suspense fallback={<Box><Skeleton variant="rounded" height={40} width={200} sx={{ mb: 3, borderRadius: 2 }} /></Box>}>
      <ScopesContent />
    </Suspense>
  );
}
