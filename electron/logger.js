const fs = require("fs");
const path = require("path");

exports.log = async(message) => {

    console.log(message);

    fs.appendFileSync(path.join(__dirname, "./log.txt"), `${new Date()}: ${message}`)

};