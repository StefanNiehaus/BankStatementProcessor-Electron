const settings = require('electron-settings');
const Buttons = require('./btns');
const {ACTIVE_SECTION_ID} = require("../../constants/settings");

class Navigation {

  start() {
    let buttons = new Buttons();
    buttons.register();
    // Default to the view that was active the last time the app was open
    const sectionId = settings.get(ACTIVE_SECTION_ID);
    if (sectionId) {
      console.info(`Loading section: ${sectionId}`);
      this.showMainContent();
      this.resumeSection(sectionId);
    } else {
      console.info(`Loading default section`);
      this.activateDefaultSection();
      this.displayAbout();
    }
  }

  handleClick(event) {
    if (event.target.dataset.section) {
      this.handleSectionTrigger(event);
    } else if (event.target.dataset.modal) {
      this.handleModalTrigger(event);
    } else {
      this.hideAllModals();
      this.showMainContent();
    }
  }

  handleSectionTrigger (event) {
    console.info(`Opening section: ${event.target.dataset.section}`);
    this.hideAllSectionsAndDeselectButtons();

    // Highlight clicked button and show view
    event.target.classList.add('is-selected');

    // Display the current section
    const sectionId = `${event.target.dataset.section}-section`;
    document.getElementById(sectionId).classList.add('is-shown');

    // Save currently active section in localStorage
    settings.set(ACTIVE_SECTION_ID, sectionId);
    console.info(`Saved section: ${event.target.dataset.section}`);
  }

  handleModalTrigger (event) {
    console.log(`Opening modal: ${event.target.dataset.modal}`);
    this.hideAllModals();
    this.showMainContent();

    // Show modal
    const modalId = `${event.target.dataset.modal}-modal`;
    document.getElementById(modalId).classList.add('is-shown')
  }

  hideAllModals () {
    const modals = document.querySelectorAll('.modal.is-shown');
    Array.prototype.forEach.call(modals, (modal) => {
      modal.classList.remove('is-shown')
    });
  }

  hideAllSectionsAndDeselectButtons () {
    const sections = document.querySelectorAll('.js-section.is-shown');
    Array.prototype.forEach.call(sections, (section) => {
      section.classList.remove('is-shown');
    });

    const buttons = document.querySelectorAll('.nav-button.is-selected');
    Array.prototype.forEach.call(buttons, (button) => {
      button.classList.remove('is-selected');
    })
  }

  activateDefaultSection () {
    document.getElementById('button-loader').click()
  }

  displayAbout () {
    document.querySelector('#about-modal').classList.add('is-shown');
  }

  showMainContent () {
    document.querySelector('.js-nav').classList.add('is-shown');
    document.querySelector('.js-content').classList.add('is-shown')
  }

  resumeSection(sectionId) {

    const section = document.getElementById(sectionId).classList.add('is-shown');
    if (section) section.click()
  }
}

module.exports = Navigation;
