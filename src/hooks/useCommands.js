'use client';

import { useState, useCallback, useEffect } from 'react';

export default function useCommands(scopeId = null) {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(null);
  const [lastOutput, setLastOutput] = useState(null);

  const fetchCommands = useCallback(async (filterScopeId) => {
    try {
      setLoading(true);
      setError(null);
      const sid = filterScopeId || scopeId;
      const url = sid ? `/api/commands?scope_id=${sid}` : '/api/commands';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar comandos');
      const data = await res.json();
      setCommands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [scopeId]);

  const createCommand = useCallback(async (commandData) => {
    const res = await fetch('/api/commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commandData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar comando');
    }
    const cmd = await res.json();
    setCommands((prev) => [cmd, ...prev]);
    return cmd;
  }, []);

  const updateCommand = useCallback(async (id, commandData) => {
    const res = await fetch(`/api/commands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commandData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar comando');
    }
    const cmd = await res.json();
    setCommands((prev) => prev.map((c) => (c.id === id ? cmd : c)));
    return cmd;
  }, []);

  const deleteCommand = useCallback(async (id) => {
    const res = await fetch(`/api/commands/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir comando');
    setCommands((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const executeCommand = useCallback(async (command, commandId = null) => {
    try {
      setExecuting(commandId || 'custom');
      setLastOutput(null);
      const res = await fetch('/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, command_id: commandId }),
      });
      const result = await res.json();
      setLastOutput(result);
      return result;
    } catch (err) {
      const errorResult = { error: err.message, success: false };
      setLastOutput(errorResult);
      return errorResult;
    } finally {
      setExecuting(null);
    }
  }, []);

  useEffect(() => {
    fetchCommands();
  }, [fetchCommands]);

  return {
    commands,
    loading,
    error,
    executing,
    lastOutput,
    fetchCommands,
    createCommand,
    updateCommand,
    deleteCommand,
    executeCommand,
    setLastOutput,
  };
}
