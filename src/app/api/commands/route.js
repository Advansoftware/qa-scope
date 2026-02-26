import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scopeId = searchParams.get('scope_id');

    const db = getDb();
    let commands;

    if (scopeId) {
      commands = db.prepare(`
        SELECT c.*, s.title as scope_title
        FROM commands c
        LEFT JOIN scopes s ON c.scope_id = s.id
        WHERE c.scope_id = ?
        ORDER BY c.created_at DESC
      `).all(scopeId);
    } else {
      commands = db.prepare(`
        SELECT c.*, s.title as scope_title
        FROM commands c
        LEFT JOIN scopes s ON c.scope_id = s.id
        ORDER BY c.created_at DESC
      `).all();
    }

    return NextResponse.json(commands);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { scope_id, label, command, description } = body;

    if (!label?.trim() || !command?.trim()) {
      return NextResponse.json(
        { error: 'Label e comando são obrigatórios' },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO commands (scope_id, label, command, description) VALUES (?, ?, ?, ?)'
    ).run(scope_id || null, label.trim(), command.trim(), description || '');

    const cmd = db.prepare('SELECT * FROM commands WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(cmd, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
