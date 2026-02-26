'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import useProjects from '@/hooks/useProjects';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Link from 'next/link';

function ProjectFormDialog({ open, onClose, onSubmit, project = null }) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, description });
      setName('');
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
        <DialogTitle>
          {project ? 'Editar Projeto' : 'Novo Projeto'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            fullWidth
            label="Nome do Projeto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !name.trim()}>
            {loading ? 'Salvando...' : project ? 'Salvar' : 'Criar Projeto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (t) => alpha(t.palette.primary.main, 0.12),
              }}
            >
              <FolderRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" noWrap>
                {project.name}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {new Date(project.created_at).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => onEdit(project)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton size="small" onClick={() => onDelete(project)}>
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {project.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 0.5 }}>
            {project.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PlaylistAddCheckRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              {project.scope_count || 0} escopos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AssignmentRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              {project.task_count || 0} tarefas
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          component={Link}
          href={`/scopes?project_id=${project.id}`}
          size="small"
          variant="outlined"
          fullWidth
        >
          Ver Escopos
        </Button>
      </CardActions>
    </Card>
  );
}

export default function ProjectsPage() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleEdit = (project) => {
    setEditProject(project);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    if (editProject) {
      await updateProject(editProject.id, data);
    } else {
      await createProject(data);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditProject(null);
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={40} width={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Meus Projetos</Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setFormOpen(true)}
        >
          Novo Projeto
        </Button>
      </Box>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderRoundedIcon}
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para começar a organizar seus escopos de teste"
          actionLabel="Criar Projeto"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <Grid container spacing={2.5}>
          {projects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProjectCard
                project={project}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ProjectFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        project={editProject}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteProject(deleteTarget.id)}
        title="Excluir Projeto"
        message={`Tem certeza que deseja excluir o projeto "${deleteTarget?.name}"? Todos os escopos e tarefas associados serão removidos.`}
        confirmText="Excluir"
      />
    </Box>
  );
}
