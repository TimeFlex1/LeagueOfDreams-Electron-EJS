var fs = require("fs");
var child_process = require("child_process");
let game;
var fp = require("find-free-port");
var ports = [];
var toBeInserted = {
"runes": {
    "1": 5245,
    "2": 5245,
    "3": 5245,
    "4": 5245,
    "5": 5245,
    "6": 5245,
    "7": 5245,
    "8": 5245,
    "9": 5245,
    "10": 5317,
    "11": 5317,
    "12": 5317,
    "13": 5317,
    "14": 5317,
    "15": 5317,
    "16": 5317,
    "17": 5317,
    "18": 5317,
    "19": 5289,
    "20": 5289,
    "21": 5289,
    "22": 5289,
    "23": 5289,
    "24": 5289,
    "25": 5289,
    "26": 5289,
    "27": 5289,
    "28": 5335,
    "29": 5335,
    "30": 5335},
"talents": {
    "4111": 1,
    "4112": 3,
    "4114": 1,
    "4122": 3,
    "4124": 1,
    "4132": 1,
    "4134": 3,
    "4142": 3,
    "4151": 1,
    "4152": 3,
    "4162": 1,
    "4211": 2,
    "4213": 2,
    "4221": 1,
    "4222": 3,
    "4232": 1} 
};


exports.startGameServer = function(players, settings, socket, sockets) {
    var gameServerPort;  

    //Auto complete ports array if port is free, instead of stacking ports to infinite
    fp(3111, 7000, function(err, freePort){
        gameServerPort = freePort;
        ports.push(freePort);
    });
    console.dir(ports);
    
    if (players != null){
        var config = {
			"path": "/Servere/LoD/GameServer/GameServerConsole/bin/Debug/netcoreapp3.0/GameServerConsole",
			"pathToFolder": "/Servere/LoD/GameServer/GameServerConsole/bin/Debug/netcoreapp3.0/"
		};
        var objToJSON = new Object();
        objToJSON.players = new Array();
        objToJSON.game = new Object();
        objToJSON.gameInfo = new Object();
        //Players setup
        var count = 0;
        var max = players.length - 1;
        while (count <= max){
            objToJSON.players[count] = new Object();
            objToJSON["players"][count].blowfishKey = "17BLOhi6KZsTtldTsizvHg==";
            objToJSON["players"][count].rank = "";
            objToJSON["players"][count].playerId = count+1;
            objToJSON["players"][count].name = players[count].displayname;
            objToJSON["players"][count].champion = players[count].champ;
            objToJSON["players"][count].team = players[count].team;
            objToJSON["players"][count].skin = 0;
            objToJSON["players"][count].summoner1 = "SummonerHeal";
            objToJSON["players"][count].summoner2 = "SummonerFlash";
            objToJSON["players"][count].ribbon = 2;
            objToJSON["players"][count].icon = 0;
            objToJSON["players"][count]["runes"] = toBeInserted['runes'];
            objToJSON["players"][count]["talents"] = toBeInserted['talents'];
            count++;
        }
        //Game setup
        objToJSON["game"]["map"] = settings.map;
        objToJSON["game"]["gameMode"] = "CLASSIC";
        objToJSON["game"]["dataPackage"] = "LeagueSandbox-Scripts";
        //GameInfo Setup
        objToJSON["gameInfo"]["MANACOSTS_ENABLED"] = settings.mana;
        objToJSON["gameInfo"]["COOLDOWNS_ENABLED"] = settings.cooldown;
        objToJSON["gameInfo"]["CHEATS_ENABLED"] = settings.cheats;
        objToJSON["gameInfo"]["MINION_SPAWNS_ENABLED"] = settings.minions;
        objToJSON["gameInfo"]["CONTENT_PATH"] = "/Servere/LoD/GameServer/Content";
        objToJSON["gameInfo"]["IS_DAMAGE_TEXT_GLOBAL"] = false;

        var args = []; 
        args[0] = "--config"
        args[1] =  "/Servere/LoD/gameServerconfig/GameInfo" + gameServerPort + ".json"
        args[2] = "--port"; 
        args[3] = gameServerPort.toString();
        var readyToJSON = JSON.stringify(objToJSON);
        fs.writeFile("/Servere/LoD/gameServerconfig/GameInfo" + gameServerPort + ".json", readyToJSON, (err) => {
            if (err) {
                //Abort
                console.log("Cant write config file for game server. Aborting game");
                socket.emit('abortGame', "We couldn't write a new game data. aborting..");
                var indexPort = ports.indexOf(gameServerPort);
            } else {
                try{
                    game = child_process.execFile(config['path'], args, {cwd: config.pathToFolder, maxBuffer: 1024 * 90000}, (error) => {
                        if (error){
                            //Abort
                            console.log("Cant run file, gameServer.exe Aborting sesion for user..");
                            console.log(error);
                            socket.emit('abortGame', "Your game didn't started. No errors.");
                            var indexPort = ports.indexOf(gameServerPort);
                        } else {
                            for(var i = 0; i < sockets.length; i++){
                                if(sockets[i].lobbyName == socket.lobbyName){
                                    for(var a = 0; a < players.length; a++){
                                        if(players[a].username == sockets[i].id){
                                            var id = a+1; 
                                            var token = "17BLOhi6KZsTtldTsizvHg==";
                                            sockets[i].emit("loadGame", token, id, gameServerPort);
                                            console.log("loadGame with port" + gameServerPort);
                                        }
                                    }
                                }
                            }
                        }
                    });
                    game.on('error', function(err) {
                        console.log("Game on error");
                        socket.emit('abortGame', "It seems the match you where playing ended in error");
                    });
                    game.on('close', function(err) {
                        console.log('Game on close');
                    });
                    game.on('exit', function(err) {
                        console.log('Game on exit');
                    });
                    game.on('quit', function(err) {
                        console.log('Game on quit');
                    });
                } catch(e){
                    console.log("While creating a game something wrong happend. Aborting game");
                    socket.emit('abortGame', "While creating a game something wrong happend. Try a new lobby");
                }
            }
        });
    } else {
        var indexPort = ports.indexOf(gameServerPort);
        //Releasing port
        ports.splice(indexPort, 1);
    }
}
