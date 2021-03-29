const electron = require("electron"),
    app = electron.app,
    BrowserWindow = electron.BrowserWindow
const path = require("path")
const fs = require("fs")
const logger = require("./logger")

let mainWindow
let nodeProcess

function createWindow() {
    logger.log("Electron: Starting app")
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true
        },
    })
    mainWindow.loadFile(`dist/LightProvider/index.html`)
    mainWindow.webContents.openDevTools()

    mainWindow.on("close", () => {
        logger.log("Electron: close")
    })

    mainWindow.on("closed", () => {
        logger.log("Electron: closed")
        mainWindow = null
        nodeProcess.kill("SIGINT")
        app.quit()
    })
}

async function hello() {
    logger.log("hello")
}

async function startServer() {
    logger.log("Starting server")
    const { spawn } = require("child_process")
        // For electron-packager change cwd in spawn to app.getAppPath() and
        // uncomment the app require below
        //app = require('electron').remote.app,
    var env = process.env
    env.NODE_ENV = 'prod'
    env.PORT = 3000
    env.PASSWORD = '1234'
    env.BASE_PATH = '/'

    try {
        const rawdata = fs.readFileSync('./default_configs.json', 'utf8')
        let config = JSON.parse(rawdata);
        console.log(config)
        env.PORT = config.PORT
        env.PASSWORD = config.PASSWORD
        env.BASE_PATH = config.BASE_PATH

    } catch (error) {
        console.log(error)
        let rawdata = { "PORT": 3000, "PASSWORD": "1234", "BASE_PATH": "/" }
        let data = JSON.stringify(rawdata);
        fs.writeFileSync('./default_configs.json', data)
    }

    try {
        nodeProcess = spawn(
            path.join(__dirname, "node_modules/node/bin/node"), [path.join(__dirname, "../dist/main")], {
                stdio: ["pipe", "pipe", "pipe", "ipc"],
                cwd: process.cwd(),
            }, env
        )

        nodeProcess.stdout.on("data", function(data) {
            logger.log("Electron: Server:: " + data)
        })

        nodeProcess.on("message", (message) => {
            if (message.type === "SERVER_STARTED" && !mainWindow) {
                createWindow()
                    // process.env.BASE_URL = message.data.baseUrl
            }
        })
    } catch (ex) {
        logger.log(ex)
    }
}

app.on("ready", async function() {
    logger.log("Electron: ready")
    startServer()
})

app.on("browser-window-created", function(e, window) {
    logger.log("Electron: browser-window-created")
    window.setMenu(null)
})

app.on("window-all-closed", function() {
    logger.log("Electron: window-all-close")
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", function() {
    logger.log("Electron: activate")
})