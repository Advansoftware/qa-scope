'use client';

import { useState, useEffect, use } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import useTasks from '@/hooks/useTasks';
import useCommands from '@/hooks/useCommands';
import { StatusChip, PriorityChip } from '@/components/common/StatusChip';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Link from 'next/link';

function TaskFormDialog({ open, onClose, onSubmit, scopeId, task = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  // Reset form when opening with different task
  useState(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
    }
  });

  // Sync state when task changes
  const prevTaskId = useState(null);
  if (open && task && task.id !== prevTaskId[0]) {
    prevTaskId[1](task.id);
    setTitle(task.title || '');
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
  } else if (open && !task && prevTaskId[0] !== null) {
    prevTaskId[1](null);
    setTitle('');
    setDescription('');
    setPriority('medium');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ scope_id: scopeId, title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('medium');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus sx={{ mb: 2 }} />
          <TextField fullWidth label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} sx={{ mb: 2 }} />
          <TextField select fullWidth label="Prioridade" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <MenuItem value="low">Baixa</MenuItem>
            <MenuItem value="medium">Média</MenuItem>
            <MenuItem value="high">Alta</MenuItem>
            <MenuItem value="critical">Crítica</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || !title.trim()}>
            {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Tarefa'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function CommandFormDialog({ open, onClose, onSubmit, scopeId, command: editCmd = null }) {
  const [label, setLabel] = useState('');
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!editCmd;

  // Sync state when command changes
  const prevCmdId = useState(null);
  if (open && editCmd && editCmd.id !== prevCmdId[0]) {
    prevCmdId[1](editCmd.id);
    setLabel(editCmd.label || '');
    setCommand(editCmd.command || '');
    setDescription(editCmd.description || '');
  } else if (open && !editCmd && prevCmdId[0] !== null) {
    prevCmdId[1](null);
    setLabel('');
    setCommand('');
    setDescription('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ scope_id: scopeId, label, command, description });
      setLabel('');
      setCommand('');
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Comando' : 'Novo Comando'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth label="Nome do Comando" value={label} onChange={(e) => setLabel(e.target.value)} required autoFocus sx={{ mb: 2 }} placeholder="Ex: Limpar missão 292" />
          <TextField fullWidth label="Comando" value={command} onChange={(e) => setCommand(e.target.value)} required multiline rows={3} sx={{ mb: 2 }} placeholder='Ex: docker exec mysql ...' />
          <TextField fullWidth label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || !label.trim() || !command.trim()}>
            {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Salvar Comando'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function CommandOutput({ output }) {
  if (!output) return null;
  return (
    <Box sx={{
      mt: 2, p: 2, borderRadius: 2, background: '#0D1117',
      border: '1px solid', borderColor: output.success ? 'success.dark' : 'error.dark',
      fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap',
      wordBreak: 'break-all', maxHeight: 300, overflow: 'auto',
      color: output.success ? '#58A6FF' : '#FF7B72',
    }}>
      {output.output || output.stderr || output.error || 'Sem output'}
      {output.exitCode !== undefined && (
        <Box sx={{ mt: 1, color: 'text.disabled', fontSize: '0.7rem' }}>Exit code: {output.exitCode}</Box>
      )}
    </Box>
  );
}

export default function ScopeDetailPage({ params }) {
  const { id } = use(params);
  const [scope, setScope] = useState(null);
  const [scopeLoading, setScopeLoading] = useState(true);
  const { tasks, loading: tasksLoading, createTask, updateTask, updateTaskStatus, deleteTask } = useTasks(id);
  const { commands, loading: cmdsLoading, createCommand, updateCommand, executeCommand, executing, lastOutput, deleteCommand } = useCommands(id);

  // Dialog states
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [cmdFormOpen, setCmdFormOpen] = useState(false);
  const [editingCmd, setEditingCmd] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetch(`/api/scopes/${id}`).then((r) => r.json()).then(setScope).finally(() => setScopeLoading(false));
  }, [id]);

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTaskStatus(task.id, newStatus);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleTaskSubmit = async (data) => {
    if (editingTask) {
      await updateTask(editingTask.id, { ...data, status: editingTask.status });
    } else {
      await createTask(data);
    }
  };

  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleEditCmd = (cmd) => {
    setEditingCmd(cmd);
    setCmdFormOpen(true);
  };

  const handleCmdSubmit = async (data) => {
    if (editingCmd) {
      await updateCommand(editingCmd.id, data);
    } else {
      await createCommand(data);
    }
  };

  const handleCloseCmdForm = () => {
    setCmdFormOpen(false);
    setEditingCmd(null);
  };

  const handleExecute = async (cmd) => {
    const result = await executeCommand(cmd.command, cmd.id);
    setSnackbar({
      open: true,
      message: result.success ? `✅ ${cmd.label} executado com sucesso!` : `❌ Erro ao executar ${cmd.label}`,
      severity: result.success ? 'success' : 'error',
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Comando copiado!', severity: 'info' });
  };

  const handleDelete = (item, type) => {
    setDeleteTarget(item);
    setDeleteType(type);
  };

  const confirmDelete = async () => {
    if (deleteType === 'task') await deleteTask(deleteTarget.id);
    else await deleteCommand(deleteTarget.id);
  };

  if (scopeLoading) {
    return <Box><Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mb: 3 }} /><Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} /></Box>;
  }

  if (!scope) {
    return <EmptyState title="Escopo não encontrado" />;
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{scope.title}</Typography>
              <Typography variant="body2" color="text.secondary">{scope.project_name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StatusChip status={scope.status} />
              <Button component={Link} href={`/kanban?scope_id=${id}`} variant="outlined" size="small" startIcon={<ViewKanbanRoundedIcon />}>
                Kanban
              </Button>
            </Box>
          </Box>
          {scope.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{scope.description}</Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: (t) => alpha(t.palette.primary.main, 0.08), '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #6C63FF 0%, #00D9A6 100%)' } }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{progress}%</Typography>
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>{doneCount}/{tasks.length} tarefas concluídas</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Tasks column */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">📋 Checklist de Tarefas</Typography>
            <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}>Nova Tarefa</Button>
          </Box>
          <Card>
            {tasks.length === 0 ? (
              <CardContent><EmptyState title="Sem tarefas" description="Adicione tarefas ao checklist deste escopo" /></CardContent>
            ) : (
              <List sx={{ py: 0 }}>
                {tasks.map((task, idx) => (
                  <Box key={task.id}>
                    {idx > 0 && <Divider />}
                    <ListItem disablePadding secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <PriorityChip priority={task.priority} />
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEditTask(task)}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => handleDelete(task, 'task')}>
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }>
                      <ListItemButton onClick={() => handleToggleTask(task)} dense>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {task.status === 'done' ? (
                            <CheckCircleRoundedIcon sx={{ color: 'success.main' }} />
                          ) : (
                            <RadioButtonUncheckedRoundedIcon sx={{ color: 'text.disabled' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={task.title}
                          secondary={task.description || null}
                          primaryTypographyProps={{
                            sx: task.status === 'done' ? { textDecoration: 'line-through', color: 'text.disabled' } : {},
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        {/* Commands column */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">⌨️ Comandos</Typography>
            <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={() => { setEditingCmd(null); setCmdFormOpen(true); }}>Novo Comando</Button>
          </Box>
          {commands.length === 0 ? (
            <Card><CardContent><EmptyState title="Sem comandos" description="Adicione comandos para execução rápida" /></CardContent></Card>
          ) : (
            commands.map((cmd) => (
              <Card key={cmd.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>{cmd.label}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Copiar comando">
                        <IconButton size="small" onClick={() => handleCopy(cmd.command)}>
                          <ContentCopyRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEditCmd(cmd)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Executar">
                        <IconButton size="small" color="success" onClick={() => handleExecute(cmd)} disabled={executing === cmd.id}>
                          <PlayArrowRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" onClick={() => handleDelete(cmd, 'command')}>
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{
                    p: 1.5, borderRadius: 1.5, background: '#0D1117',
                    fontFamily: 'monospace', fontSize: '0.75rem', color: '#8B949E',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>
                    {cmd.command}
                  </Box>
                  {cmd.description && (
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>{cmd.description}</Typography>
                  )}
                  {executing === cmd.id && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                  {lastOutput && !executing && <CommandOutput output={lastOutput} />}
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>

      <TaskFormDialog open={taskFormOpen} onClose={handleCloseTaskForm} onSubmit={handleTaskSubmit} scopeId={Number(id)} task={editingTask} />
      <CommandFormDialog open={cmdFormOpen} onClose={handleCloseCmdForm} onSubmit={handleCmdSubmit} scopeId={Number(id)} command={editingCmd} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteType(null); }}
        onConfirm={confirmDelete}
        title={deleteType === 'task' ? 'Excluir Tarefa' : 'Excluir Comando'}
        message={`Tem certeza que deseja excluir "${deleteTarget?.title || deleteTarget?.label}"?`}
        confirmText="Excluir"
      />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
