import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import getDb from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { command, command_id } = body;

    if (!command?.trim()) {
      return NextResponse.json({ error: 'Comando é obrigatório' }, { status: 400 });
    }

    const output = await new Promise((resolve, reject) => {
      const proc = exec(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 5,
        shell: '/bin/bash',
      }, (error, stdout, stderr) => {
        resolve({
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: error ? error.code || 1 : 0,
        });
      });
    });

    const db = getDb();
    db.prepare(
      'INSERT INTO command_history (command_id, command_text, output, exit_code) VALUES (?, ?, ?, ?)'
    ).run(
      command_id || null,
      command.trim(),
      (output.stdout + (output.stderr ? '\n[STDERR]: ' + output.stderr : '')).trim(),
      output.exitCode
    );

    return NextResponse.json({
      output: output.stdout,
      stderr: output.stderr,
      exitCode: output.exitCode,
      success: output.exitCode === 0,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
