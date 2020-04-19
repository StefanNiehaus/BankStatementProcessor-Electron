const settings = require('electron-settings');
const buttons = document.querySelectorAll('.js-container-target');

// Listen for demo button clicks
Array.prototype.forEach.call(buttons, (btn) => {
  registerButton(btn);
});

function registerButton(btn) {
  console.info('Registering button');
  btn.addEventListener('click', (event) => {
    console.info('Click button');
    event.target.parentElement.classList.toggle('is-open');
    if (event.target.parentElement.classList.contains('is-open')) {
      settings.set('activeDemoButtonId', event.target.getAttribute('id'));
    } else {
      settings.delete('activeDemoButtonId');
    }
  })
}

// Default to the demo that was active the last time the app was open
const buttonId = settings.get('activeDemoButtonId');
if (buttonId) {
  document.getElementById(buttonId).click();
}
