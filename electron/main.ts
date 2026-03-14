import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false, // For easier prototyping, though security-wise we should secure it later
    },
    titleBarStyle: 'hidden', // For a custom looking dashboard
    titleBarOverlay: {
      color: '#1e1e1e',
      symbolColor: '#ffffff',
    },
    backgroundColor: '#121212',
    icon: path.join(__dirname, '../public/vite.svg') // Placeholder icon
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    const loadURLWithRetry = async (url: string, retries = 5) => {
      try {
        await mainWindow?.loadURL(url);
        mainWindow?.webContents.openDevTools();
      } catch (err) {
        if (retries > 0) {
          console.log(`Failed to load URL, retrying in 1s... (${retries} retries left)`);
          setTimeout(() => loadURLWithRetry(url, retries - 1), 1000);
        } else {
          console.error('Failed to load URL after multiple attempts:', err);
        }
      }
    };
    loadURLWithRetry('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

// Handle simulation execution
ipcMain.on('run-simulation', (event) => {
  console.log('Running simulation...');
  const projectRoot = path.join(__dirname, '..');
  const pythonScript = path.join(projectRoot, 'simulation_module', 'simulation_module', 'simulation_core.py');

  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  const child = spawn(pythonCmd, [pythonScript], {
    cwd: path.dirname(pythonScript),
    env: { ...process.env, PYTHONPATH: path.dirname(pythonScript) }
  });

  child.stdout.on('data', (data) => console.log(`Simulation Output: ${data}`));
  child.stderr.on('data', (data) => console.error(`Simulation Error: ${data}`));
});

// Start Flask Backend automatically
const startBackend = () => {
  const projectRoot = path.join(__dirname, '..');
  const appScript = path.join(projectRoot, 'simulation_module', 'simulation_module', 'app.py');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  console.log('Starting Flask Backend...');
  const backend = spawn(pythonCmd, [appScript], {
    cwd: path.dirname(appScript),
    env: { ...process.env, PYTHONPATH: path.dirname(appScript) }
  });

  backend.stdout.on('data', (data) => console.log(`Flask Output: ${data}`));
  backend.stderr.on('data', (data) => console.error(`Flask Error: ${data}`));

  app.on('before-quit', () => backend.kill());
};

app.on('ready', () => {
  createWindow();
  startBackend();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
