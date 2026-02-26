'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import useTasks from '@/hooks/useTasks';
import useScopes from '@/hooks/useScopes';
import { PriorityChip } from '@/components/common/StatusChip';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const COLUMN_CONFIG = {
  todo: { label: '📋 A Fazer', color: '#94A3B8', bgColor: 'rgba(148, 163, 184, 0.06)' },
  in_progress: { label: '🔄 Em Progresso', color: '#29B6F6', bgColor: 'rgba(41, 182, 246, 0.06)' },
  testing: { label: '🧪 Testando', color: '#FFB74D', bgColor: 'rgba(255, 183, 77, 0.06)' },
  done: { label: '✅ Concluído', color: '#66BB6A', bgColor: 'rgba(102, 187, 106, 0.06)' },
};

function TaskCard({ task, onStatusChange, onDelete }) {
  return (
    <Card
      sx={{
        mb: 1.5,
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <CardContent sx={{ p: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <DragIndicatorRoundedIcon sx={{ color: 'text.disabled', fontSize: 18, mt: 0.3 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {task.title}
            </Typography>
            {task.description && (
              <Typography variant="caption" color="text.disabled" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 1,
              }}>
                {task.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'space-between' }}>
              <PriorityChip priority={task.priority} />
              <Box>
                <Tooltip title="Excluir">
                  <IconButton size="small" onClick={() => onDelete(task)}>
                    <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ status, tasks, onStatusChange, onDelete, onAddTask }) {
  const config = COLUMN_CONFIG[status];

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 280,
        maxWidth: 350,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        pb: 1.5,
        borderBottom: `2px solid ${config.color}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>
            {config.label}
          </Typography>
          <Chip
            label={tasks.length}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 700,
              background: alpha(config.color, 0.15),
              color: config.color,
            }}
          />
        </Box>
        {status === 'todo' && (
          <Tooltip title="Nova tarefa">
            <IconButton size="small" onClick={onAddTask}>
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
          borderRadius: 2,
          background: config.bgColor,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { background: alpha(config.color, 0.3), borderRadius: 2 },
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData('text/plain');
          if (taskId) onStatusChange(Number(taskId), status);
        }}
      >
        {tasks.map((task) => (
          <Box
            key={task.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
          >
            <TaskCard task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TaskFormDialog({ open, onClose, onSubmit, scopes }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [scopeId, setScopeId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ scope_id: Number(scopeId), title, description, priority });
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
        <DialogTitle>Nova Tarefa</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField select fullWidth label="Escopo" value={scopeId} onChange={(e) => setScopeId(e.target.value)} required sx={{ mb: 2 }}>
            {scopes.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2} sx={{ mb: 2 }} />
          <TextField select fullWidth label="Prioridade" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <MenuItem value="low">Baixa</MenuItem>
            <MenuItem value="medium">Média</MenuItem>
            <MenuItem value="high">Alta</MenuItem>
            <MenuItem value="critical">Crítica</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || !title.trim() || !scopeId}>
            {loading ? 'Salvando...' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function KanbanContent() {
  const searchParams = useSearchParams();
  const scopeIdFilter = searchParams.get('scope_id');
  const { scopes } = useScopes();
  const { groupedByStatus, loading, createTask, updateTaskStatus, deleteTask, KANBAN_COLUMNS } = useTasks(scopeIdFilter);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 2.5, overflow: 'auto' }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ flex: 1, minWidth: 280 }}>
            <Skeleton variant="rounded" height={40} sx={{ mb: 2, borderRadius: 2 }} />
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5">Kanban Board</Typography>
          {scopeIdFilter && (
            <Typography variant="caption" color="text.secondary">
              Filtrando pelo escopo selecionado
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setTaskFormOpen(true)}>
          Nova Tarefa
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2.5, overflow: 'auto', pb: 2 }}>
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={groupedByStatus[status] || []}
            onStatusChange={handleStatusChange}
            onDelete={setDeleteTarget}
            onAddTask={() => setTaskFormOpen(true)}
          />
        ))}
      </Box>

      <TaskFormDialog
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        onSubmit={createTask}
        scopes={scopes}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTask(deleteTarget.id)}
        title="Excluir Tarefa"
        message={`Excluir a tarefa "${deleteTarget?.title}"?`}
        confirmText="Excluir"
      />
    </Box>
  );
}

export default function KanbanPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', gap: 2.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ flex: 1, minWidth: 280 }}>
            <Skeleton variant="rounded" height={40} sx={{ mb: 2, borderRadius: 2 }} />
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    }>
      <KanbanContent />
    </Suspense>
  );
}
