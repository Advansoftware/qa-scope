'use client';

import { useState, useCallback, useEffect } from 'react';

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Erro ao carregar projetos');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar projeto');
    }
    const project = await res.json();
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar projeto');
    }
    const project = await res.json();
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
    return project;
  }, []);

  const deleteProject = useCallback(async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir projeto');
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
