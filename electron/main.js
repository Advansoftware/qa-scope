const { app, BrowserWindow, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const net = require('net');

const isDev = process.env.ELECTRON_DEV === 'true';
const APP_NAME = 'QA Scope';

let splashWindow = null;
let mainWindow = null;
let serverProcess = null;
let serverPort = 3000;

// ─── Find free port ───
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

// ─── Wait for server ───
function waitForServer(port, maxAttempts = 120) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
        client.end();
        resolve();
      });
      client.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error(`Servidor não respondeu após ${maxAttempts} tentativas`));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

// ─── Find system node binary ───
function findNodeBinary() {
  // Try common locations
  const candidates = [
    '/usr/bin/node',
    '/usr/local/bin/node',
  ];

  // Try `which node`
  try {
    const nodePath = execSync('which node 2>/dev/null || where node 2>nul', { encoding: 'utf8' }).trim().split('\n')[0];
    if (nodePath && fs.existsSync(nodePath)) {
      candidates.unshift(nodePath);
    }
  } catch (e) { /* ignore */ }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Fallback: Electron as Node
  return null;
}

// ─── Icon path ───
function getIconPath() {
  if (isDev) {
    return path.join(__dirname, 'resources', 'icon.png');
  }
  return path.join(process.resourcesPath, 'icon.png');
}

// ─── Splash Screen ───
function createSplashScreen() {
  const iconPath = getIconPath();
  const icon = nativeImage.createFromPath(iconPath);

  // Read icon as base64 data URI for the HTML
  let iconDataUri = '';
  try {
    const iconBuffer = fs.readFileSync(iconPath);
    iconDataUri = `data:image/png;base64,${iconBuffer.toString('base64')}`;
  } catch (e) {
    iconDataUri = '';
  }

  splashWindow = new BrowserWindow({
    width: 400,
    height: 320,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashHTML = `<!DOCTYPE html>
<html>
<body style="
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(145deg, #0F1629 0%, #0A0E1A 100%);
  border-radius: 16px;
  border: 1px solid rgba(108, 99, 255, 0.3);
  font-family: -apple-system, 'Segoe UI', sans-serif;
  color: white;
  -webkit-app-region: drag;
  overflow: hidden;
">
  ${iconDataUri ? `<img src="${iconDataUri}" width="80" height="80" style="border-radius: 16px; margin-bottom: 16px;" />` : ''}
  <div style="font-size: 26px; font-weight: 800; margin-bottom: 6px;
    background: linear-gradient(90deg, #6C63FF, #00D9A6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;">
    QA Scope
  </div>
  <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 28px;">
    Ferramenta de QA para Escopos de Teste
  </div>
  <div style="
    width: 180px; height: 3px;
    background: rgba(255,255,255,0.08);
    border-radius: 3px;
    overflow: hidden;
  ">
    <div style="
      width: 40%; height: 100%;
      background: linear-gradient(90deg, #6C63FF, #00D9A6);
      border-radius: 3px;
      animation: loading 1.5s ease-in-out infinite;
    "></div>
  </div>
  <div style="font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 12px;">
    Iniciando servidor...
  </div>
  <style>
    @keyframes loading {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(350%); }
    }
  </style>
</body>
</html>`;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
  splashWindow.center();
  splashWindow.show();
}

// ─── Start Next.js Server ───
async function startServer() {
  if (isDev) {
    serverPort = 3000;
    return;
  }

  serverPort = await findFreePort();

  const standalonePath = path.join(process.resourcesPath, 'standalone');
  const serverScript = path.join(standalonePath, 'server.js');

  // Log file for debugging
  const logPath = path.join(app.getPath('userData'), 'server.log');

  // Use system node (better-sqlite3 compiled for it) or Electron as fallback
  const systemNode = findNodeBinary();
  let cmd, args, env;

  if (systemNode) {
    cmd = systemNode;
    args = [serverScript];
    env = {
      ...process.env,
      PORT: String(serverPort),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
    };
  } else {
    cmd = process.execPath;
    args = [serverScript];
    env = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(serverPort),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
    };
  }

  // Remove ELECTRON_ env vars that confuse Node.js when using system node
  if (systemNode) {
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.ELECTRON_NO_ASAR;
  }

  serverProcess = spawn(cmd, args, {
    env,
    cwd: standalonePath,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  // Write logs
  const logStream = fs.createWriteStream(logPath, { flags: 'w' });
  logStream.write(`[${new Date().toISOString()}] Starting server\n`);
  logStream.write(`Node: ${cmd}\nScript: ${serverScript}\nPort: ${serverPort}\n\n`);

  serverProcess.stdout.on('data', (data) => {
    try { logStream.write(`[stdout] ${data}`); } catch (e) { }
  });

  serverProcess.stderr.on('data', (data) => {
    try { logStream.write(`[stderr] ${data}`); } catch (e) { }
  });

  serverProcess.on('error', (err) => {
    try { logStream.write(`[error] ${err.message}\n`); } catch (e) { }
  });

  serverProcess.on('exit', (code) => {
    try { logStream.write(`[exit] code=${code}\n`); logStream.end(); } catch (e) { }
    serverProcess = null;
  });

  await waitForServer(serverPort);
}

// ─── Main Window ───
function createWindow() {
  const iconPath = getIconPath();
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    icon,
    title: APP_NAME,
    backgroundColor: '#0A0E1A',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  mainWindow.loadURL(`http://127.0.0.1:${serverPort}`);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  const menuTemplate = [
    {
      label: APP_NAME,
      submenu: [
        { label: `Sobre ${APP_NAME}`, role: 'about' },
        { type: 'separator' },
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Sair', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar Tudo' },
      ],
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { role: 'resetZoom', label: 'Zoom Padrão' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

// ─── Single Instance ───
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ─── App Lifecycle ───
app.on('ready', async () => {
  createSplashScreen();

  try {
    await startServer();
    createWindow();
  } catch (err) {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    const logPath = path.join(app.getPath('userData'), 'server.log');
    let logContent = '';
    try { logContent = fs.readFileSync(logPath, 'utf8').slice(-500); } catch (e) { }
    dialog.showErrorBox(
      'QA Scope - Erro',
      `Falha ao iniciar o servidor:\n${err.message}\n\nLog:\n${logContent}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
