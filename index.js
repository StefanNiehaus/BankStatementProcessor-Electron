const { app, BrowserWindow } = require('electron');
const path = require('path');
const glob = require('glob');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow = null;

function initialize () {
  makeSingleInstance();
  loadDemos();
  handleState();
}

function makeSingleInstance () {
  if (process.mas) return;

  app.requestSingleInstanceLock();

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus()
    }
  })
}

function handleState() {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

function createWindow () {
  const windowOptions = {
    width: 1080,
    minWidth: 680,
    height: 840,
    title: app.name,
    webPreferences: {
      nodeIntegration: true
    }
  };

  if (process.platform === 'linux') {
    windowOptions.icon = path.join(__dirname, './assets/app-icon/png/512.png')
  }

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

  // Launch fullscreen with DevTools open, usage: npm run debug
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Require each JS file in the main-process dir
function loadDemos () {
  // const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
  // files.forEach((file) => { require(file) })
}

initialize();
