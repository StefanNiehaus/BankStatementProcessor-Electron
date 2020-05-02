const Navigation = require('./navigation');

let navigation = new Navigation();
navigation.start();

document.body.addEventListener('click', (event) => navigation.handleClick(event));
