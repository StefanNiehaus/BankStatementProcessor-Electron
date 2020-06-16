const fs = require('fs');
const csv = require('jquery-csv');

function readCSV(path, callback) {
    fs.readFile(path, 'UTF-8', (err, fileContent) => {
        csv.toArrays(fileContent, {}, (err, data) => {
            callback(data);
        });
    });
}

module.exports = {
    readCSV
};
