var socket = io();
var teamRed = [];
var teamBlue = [];
let currentLobby = "";
let currentId = "";
    function login(id){
        currentId = id;
        socket.emit('login', id); 
    }	 
var lobbyFocus = true;
var lobbies = {};

var Champs = [
    "Aatrox",
    "Ahri",
    "Akali",
    "Alistar",
    "Amumu",
    "Anivia",
    "Annie",
    "Ashe",
    "Azir",
    "Blitzcrank",
    "Brand",
    "Braum",
    "Caitlyn",
    "Cassiopeia",
    "Chogath",
    "Corki",
    "Darius",
    "Diana",
    "DrMundo",
    "Draven",
    "Elise",
    "Evelynn",
    "Ezreal",
    "FiddleSticks",
    "Fiora",
    "Fizz",
    "Galio",
    "Gangplank",
    "Garen",
    "Gnar",
    "Gragas",
    "Graves",
    "Hecarim",
    "Heimerdinger",
    "Irelia",
    "Janna",
    "JarvanIV",
    "Jax",
    "Jayce",
    "Jinx",
    "Karma",
    "Karthus",
    "Kassadin",
    "Katarina",
    "Kayle",
    "Kennen",
    "Khazix",
    "KogMaw",
	"Leblanc",
    "LeeSin",
    "Leona",
    "Lissandra",
    "Lucian",
    "Lulu",
    "Lux",
    "Malphite",
    "MasterYi",
    "MissFortune",
    "Mordekaiser",
    "Morgana",
    "Nami",
    "Nasus",
    "Nautilus",
    "Nidalee",
    "Nocturne",
    "Nunu",
    "Olaf",
    "Orianna",
    "Pantheon",
    "Poppy",
    "Quinn",
    "Rammus",
    "Renekton",
     "Rengar",
     "Riven",
     "Rumble",
     "Ryze",
     "Sejuani",
     "Shaco",
     "Shen",
     "Shyvana",
     "Singed",
     "Sion",
     "Sivir",
     "Skarner",
     "Sona",
     "Soraka",
     "Swain",
     "Syndra",
     "Talon",
     "Taric",
     "Teemo",
     "Thresh",
     "Tristana",
     "Trundle",
     "Tryndamere",
     "TwistedFate",
     "Twitch",
     "Udyr",
     "Urgot",
     "Varus",
     "Vayne",
     "Veigar",
     "Velkoz",
     "Vi",
     "Viktor",
     "Vladimir",
     "Volibear",
     "Warwick",
     "MonkeyKing",
     "Xerath",
     "XinZhao",
     "Yasuo",
     "Yorick",
     "Zac",
     "Zed",
     "Ziggs",
     "Zilean",
     "Zyra"
];

var champHtml = '<select id="champ" class="champSelect" onchange="changeChamp();" name="champ">'
for(var i = 0; i < Champs.length; i++){
    champHtml += '<option value="' + Champs[i] + '">' + Champs[i] + '</option>'
}
champHtml += '</select>';

socket.on('updatePlayers', function(players, myId) {
    document.getElementById("LobbyButtons").innerHTML = '<button class="lobbyButton" onclick="leaveLobby();">Leave</button>';
    document.getElementById("teamRed").innerHTML = "";
    document.getElementById("teamBlue").innerHTML = "";
    console.log("UPDATING Players");
  document.getElementById("LobbyLoading").style.display="none";
  document.getElementById("containerLob").style.display="block";
  var str = '';
  var startButton = '';
  console.log(players);
  for(var i = 0; i < players.length; i++){
    console.log("For each player <->");
    var adminbtns = '<i class="fa fa-exclamation-triangle kick" style="font-size:25px;"></i>';
    var switchbtn = '<i class="fa fa-exchange moveTo" onclick="moveTo(' + "'" + currentLobby + "'" + ')" style="font-size:25px; float:right;"></i>';
    if(players[i].username == currentId){
        str = '<p' + ' id="player' + players[i].displayname +'">' + players[i].displayname + switchbtn;
    } else { 
        str = '<p' + ' id="player' + players[i].displayname +'">'+ players[i].displayname;
    }
    if(players[i].admin == 1){
        if(players[i].username == currentId){
            startButton = '<button class="lobbyButton" onclick="startGame();">Start Game</button>';
            document.getElementById("LobbyButtons").innerHTML += startButton;
            str += '<img width="44px" height="44px" src="/crown.png">' + '</p>';
        } else {
            str += '<img width="44px" height="44px" src="/crown.png">' + adminbtns + '</p>';
        }
    } else {
        str += '</p>';
    };
    if(players[i].team == "PURPLE"){
        console.log("TEAM PURPLE");
        document.getElementById("teamRed").innerHTML += str; 
    } else {

        console.log("TEAM BLUE");
        document.getElementById("teamBlue").innerHTML += str; 
    }

  };
  
});

socket.on('updateLobbies', function(obj){
    console.log("GOT UPDATE LOBBIES");
    if(obj.action == 'remove'){
        console.dir(lobbies);
        if(lobbies[obj.lobby.name]){
            console.log("Removing " + obj.lobby.name);
            document.getElementById("lobby" + obj.lobby.name).remove();
        }
    } 
    if(obj.action == 'load'){
        for(var i = 0; i < obj.lobbies.length ; i++){
            var parent = document.getElementById("BiggerCardcontainer");
            obj.lobbies[i].players = obj.lobbies[i].teamBlue + obj.lobbies[i].teamRed;
            var html = '<div class="card" id="lobby' + obj.lobbies[i].name + '"><h3 class="title">'+ obj.lobbies[i].name +'</h3><i style="font-size: 30px;" class="fa">&#xf11e; <p>' + obj.lobbies[i].status + '</p></i><i style="font-size: 30px;" class="fa">&#xf406; <p>'+ obj.lobbies[i].players +'</p></i><div class="animatedbar"><div class="emptybar"></div><div class="filledbar"></div></div><div class="fa joinbtn" onclick=' + "'" + 'joinLobby("' + obj.lobbies[i].name + '");' + "'>&#xf04b;</div>";
            var doc = parent.insertAdjacentHTML( 'beforeend', html );
            lobbies[obj.lobbies[i].lobbyName] = {};
            lobbies[obj.lobbies[i].lobbyName]['lobbyName'] = obj.lobbies[i].name;
            lobbies[obj.lobbies[i].lobbyName]['html'] = html;
            lobbies[obj.lobbies[i].lobbyName]['document'] = doc;
        }
    }
    if(obj.action == 'update'){ 
        console.log("Update action");

        var parent = document.getElementById("BiggerCardcontainer");
        obj.lobby.players = obj.lobby.teamBlue + obj.lobby.teamRed;
        var html = '<div class="card" id="lobby' + obj.lobby.name + '"><h3 class="title">'+ obj.lobby.name +'</h3><i style="font-size: 30px;" class="fa">&#xf11e; <p>' + obj.lobby.status + '</p></i><i style="font-size: 30px;" class="fa">&#xf406; <p>'+ obj.lobby.players +'</p></i><div class="animatedbar"><div class="emptybar"></div><div class="filledbar"></div></div><div class="fa joinbtn" onclick=' + "'" + 'joinLobby("' + obj.lobby.name + '");' + "'>&#xf04b;</div>";
        var doc = parent.insertAdjacentHTML( 'beforeend', html );
        document.getElementById("lobby" + obj.lobby.name).remove();
        lobbies[obj.lobby.lobbyName] = {};
        lobbies[obj.lobby.lobbyName]['lobbyName'] = obj.lobby.name;
        lobbies[obj.lobby.lobbyName]['html'] = html;
        lobbies[obj.lobby.lobbyName]['document'] = doc;
    }
    if(obj.action == 'add'){
        var parent = document.getElementById("BiggerCardcontainer");
        obj.lobby.players = obj.lobby.teamBlue + obj.lobby.teamRed;
        var html = '<div class="card" id="lobby' + obj.lobby.name + '"><h3 class="title">'+ obj.lobby.name +'</h3><i style="font-size: 30px;" class="fa">&#xf11e; <p>' + obj.lobby.status + '</p></i><i style="font-size: 30px;" class="fa">&#xf406; <p>'+ obj.lobby.players +'</p></i><div class="animatedbar"><div class="emptybar"></div><div class="filledbar"></div></div><div class="fa joinbtn" onclick=' + "'" + 'joinLobby("' + obj.lobby.name + '");' + "'>&#xf04b;</div>";
        var doc = parent.insertAdjacentHTML( 'beforeend', html );
        lobbies[obj.lobby.name] = {};
        lobbies[obj.lobby.name]['lobbyName'] = obj.lobby.name;
        lobbies[obj.lobby.name]['html'] = html;
        lobbies[obj.lobby.name]['document'] = doc;
    }
});

  socket.on('disconnect', function() {
    socket.emit('leave', currentLobby);
	window.location.href = '/logout';
  });
 
  socket.on('close', function() { 
    socket.emit('leave', currentLobby);
	window.location.href = '/logout';
  });

socket.on('leaveLobby', function() {
    console.log("Socket on leave lobby");
    currentLobby = '';
    document.getElementById("teamRed").innerHTML = "";
    document.getElementById("teamBlue").innerHTML = "";  
    document.getElementById("LobbyLoading").style.display="none";
    document.getElementById("containerLob").style.display="none";
    document.getElementById("LobbyPage").style.display="none";
    lobbyFocus = true;
});

socket.on('loadGame', function(token, id, port) {
    let StartGameEvent = new Event('startGame');
    currentLobby = '';
    document.getElementById("tiggerForStartingGame").value = token + "/" + id + "/" + port;
    console.log("Dispatching event");
    document.getElementById("tiggerForStartingGame").dispatchEvent(StartGameEvent);
    document.getElementById("inClient").style.display = "none";
    document.getElementById("inGame").style.display = "block";
});

socket.on('abortGame', function(message){
    let AbortGameEvent = new Event('abortGame');
    console.log("Dispatching event");
    console.log("Aborting with " + message); 
    document.getElementById("tiggerForAbortingGame").dispatchEvent(AbortGameEvent);
    document.getElementById("LobbyMessage").innerHTML = message;
    document.getElementById("LobbyMessage").className = "LobbyError";
});

socket.on('getInLobby', function(lobbyName) {
    console.log("Socket get in lobby");
    currentLobby = lobbyName;
    document.getElementById("LobbyLoading").style.display="block";
    document.getElementById("containerLob").style.display="none";
    document.getElementById("LobbyContent").style.display="none";
    document.getElementById("LobbyPage").style.display="block";
    lobbyFocus = true;
});

socket.on('showChampionSelect', function(){
    console.log("Socket get in ChampSelect");
    currentLobby = lobbyName;
    document.getElementById("LobbyChampionSelect").style.display="block";
    document.getElementById("containerLob").style.display="none";
    lobbyFocus = true;
});

function joinLobby(lobbyName){
    currentLobby = lobbyName;
    console.log("Joining " + lobbyName);
    socket.emit('join', lobbyName);
    console.log("------- EMITED SOCKET JOIN");
    document.getElementById("LobbyPage").style.display="block";
    document.getElementById("LobbyLoading").style.display="block";
    document.getElementById("containerLob").style.display="none";
}

function startGame(){
    socket.emit('startGame');
}

function changeChamp(champ){
    console.log("CHANGE CHAMP TO " + champ + " " + currentLobby);
    socket.emit('changeChamp', champ);
}

function leaveLobby(){
    console.log("BUTTON PRESSED ----------");
    document.getElementById("LobbyLoading").style.display="none";
    document.getElementById("containerLob").style.display="none";
    document.getElementById("LobbyPage").style.display="none";
    socket.emit('leave', currentLobby);
    console.log("LEAVING " + currentLobby);
    currentLobby = '';
    lobbyFocus = false;
}

function createLobby(){
    var obj = {};
    obj.name = document.getElementById("createLobbyname").value;
    obj.password = document.getElementById("createLobbypassword").value;
    obj.mana = document.querySelector("#mana").checked;
    obj.cheats = document.querySelector("#cheats").checked;
    obj.minions = document.querySelector("#minions").checked;
    obj.cooldown = document.querySelector("#cooldown").checked;
    obj.adminForAll = document.querySelector("#adminForAll").checked;
    obj.map = document.getElementById("map").value;
    currentLobby = obj.name;
    socket.emit('createLobby', obj);
}

function moveTo(lobbyName){
     socket.emit('movePlayer', lobbyName);
}

function backToClient(){
    window.location.href = '/';
}