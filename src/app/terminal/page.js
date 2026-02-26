'use client';

import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import useCommands from '@/hooks/useCommands';
import useScopes from '@/hooks/useScopes';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';

function CommandFormDialog({ open, onClose, onSubmit, scopes }) {
  const [label, setLabel] = useState('');
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');
  const [scopeId, setScopeId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ scope_id: scopeId ? Number(scopeId) : null, label, command, description });
      setLabel('');
      setCommand('');
      setDescription('');
      setScopeId('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Novo Comando</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField select fullWidth label="Escopo (opcional)" value={scopeId} onChange={(e) => setScopeId(e.target.value)} sx={{ mb: 2 }}>
            <MenuItem value="">Nenhum</MenuItem>
            {scopes.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Nome do Comando" value={label} onChange={(e) => setLabel(e.target.value)} required autoFocus sx={{ mb: 2 }} />
          <TextField fullWidth label="Comando" value={command} onChange={(e) => setCommand(e.target.value)} required multiline rows={3} sx={{ mb: 2 }} placeholder="docker exec ..." />
          <TextField fullWidth label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || !label.trim() || !command.trim()}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function TerminalPage() {
  const { scopes } = useScopes();
  const { commands, loading, createCommand, executeCommand, executing, lastOutput, deleteCommand, setLastOutput } = useCommands();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [customCommand, setCustomCommand] = useState('');
  const [outputs, setOutputs] = useState([]);
  const outputRef = useRef(null);

  const handleExecute = async (cmd) => {
    const result = await executeCommand(cmd.command, cmd.id);
    setOutputs((prev) => [...prev, { label: cmd.label, command: cmd.command, ...result, timestamp: new Date().toLocaleTimeString('pt-BR') }]);
    setTimeout(() => outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleCustomExecute = async () => {
    if (!customCommand.trim()) return;
    const result = await executeCommand(customCommand);
    setOutputs((prev) => [...prev, { label: 'Comando personalizado', command: customCommand, ...result, timestamp: new Date().toLocaleTimeString('pt-BR') }]);
    setCustomCommand('');
    setTimeout(() => outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleCopy = (text) => navigator.clipboard.writeText(text);

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Skeleton variant="rounded" height={500} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Skeleton variant="rounded" height={500} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Terminal de Comandos</Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
          Salvar Comando
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalRoundedIcon sx={{ fontSize: 20 }} /> Comandos Salvos
          </Typography>

          {commands.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={TerminalRoundedIcon}
                  title="Sem comandos salvos"
                  description="Salve seus comandos frequentes para execução rápida"
                  actionLabel="Salvar Comando"
                  onAction={() => setFormOpen(true)}
                />
              </CardContent>
            </Card>
          ) : (
            <List sx={{ py: 0 }}>
              {commands.map((cmd, idx) => (
                <Card key={cmd.id} sx={{ mb: 1.5 }}>
                  <CardContent sx={{ p: '12px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{cmd.label}</Typography>
                        {cmd.scope_title && (
                          <Chip label={cmd.scope_title} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20, mt: 0.5 }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        <Tooltip title="Copiar">
                          <IconButton size="small" onClick={() => handleCopy(cmd.command)}>
                            <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Executar">
                          <IconButton size="small" color="success" onClick={() => handleExecute(cmd)} disabled={!!executing}>
                            <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => setDeleteTarget(cmd)}>
                            <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{
                      mt: 1,
                      p: 1,
                      borderRadius: 1,
                      background: '#0D1117',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: '#8B949E',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      maxHeight: 80,
                      overflow: 'hidden',
                    }}>
                      {cmd.command}
                    </Box>
                    {executing === cmd.id && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryRoundedIcon sx={{ fontSize: 20 }} /> Terminal Output
          </Typography>

          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Digite um comando para executar..."
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomExecute()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleCustomExecute}
                  disabled={!!executing || !customCommand.trim()}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <SendRoundedIcon fontSize="small" />
                </Button>
              </Box>
              {executing === 'custom' && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
            </CardContent>
          </Card>

          <Card>
            <Box
              ref={outputRef}
              sx={{
                height: 'calc(100vh - 360px)',
                minHeight: 400,
                overflowY: 'auto',
                p: 2,
                background: '#0D1117',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { background: alpha('#94A3B8', 0.3), borderRadius: 2 },
              }}
            >
              {outputs.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.disabled">
                    Execute um comando para ver o output aqui...
                  </Typography>
                </Box>
              ) : (
                outputs.map((out, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#58A6FF', fontWeight: 600 }}>
                        [{out.timestamp}] {out.label}
                      </Typography>
                      <Chip
                        label={out.success ? 'OK' : 'ERRO'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          color: out.success ? '#3FB950' : '#FF7B72',
                          borderColor: out.success ? '#3FB950' : '#FF7B72',
                        }}
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ color: '#8B949E', fontSize: '0.7rem', mb: 0.5 }}>
                      $ {out.command}
                    </Box>
                    <Box sx={{
                      color: out.success ? '#C9D1D9' : '#FF7B72',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      pl: 1,
                      borderLeft: `2px solid ${out.success ? '#3FB950' : '#FF7B72'}`,
                    }}>
                      {out.output || out.stderr || out.error || '(sem output)'}
                    </Box>
                    {idx < outputs.length - 1 && (
                      <Divider sx={{ mt: 2, borderColor: alpha('#94A3B8', 0.1) }} />
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <CommandFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={createCommand}
        scopes={scopes}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteCommand(deleteTarget.id)}
        title="Excluir Comando"
        message={`Excluir o comando "${deleteTarget?.label}"?`}
        confirmText="Excluir"
      />
    </Box>
  );
}
