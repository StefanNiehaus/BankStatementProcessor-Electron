const { app, BrowserWindow } = require('electron');
const path = require('path');
const glob = require('glob');

app.allowRendererProcessReuse = true;

class Application {

  start() {
    this.mainWindow = null;
    this.loadScripts();
    this.createShortcuts();
    this.makeSingleInstance();
    this.handleState();
  }

  createShortcuts() {
    // Handle creating / removing shortcuts on Windows when installing / uninstalling
    if (require('electron-squirrel-startup')) {
      app.quit();
    }
  }

  makeSingleInstance () {
    if (process.mas) return;

    app.requestSingleInstanceLock();

    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus()
      }
    })
  }

  handleState() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', this.createWindow);

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
        this.createWindow();
      }
    });
  }

  createWindow () {
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

    this.mainWindow = new BrowserWindow(windowOptions);
    this.mainWindow.loadURL(path.join('file://', __dirname, '/index.html')).then();

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  // Require each JS file in the main-process dir
  loadScripts () {
    const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
    files.forEach((file) => { require(file) })
  }
}

let application = new Application();
application.start();
