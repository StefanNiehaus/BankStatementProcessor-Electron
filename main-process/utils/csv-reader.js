const fs = require('fs');
const csv = require('jquery-csv');

function readCSV(path, dao) {
    fs.readFile(path, 'UTF-8', (err, fileContent) => {
        csv.toArrays(fileContent, {}, (err, data) => {
            dao.save(data);
        });
    });
}

module.exports = {
    readCSV
};
