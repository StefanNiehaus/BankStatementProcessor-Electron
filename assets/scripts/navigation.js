const settings = require('electron-settings');

document.body.addEventListener('click', (event) => {
  if (event.target.dataset.section) {
    handleSectionTrigger(event);
  } else if (event.target.dataset.modal) {
    handleModalTrigger(event);
  } else {
    hideAllModals();
    showMainContent();
  }
});

function handleSectionTrigger (event) {
  console.log(`Opening section: ${event.target.dataset.section}`);
  hideAllSectionsAndDeselectButtons();

  // Highlight clicked button and show view
  event.target.classList.add('is-selected');

  // Display the current section
  const sectionId = `${event.target.dataset.section}-section`;
  document.getElementById(sectionId).classList.add('is-shown');

  // Save currently active button in localStorage
  const buttonId = event.target.getAttribute('id');
  settings.set('activeSectionButtonId', buttonId);
}

function handleModalTrigger (event) {
  console.log(`Opening modal: ${event.target.dataset.modal}`);
  hideAllModals();
  showMainContent();

  // Show modal
  const modalId = `${event.target.dataset.modal}-modal`;
  document.getElementById(modalId).classList.add('is-shown')
}

function hideAllModals () {
  const modals = document.querySelectorAll('.modal.is-shown');
  Array.prototype.forEach.call(modals, (modal) => {
    modal.classList.remove('is-shown')
  });
}

function hideAllSectionsAndDeselectButtons () {
  const sections = document.querySelectorAll('.js-section.is-shown');
  Array.prototype.forEach.call(sections, (section) => {
    section.classList.remove('is-shown');
  });

  const buttons = document.querySelectorAll('.nav-button.is-selected');
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('is-selected');
  })
}

function activateDefaultSection () {
  document.getElementById('button-loader').click()
}

function displayAbout () {
  document.querySelector('#about-modal').classList.add('is-shown');
}

function showMainContent () {
  document.querySelector('.js-nav').classList.add('is-shown');
  document.querySelector('.js-content').classList.add('is-shown')
}


// Default to the view that was active the last time the app was open
console.log("Loading navigation");
const sectionId = settings.get('activeSectionButtonId');
if (sectionId) {
  console.log(`Loading section: ${sectionId}`);
  showMainContent();
  const section = document.getElementById(sectionId);
  if (section) section.click()
} else {
  console.log(`Loading default section`);
  activateDefaultSection();
  displayAbout();
}
