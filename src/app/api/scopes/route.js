import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const db = getDb();
    let scopes;

    if (projectId) {
      scopes = db.prepare(`
        SELECT s.*,
          p.name as project_name,
          (SELECT COUNT(*) FROM tasks WHERE scope_id = s.id) as task_count,
          (SELECT COUNT(*) FROM tasks WHERE scope_id = s.id AND status = 'done') as done_count,
          (SELECT COUNT(*) FROM commands WHERE scope_id = s.id) as command_count
        FROM scopes s
        JOIN projects p ON s.project_id = p.id
        WHERE s.project_id = ?
        ORDER BY s.updated_at DESC
      `).all(projectId);
    } else {
      scopes = db.prepare(`
        SELECT s.*,
          p.name as project_name,
          (SELECT COUNT(*) FROM tasks WHERE scope_id = s.id) as task_count,
          (SELECT COUNT(*) FROM tasks WHERE scope_id = s.id AND status = 'done') as done_count,
          (SELECT COUNT(*) FROM commands WHERE scope_id = s.id) as command_count
        FROM scopes s
        JOIN projects p ON s.project_id = p.id
        ORDER BY s.updated_at DESC
      `).all();
    }

    return NextResponse.json(scopes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { project_id, title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Título do escopo é obrigatório' },
        { status: 400 }
      );
    }

    if (!project_id) {
      return NextResponse.json(
        { error: 'Projeto é obrigatório' },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO scopes (project_id, title, description) VALUES (?, ?, ?)'
    ).run(project_id, title.trim(), description || '');

    const scope = db.prepare('SELECT * FROM scopes WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(scope, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
