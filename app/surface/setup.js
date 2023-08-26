const {ipcRenderer} = require('electron');

ipcRenderer.on("download progress", (event, progress) => {
  const cleanProgressInPercentages = progress.percent.toFixed(2);
  this.document.getElementById("downloadProgress").innerHTML = "Downloading " + cleanProgressInPercentages + "%";
});

ipcRenderer.on("download complete", (event, file) => {
    console.log(file);
    this.document.getElementById("downloadProgress").innerHTML = "Game is installing.. It may take a while..";
});

ipcRenderer.on("unzip complete", (event, file) => {
    console.log(file);
    this.document.getElementById("downloadProgress").innerHTML = "Game is installed!";
    ipcRenderer.send('setServer', document.getElementById("serverIp").value, true);
});

window.addEventListener('DOMContentLoaded', async function() {
  var closebtn = document.getElementById("close-btn");
  var maxbtn = document.getElementById("max-btn");
  var minbtn = document.getElementById("min-btn");

  if (minbtn) {
    var minbtntext = document.getElementById("info");
      minbtn.addEventListener("click", function (e) {
          ipcRenderer.send('setupMinimize');
      });
      minbtn.addEventListener("mouseover", function (e) {
        minbtntext.innerHTML = "Minimize";
        minbtntext.style.marginRight = "30px";
        minbtntext.style.display = "block";
      });
      minbtn.addEventListener("mouseout", function (e) {
        minbtntext.style.display = "none";
      });
  }

  if(maxbtn){
    var maxbtntext = document.getElementById("info");
      maxbtn.addEventListener("click", function (e) {
          if (!window.windowState == 1){
              ipcRenderer.send('setupMaximize');   
              window.windowState = 1;     
          } else {
              ipcRenderer.send('setupUnmaximize');
              window.windowState = 0;
          }
      });
      maxbtn.addEventListener("mouseover", function (e) {
        maxbtntext.innerHTML = "Maximize";
        maxbtntext.style.marginRight = "5px";
        maxbtntext.style.display = "block";
      });
      maxbtn.addEventListener("mouseout", function (e) {
        maxbtntext.style.display = "none";
      });
  }

  if(closebtn){
    var closebtntext = document.getElementById("info");
      closebtn.addEventListener("click", function (e) {
          ipcRenderer.send('setupClose');
      });
      closebtn.addEventListener("mouseover", function (e) {
        closebtntext.innerHTML = "Close";
        closebtntext.style.marginRight = "2px";
        closebtntext.style.display = "block";
      });
      closebtn.addEventListener("mouseout", function (e) {
        closebtntext.style.display = "none";
      });
  }

  var submit = document.getElementById("setupBtn");
  var setupBtnFull = document.getElementById("setupBtnFull");

  if(setupBtnFull){
    setupBtnFull.addEventListener("click", function (e) {
      //Check if C:/auxilium exists if not create it

      ipcRenderer.send("download", {
        url: "https://desktopby.co.uk/",
        properties: {directory: "./Game"}
      });
      console.log("Downloading game..");
    });
  }

  if(submit){
    submit.addEventListener("click", function (e) {
          if(document.getElementById("gamePath").value){
            if(document.getElementById("serverIp").value){
              ipcRenderer.send('setPath', document.getElementById("gamePath").value, false);
              ipcRenderer.send('setServer', document.getElementById("serverIp").value, true);
            } else {
              ipcRenderer.send('setPath', document.getElementById("gamePath").value, true);
            }
          } else {
            if(document.getElementById("serverIp").value){
              ipcRenderer.send('setServer', document.getElementById("serverIp").value, true);
            }
          }
    });
  }
});