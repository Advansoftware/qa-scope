import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const projects = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM scopes WHERE project_id = p.id) as scope_count,
        (SELECT COUNT(*) FROM tasks t 
         JOIN scopes s ON t.scope_id = s.id 
         WHERE s.project_id = p.id) as task_count
      FROM projects p
      ORDER BY p.updated_at DESC
    `).all();

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nome do projeto é obrigatório' },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO projects (name, description) VALUES (?, ?)'
    ).run(name.trim(), description || '');

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
