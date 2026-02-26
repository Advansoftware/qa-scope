import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scopeId = searchParams.get('scope_id');

    const db = getDb();
    let tasks;

    if (scopeId) {
      tasks = db.prepare(`
        SELECT t.*, s.title as scope_title
        FROM tasks t
        JOIN scopes s ON t.scope_id = s.id
        WHERE t.scope_id = ?
        ORDER BY t.sort_order ASC, t.created_at ASC
      `).all(scopeId);
    } else {
      tasks = db.prepare(`
        SELECT t.*, s.title as scope_title
        FROM tasks t
        JOIN scopes s ON t.scope_id = s.id
        ORDER BY t.sort_order ASC, t.created_at ASC
      `).all();
    }

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { scope_id, title, description, priority, status } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
    }

    if (!scope_id) {
      return NextResponse.json({ error: 'Escopo é obrigatório' }, { status: 400 });
    }

    const db = getDb();

    const maxOrder = db.prepare(
      'SELECT MAX(sort_order) as max_order FROM tasks WHERE scope_id = ?'
    ).get(scope_id);
    const nextOrder = (maxOrder?.max_order ?? -1) + 1;

    const result = db.prepare(
      'INSERT INTO tasks (scope_id, title, description, priority, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(scope_id, title.trim(), description || '', priority || 'medium', status || 'todo', nextOrder);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
