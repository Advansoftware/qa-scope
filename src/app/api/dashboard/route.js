import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const scopeCount = db.prepare('SELECT COUNT(*) as count FROM scopes').get().count;
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    const todoCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'").get().count;
    const inProgressCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'").get().count;
    const testingCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'testing'").get().count;
    const doneCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'done'").get().count;
    const commandCount = db.prepare('SELECT COUNT(*) as count FROM commands').get().count;

    const recentScopes = db.prepare(`
      SELECT s.*, p.name as project_name,
        (SELECT COUNT(*) FROM tasks WHERE scope_id = s.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE scope_id = s.id AND status = 'done') as done_count
      FROM scopes s
      JOIN projects p ON s.project_id = p.id
      ORDER BY s.updated_at DESC
      LIMIT 5
    `).all();

    const recentHistory = db.prepare(`
      SELECT * FROM command_history
      ORDER BY executed_at DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      stats: {
        projects: projectCount,
        scopes: scopeCount,
        tasks: taskCount,
        todo: todoCount,
        in_progress: inProgressCount,
        testing: testingCount,
        done: doneCount,
        commands: commandCount,
      },
      recentScopes,
      recentHistory,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
