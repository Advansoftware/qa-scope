import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, sort_order } = body;

    const db = getDb();
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title.trim()); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, sort_order } = body;

    const db = getDb();
    const updates = [];
    const values = [];

    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
