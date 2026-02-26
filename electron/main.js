const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

const isDev = process.env.ELECTRON_DEV === 'true';
const APP_NAME = 'QA Scope';

let mainWindow = null;
let tray = null;
let serverProcess = null;
let serverPort = 3000;

// Find a free port
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

// Wait for the server to be ready
function waitForServer(port, maxAttempts = 30) {
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
          reject(new Error('Server failed to start'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

// Start Next.js standalone server
async function startServer() {
  if (isDev) {
    serverPort = 3000;
    console.log(`[Electron] Dev mode — using existing Next.js dev server at port ${serverPort}`);
    return;
  }

  serverPort = await findFreePort();
  console.log(`[Electron] Starting standalone server on port ${serverPort}...`);

  const standalonePath = path.join(process.resourcesPath || path.join(__dirname, '..'), '.next', 'standalone');
  const serverScript = path.join(standalonePath, 'server.js');

  serverProcess = spawn(process.execPath, [serverScript], {
    env: {
      ...process.env,
      PORT: String(serverPort),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
    },
    cwd: standalonePath,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Next.js Error] ${data.toString().trim()}`);
  });

  serverProcess.on('exit', (code) => {
    console.log(`[Next.js] Server exited with code ${code}`);
    serverProcess = null;
  });

  await waitForServer(serverPort);
  console.log(`[Electron] Server ready on port ${serverPort}`);
}

function getIconPath() {
  if (isDev) {
    return path.join(__dirname, 'resources', 'icon.png');
  }
  return path.join(process.resourcesPath, 'icon.png');
}

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
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Custom menu
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

// Single instance lock
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

app.on('ready', async () => {
  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error('[Electron] Failed to start:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    console.log('[Electron] Stopping Next.js server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
