'use client';

import { useState, useCallback, useEffect } from 'react';

export default function useScopes(projectId = null) {
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScopes = useCallback(async (filterProjectId) => {
    try {
      setLoading(true);
      setError(null);
      const pid = filterProjectId || projectId;
      const url = pid ? `/api/scopes?project_id=${pid}` : '/api/scopes';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar escopos');
      const data = await res.json();
      setScopes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createScope = useCallback(async (scopeData) => {
    const res = await fetch('/api/scopes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scopeData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar escopo');
    }
    const scope = await res.json();
    setScopes((prev) => [scope, ...prev]);
    return scope;
  }, []);

  const updateScope = useCallback(async (id, scopeData) => {
    const res = await fetch(`/api/scopes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scopeData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar escopo');
    }
    const scope = await res.json();
    setScopes((prev) => prev.map((s) => (s.id === id ? scope : s)));
    return scope;
  }, []);

  const deleteScope = useCallback(async (id) => {
    const res = await fetch(`/api/scopes/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir escopo');
    }
    setScopes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    fetchScopes();
  }, [fetchScopes]);

  return {
    scopes,
    loading,
    error,
    fetchScopes,
    createScope,
    updateScope,
    deleteScope,
  };
}
