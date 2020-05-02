const {ipcRenderer} = require('electron');
const {OPEN_FILE_CHANNEL, SELECTED_FILE_CHANNEL, LOAD_FILE_CHANNEL} = require('../constants/channels');

class OpenFileRenderer {
  selectDirBtn = document.getElementById('select-file');
  confirmConfigBtn = document.getElementById('confirm-input-configuration');

  start() {
    this.listenForOpenFileClick();
    this.listenOnSelectedFileChannel();
    this.listenForConfigConfirmationClick();
  }

  listenForOpenFileClick() {
    this.selectDirBtn.addEventListener('click', () => {
      console.info(`Sending open file event from renderer process to main process`);
      ipcRenderer.send(OPEN_FILE_CHANNEL);
    });
  }

  listenOnSelectedFileChannel() {
    ipcRenderer.on(SELECTED_FILE_CHANNEL, (event, path) => {
      console.info(`Received path information: ${path}`);
      document.getElementById('selected-file').innerHTML = String(path);
    });
  }

  listenForConfigConfirmationClick() {
    this.confirmConfigBtn.addEventListener('click', () => {
      console.info(`Confirmed Config`);
      let selectedFile = document.getElementById('selected-file').innerHTML;
      ipcRenderer.send(LOAD_FILE_CHANNEL, selectedFile);
    });
  }
}

openFileRenderer = new OpenFileRenderer();
openFileRenderer.start();
