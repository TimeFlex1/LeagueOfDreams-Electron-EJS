const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', async function() {
  var submit = document.getElementById("setupBtn");

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
