const fs = require("fs")
const path = require("path")

exports.log = async(message) => {
    console.log(message)

    let exists = fs.existsSync(path.join(__dirname, "./lightprovider.log"))
    if (!exists) {
        fs.writeFileSync(path.join(__dirname, "./lightprovider.log"), '')
    }

    let date = new Date().toISOString().replace('T', ' ').substring(0, 19)
    fs.appendFileSync(path.join(__dirname, "./lightprovider.log"), `${date} ${message}\n`)
}