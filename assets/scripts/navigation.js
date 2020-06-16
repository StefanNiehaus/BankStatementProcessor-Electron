const settings = require('electron-settings');
const Buttons = require('./btns');
const {ACTIVE_SECTION_ID} = require("../../constants/settings");

class Navigation {

  buttons = new Buttons();

  start() {
    this.buttons.register();
    this.buttons.defaultButton();

    // Default to the view that was active the last time the app was open
    const sectionId = settings.get(ACTIVE_SECTION_ID);
    if (sectionId) {
      console.info(`Loading section: ${sectionId}`);
      this.showMainContent();
      this.loadSection(sectionId);
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
    const sectionId = `${event.target.dataset.section}-section`;
    console.info(`Opening section: ${sectionId}`);

    this.loadSection(sectionId);

    // Highlight clicked button and show view
    event.target.classList.add('is-selected');
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

  hideAllSections() {
    const sections = document.querySelectorAll('.js-section.is-shown');
    Array.prototype.forEach.call(sections, (section) => {
      section.classList.remove('is-shown');
    });
  }

  deselectButtons() {
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

  loadSection(sectionId) {
    this.hideAllSections();
    this.deselectButtons();

    console.info('Loading section:', sectionId);
    document.getElementById(sectionId).classList.add('is-shown');

    // Save currently active section in localStorage
    settings.set(ACTIVE_SECTION_ID, sectionId);
    console.info('Saved section:', sectionId);
  }
}

module.exports = Navigation;
