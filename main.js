const { app, BrowserWindow, Main } = require('electron');
const electron = require('electron');
const path = require('path');
var fs = require('fs');
var http = require('http');
const {ipcMain} = require('electron');
const process = require('process');
const { kill } = require('process');
const child_process = require('child_process');
const { Socket } = require('socket.io-client');
let LoadingWindow;
let mainWindow;
let setupWindow;
let child;
let pathtoGame;
let server;
let ipOnly;
let abortGame = false;

async function createMainWindow () {
  mainWindow = new BrowserWindow({
    icon: __dirname + '/app/files/img/icon.png',
    Height: 640,
    title: "League of Dreams",
    show: false,
    Width: 1080,
    center: true,
    webPreferences: {
        devTools: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        nodeIntegrationInSubFrames: true,
        sandbox: false,
        enableRemoteModule: false,
        javascript: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        images: true,
        plugins: true,
        experimentalFeatures: false,
        offscreen: false,
        spellcheck: false,
        preload: path.join(__dirname, '/app/surface/app-controller.js')
      },
      resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
    fullscreenable: true,
	frame: false,
    minHeight: 640,
    minWidth: 1080
  });
    mainWindow.loadURL(server);
    mainWindow.webContents.openDevTools();
    mainWindow.removeMenu();
    mainWindow.setSize(1280, 720);
    mainWindow.center();
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        LoadingWindow.close();
    });
    mainWindow.webContents.on('did-finish-load', async function () {

    });
    mainWindow.on('unresponsive', function(){
        var options = {
            title: 'Server issue',
            message: "It seems that server is unresponsive",
            buttons: ["Change Server", "Refresh", "Quit"],
            type: 'warning',
            serverId: 0,
            waitId: 1,
            quitId: 2
        };
        electron.dialog.showMessageBox(mainWindow,options).then(result => {
                if (result.response === 0) {
                    createSetupWindow();
                }
                if (result.response === 1) {
                    mainWindow.webContents.loadURL(server);
                }
                if (result.response === 2) {
                    mainWindow.close();
                    app.exit(0);
                }
        });
    });
    mainWindow.on('responsive', function(){
        //Code
    });
    mainWindow.on('blur', function(){
        //Optimization on
    });
    mainWindow.on('focus', function(){
        //Optimization off
    });
    mainWindow.webContents.on('did-fail-load', function(){
        var options = {
            title: 'Server issue',
            message: "It seems that server did fail to load",
            buttons: ["Change Server", "Refresh", "Quit"],
            type: 'warning',
            serverId: 0,
            waitId: 1,
            quitId: 2
        };
        electron.dialog.showMessageBox(mainWindow,options).then(result => {
                if (result.response === 0) {
                    createSetupWindow();
                }
                if (result.response === 1) {
                    mainWindow.webContents.loadURL(server);
                }
                if (result.response === 2) {
                    mainWindow.close();
                    app.exit(0);
                }
        });
    });
    mainWindow.webContents.on('will-redirect', function (event, url) {
        //Security issues
    });
    mainWindow.on('close', function () {
        CloseClient();
    });
}

ipcMain.on('refresh', () => {mainWindow.loadURL(server)});

ipcMain.on('minimize', () => {mainWindow.minimize()});

ipcMain.on('unmaximize', () => {mainWindow.unmaximize();});

ipcMain.on('maximize', () => {mainWindow.maximize()});

ipcMain.on('close', () => {
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            http.get({'host': 'spoke-group.com', 'port': 3000, 'path': '/api/servers/delete?IP=' + ip}, function(resp) {
                resp.on('data', function(dat) {
                console.log("Deleted Server");
                CloseClient();
                });
            });
        });
    });
    
});

ipcMain.on('startGame', (event, data) => {
    console.log("IPC loading..");
    var startCommand = 'start "" "League of Legends.exe" "" "" "" "' + ipOnly + ' ' + data['port'] + " " + data['token'] + " " + data['id'];
    console.log(startCommand);
    var gameitSelf = child_process.exec(startCommand, {detached: true, cwd: pathtoGame, maxBuffer: 1024 * 90000 }, (error) => {
        if (error){console.log("Game on error");}
            console.log("Started game");
            child = gameitSelf.pid;
            if(abortGame == true){
                gameitSelf.kill('SIGKILL');
            }
    });
    gameitSelf.on('error', function(err) {
        console.log("Game on error");
    });
    gameitSelf.on('close', function(err) {
        console.log('Game on close');
    });
    gameitSelf.on('exit', function(err) {
        console.log('Game on exit');
    });
    gameitSelf.on('quit', function(err) {
        console.log('Game on quit');
    });
    child = gameitSelf;
});

ipcMain.on('abortGame', (event) => {
    console.log("IPC shutting down client..");
    try {
        child.kill('SIGKILL');
    } catch(e){}
    abortGame = true;
});

ipcMain.on('openSettings', (event) => {
    console.log("IPC opening settings..");
    createSetupWindow();
});

ipcMain.on('setPath', (event, data, restart) => {
    try {
        if (fs.existsSync(data + "\\League of Legends.exe")) {
            fs.writeFile(__dirname + '\\config\\path.igor', data, function (err) {
                if (err) throw err;
                if(restart){
                    app.relaunch();
                    app.exit();
                }
            });
        } else {
            var options = {
                title: 'Cant find GAME.EXE',
                message: "Can't find League of Legends.exe version 4.20",
                buttons: ["Ok"],
                type: 'error'
            };
            electron.dialog.showMessageBox(setupWindow,options).then(result => {});
        }
    } catch(e){
        var options = {
            title: 'Your path is wrong',
            message: "Fatal error while checking your path",
            buttons: ["Ok"],
            type: 'error'
        };
        electron.dialog.showMessageBox(setupWindow,options).then(result => {});
    }
});

ipcMain.on('setServer', (event, data, restart) => {
    try {
        fs.writeFile(__dirname + '\\config\\server.igor', data, function (err) {
            if (err) throw err;
            if(restart){
                app.relaunch();
                app.exit();
            }
        });
    } catch(e){
        var options = {
            title: 'Error',
            message: "Can't write file, maybe permissions?",
            buttons: ["Ok"],
            type: 'error'
        };
        electron.dialog.showMessageBox(setupWindow,options).then(result => {});
    }
});

function createSetupWindow() {
    setupWindow = new BrowserWindow({
        icon: __dirname + '/app/files/img/icon.png',
        title: "League of Dreams",
        center: true,
        skipTaskbar: false,
        webPreferences: {
            devTools: false,
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            sandbox: false,
            enableRemoteModule: true,
            javascript: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            images: true,
            plugins: true,
            experimentalFeatures: false,
            offscreen: false,
            spellcheck: false,
            preload: path.join(__dirname, '/app/surface/setup.js')
        },
        resizable: true,
        maximizable: false,
        minimizable: true,
        closable: true,
        fullscreenable: false,
        frame: true,
    });
    setupWindow.loadFile(__dirname + '/app/files/pages/setup.html');
    setupWindow.webContents.openDevTools();
    setupWindow.removeMenu();
    setupWindow.setSize(1024, 1000, true);
    setupWindow.center();
}

function createLoadingWindow() {
    LoadingWindow = new BrowserWindow({
        icon: __dirname + '/app/files/img/icon.png',
        title: "League of Dreams",
        center: true,
        skipTaskbar: true,
        webPreferences: {
            devTools: false,
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            sandbox: false,
            enableRemoteModule: true,
            javascript: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            images: true,
            plugins: true,
            experimentalFeatures: false,
            offscreen: false,
            spellcheck: false
        },
        resizable: false,
        maximizable: false,
        minimizable: false,
        closable: true,
        fullscreenable: false,
        frame: false,
    });
    LoadingWindow.loadFile(__dirname + '/app/files/pages/loading.html');
    LoadingWindow.webContents.openDevTools();
    LoadingWindow.removeMenu();
    LoadingWindow.setSize(320, 540);
    LoadingWindow.center();
    LoadingWindow.once('ready-to-show', () => {
        LoadingWindow.show();
    });
    setTimeout(createMainWindow, 2000);
}

app.whenReady().then(() => {
    if (fs.existsSync(__dirname + '\\config\\path.igor')) {
        if (fs.existsSync(__dirname + '\\config\\server.igor')) {
            fs.readFile(__dirname + '\\config\\path.igor', 'utf8', function(err, path){
                if(err) throw(err);
                fs.readFile(__dirname + '\\config\\server.igor', 'utf8', function(err, serverLoaded){
                    if(err) throw(err);
                    pathtoGame = path;
                    server = "http://" + serverLoaded + ":3000"
                    ipOnly = serverLoaded;
                    createLoadingWindow();
                    app.on('activate', function () {
                        if (BrowserWindow.getAllWindows().length === 0) createLoadingWindow();
                    });
                });
            });
        } else {
            createSetupWindow();
            app.on('activate', function () {
                if (BrowserWindow.getAllWindows().length === 0) createSetupWindow();
            });
        }
    } else {
        createSetupWindow();
        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createSetupWindow();
        });
    }
})

function CloseClient(){
    app.exit(0);
}

app.on('window-all-closed', function () {
    app.exit(0);
})

