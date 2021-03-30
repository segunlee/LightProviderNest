const electron = require('electron')
const app = electron.app
const ipcMain = electron.ipcMain
const BrowserWindow = electron.BrowserWindow
const fs = require('fs')
const path = require('path')
const logger = require('./logger')

let mainWindow
let nodeProcess

function createWindow() {
    logger.log('Electron: Starting app')
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 500,
        height: 500,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
        webPreferences: {
            enableRemoteModule: true,
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true
        },
    })
    mainWindow.loadFile(`dist/LightProvider/index.html`)
    mainWindow.webContents.openDevTools()

    mainWindow.on('close', () => {
        logger.log('Electron: close')
    })

    mainWindow.on('closed', () => {
        logger.log('Electron: closed')
        mainWindow = null
        if (nodeProcess != undefined) {
            nodeProcess.kill('SIGINT')
        }
        app.quit()
    })
}

async function startServer() {
    logger.log('Electron: Starting server')
    const { spawn } = require('child_process')

    var env = process.env
    env.NODE_ENV = 'prod'
    env.PORT = 3000
    env.PASSWORD = '1234'
    env.BASE_PATH = '/'

    try {
        const rawdata = fs.readFileSync(path.join(__dirname, 'default_configs.json'), 'utf8')
        let config = JSON.parse(rawdata)
        env.PORT = config.PORT
        env.PASSWORD = config.PASSWORD
        env.BASE_PATH = config.BASE_PATH

    } catch (error) {
        logger.log('Electron: ' + error)
        let rawdata = { 'PORT': 3000, 'PASSWORD': '1234', 'BASE_PATH': '/' }
        let data = JSON.stringify(rawdata)
        fs.writeFileSync(path.join(__dirname, 'default_configs.json'), data)
    }

    try {
        logger.log('Electron: Start with this.config => ' + env)
        nodeProcess = spawn(
            path.join(__dirname, 'node_modules/node/bin/node'), [path.join(__dirname, '../dist/main')], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                cwd: process.cwd(),
            }, env
        )

        nodeProcess.stdout.on('data', function(data) {
            logger.log('API Server: ' + data)
        })

        nodeProcess.on('message', (message) => {
            logger.log('API Server: ' + message)
        })
    } catch (error) {
        logger.log('Electron: ' + error)
    }
}

async function stopServer() {
    if (nodeProcess != undefined) {
        nodeProcess.kill('SIGINT')
    }
}

ipcMain.on('CHANNEL_NAME', (evt, payload) => {
    logger.log('Electron: Did revice payload => ' + payload)
    if (payload === 'API_SERVER_STOP') {
        stopServer()
    }

    if (payload === 'API_SERVER_START') {
        startServer()
    }
})

app.on('ready', async function() {
    logger.log('Electron: ready')
    createWindow()

    try {
        fs.unlinkSync(path.join(__dirname, "./lightprovider.log"))
    } catch (error) {

    }
})

app.on('browser-window-created', function(e, window) {
    logger.log('Electron: browser-window-created')
    window.setMenu(null)
})

app.on('window-all-closed', function() {
    logger.log('Electron: window-all-close')
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    logger.log('Electron: activate')
})