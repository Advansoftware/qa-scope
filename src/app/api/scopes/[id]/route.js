import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const scope = db.prepare(`
      SELECT s.*, p.name as project_name
      FROM scopes s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = ?
    `).get(id);

    if (!scope) {
      return NextResponse.json({ error: 'Escopo não encontrado' }, { status: 404 });
    }

    return NextResponse.json(scope);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, project_id } = body;

    const db = getDb();
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title.trim()); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (project_id !== undefined) { updates.push('project_id = ?'); values.push(project_id); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE scopes SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const scope = db.prepare('SELECT * FROM scopes WHERE id = ?').get(id);

    if (!scope) {
      return NextResponse.json({ error: 'Escopo não encontrado' }, { status: 404 });
    }

    return NextResponse.json(scope);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = db.prepare('DELETE FROM scopes WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Escopo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
