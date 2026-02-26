import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const command = db.prepare('SELECT * FROM commands WHERE id = ?').get(id);

    if (!command) {
      return NextResponse.json({ error: 'Comando não encontrado' }, { status: 404 });
    }

    return NextResponse.json(command);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { label, command, description, scope_id } = body;

    const db = getDb();
    db.prepare(
      'UPDATE commands SET label = ?, command = ?, description = ?, scope_id = ? WHERE id = ?'
    ).run(
      label?.trim() || '',
      command?.trim() || '',
      description || '',
      scope_id || null,
      id
    );

    const cmd = db.prepare('SELECT * FROM commands WHERE id = ?').get(id);

    if (!cmd) {
      return NextResponse.json({ error: 'Comando não encontrado' }, { status: 404 });
    }

    return NextResponse.json(cmd);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const result = db.prepare('DELETE FROM commands WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Comando não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
