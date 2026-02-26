'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

const KANBAN_COLUMNS = ['todo', 'in_progress', 'testing', 'done'];

export default function useTasks(scopeId = null) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (filterScopeId) => {
    try {
      setLoading(true);
      setError(null);
      const sid = filterScopeId || scopeId;
      const url = sid ? `/api/tasks?scope_id=${sid}` : '/api/tasks';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar tarefas');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [scopeId]);

  const createTask = useCallback(async (taskData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar tarefa');
    }
    const task = await res.json();
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar tarefa');
    }
    const task = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  }, []);

  const updateTaskStatus = useCallback(async (id, status, sortOrder) => {
    const body = { status };
    if (sortOrder !== undefined) body.sort_order = sortOrder;

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Erro ao atualizar status');
    const task = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir tarefa');
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const groupedByStatus = useMemo(() => {
    const grouped = {};
    KANBAN_COLUMNS.forEach((col) => {
      grouped[col] = tasks
        .filter((t) => t.status === col)
        .sort((a, b) => a.sort_order - b.sort_order);
    });
    return grouped;
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    groupedByStatus,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    KANBAN_COLUMNS,
  };
}
