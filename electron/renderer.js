// https://kdydesign.github.io/2020/12/23/electron-ipc-communication/

const fs = require('fs')
const path = require('path')

let isServerRunToggleValue = true
var isLogviewToggleValue = true
var timerId = 0
var logFileSize = 0
let exists_config = fs.existsSync(path.join(__dirname, 'default_configs.json'))
let config
if (exists_config) {
    const rawdata = fs.readFileSync(path.join(__dirname, 'default_configs.json'), 'utf8')
    config = JSON.parse(rawdata)
} else {
    config = { 'PORT': 3000, 'PASSWORD': '1234', 'BASE_PATH': '/' }
    let data = JSON.stringify(config)
    fs.writeFileSync(path.join(__dirname, 'default_configs.json'), data)
}

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded')

    // Display
    displayConfig()
    updateServerStatusButton()
    toggleLogView()

    // Save Button Listener
    try {
        document.getElementById('saveButton').addEventListener('click', saveConfig)
        document.getElementById('serverStatusToggleButton').addEventListener('click', serverStatusToggle)
        document.getElementById('logButton').addEventListener('click', toggleLogView)
        document.getElementById('logCloseButton').addEventListener('click', toggleLogView)
    } catch (error) {
        console.error(error)
    }
})


// Display
function displayConfig() {
    try {
        document.getElementById('PORT').value = config.PORT
        document.getElementById('PASSWORD').value = config.PASSWORD
        document.getElementById('BASE_PATH').value = config.BASE_PATH
    } catch (error) {
        console.log(error)
    }
}

function updateServerStatusButton() {
    try {
        document.getElementById('serverStatusToggleButton').innerText = isServerRunToggleValue ? '서버 시작' : '서버 중지'
    } catch (error) {
        console.log(error)
    }
}

// Save Button Action
function saveConfig() {
    const PORT = document.getElementById('PORT').value
    const PASSWORD = document.getElementById('PASSWORD').value
    const BASE_PATH = document.getElementById('BASE_PATH').value

    // validation
    var numbers = /^[0-9]+$/
    if (!PORT.match(numbers)) {
        alert('PORT는 숫자만 허용됩니다.')
        return
    }

    if (PASSWORD.length == 0) {
        alert('비밀번호를 입력하세요.')
        return
    }

    if (BASE_PATH.length == 0) {
        alert('기본 경로를 입력하세요.')
        return
    }

    if (!isDirectory(BASE_PATH)) {
        alert('디렉토리 경로 또는 정확한 경로를 입력하세요.')
        return
    }

    config.BASE_PATH = BASE_PATH
    config.PORT = PORT
    config.PASSWORD = PASSWORD

    let saveData = JSON.stringify(config)
    fs.writeFileSync(path.join(__dirname, 'default_configs.json'), saveData)

    alert('저장되었습니다.\n변경된 사항은 적용하시려면 서버 중지 후 시작 버튼을 눌러주세요.')
}

function isDirectory(inputPath) {
    try {
        var stat = fs.lstatSync(inputPath)
        return stat.isDirectory()
    } catch (error) {
        console.log(error)
        return false
    }
}

function serverStatusToggle() {
    if (isServerRunToggleValue) {
        startServer()
    } else {
        stopServer()
    }
    isServerRunToggleValue = !isServerRunToggleValue
    updateServerStatusButton()
}

function startServer() {
    const { ipcRenderer } = require('electron')
    const payload = 'API_SERVER_START'
    ipcRenderer.send('CHANNEL_NAME', payload)
}

function stopServer() {
    const { ipcRenderer } = require('electron')
    const payload = 'API_SERVER_STOP'
    ipcRenderer.send('CHANNEL_NAME', payload)
}



function toggleLogView() {
    isLogviewToggleValue = !isLogviewToggleValue
    document.getElementById('main_view').style.display = isLogviewToggleValue ? 'none' : 'block'
    document.getElementById('log_view').style.display = isLogviewToggleValue ? 'block' : 'none'
    document.getElementById('logButton').style.display = isLogviewToggleValue ? 'none' : 'block'
    document.getElementById('logCloseButton').style.display = isLogviewToggleValue ? 'block' : 'none'

    if (!isLogviewToggleValue) {
        clearInterval(timerId)
        logFileSize = 0
        return
    }

    timerId = setInterval(drawLog, 1000)
}


function drawLog() {
    let exists = fs.existsSync(path.join(__dirname, "lightprovider.log"))
    if (!exists) {
        return
    }

    // logFileSize
    let newSize = fs.statSync(path.join(__dirname, 'lightprovider.log')).size
    if (newSize === logFileSize) {
        return;
    }

    logFileSize = newSize

    var log_list = document.getElementById('log_list')
    log_list.innerHTML = ''

    const lineReader = require('reverse-line-reader')
    lineReader.eachLine(path.join(__dirname, 'lightprovider.log'), function(line, last) {
        var li = document.createElement("li")
        li.appendChild(document.createTextNode(line))
        li.setAttribute('class', 'list-group-item')
        li.setAttribute('style', 'font-size: 0.7rem; text-align: left;')
        log_list.appendChild(li)
    })
}