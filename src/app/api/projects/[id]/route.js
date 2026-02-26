import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nome do projeto é obrigatório' },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare(
      'UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name.trim(), description || '', id);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
