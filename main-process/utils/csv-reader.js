const fs = require('fs');
const csv = require('jquery-csv');

function readCSV(path) {
    fs.readFile(path, 'UTF-8', (err, fileContent) => {
        csv.toArrays(fileContent, {}, (err, data) => {
            return data;
        });
    });
}

module.exports = {
    readCSV
};
