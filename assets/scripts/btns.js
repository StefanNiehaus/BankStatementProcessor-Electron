const settings = require('electron-settings');
const {ACTIVE_DEMO_BUTTON_ID} = require("../../constants/settings");

class Buttons {

  buttons = document.querySelectorAll('.js-container-target');

  register() {
    // Listen for demo button clicks
    Array.prototype.forEach.call(this.buttons, (btn) => {
      this.registerButton(btn);
    });
  }

  registerButton(btn) {
    console.info('Registering button:', btn);
    btn.addEventListener('click', (event) => {
      console.info('Click button:', event.target.getAttribute('id'));
      event.target.parentElement.classList.toggle('is-open');
      if (event.target.parentElement.classList.contains('is-open')) {
        settings.set(ACTIVE_DEMO_BUTTON_ID, event.target.getAttribute('id'));
      } else {
        settings.delete(ACTIVE_DEMO_BUTTON_ID);
      }
    })
  }

  defaultButton() {
    // Default to the demo that was active the last time the app was open
    const buttonId = settings.get(ACTIVE_DEMO_BUTTON_ID);
    if (buttonId) {
      document.getElementById(buttonId).click();
    }
  }
}

module.exports = Buttons;
