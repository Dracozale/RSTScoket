process.env.NODE_ENV = 'Configuration';
const _ = require('lodash');
const config = require('./config/config.js');
var express = require('express');
var io = require('socket.io-client');
var app = express();
const fs = require('fs');
const ip = require('ip');
var socket = io.connect(global.gConfig.SocketServer + global.gConfig.SocketServerport);

const os = require('os');
const { stringify } = require('querystring');
const { restart } = require('nodemon');
const { chdir } = require('process');
const { StringDecoder } = require('string_decoder');
const ifaces = os.networkInterfaces();

async function main(){
  (async function () {
    await socket;
    try{
      socket.on('connect', async function(){
        console.log ('Server connected...' + socket.id);
        var myip = ip.address();
        console.log('myip = ' + myip);
        socket.on('message',async function (data) {
        console.log(data);
        var servicename = data.restart.servicename;
        var ipaddress = data.restart.ipaddress;
        var RequestID = data.restart.userID;
        var messsocketid = data.restart.socketid;
        console.log("servicename:" + data.restart.servicename);
        console.log("ipaddress:" + data.restart.ipaddress);
        if (ipaddress == myip){
          console.log('this is my ip');
          var svc_status ="nssm64 status "+servicename;
          var child = await require('child_process').exec(svc_status, async function (error, stdout, stderr) {
            var retstat = "";
              if(!error){
                let stopped = stdout.replace(/[^a-zA-Z0-9]/g,'');		
                var retstat = '';			
                  if(stopped=="SERVICESTOPPED"){
                    console.log(servicename+" is Stopped");
                    console.log("starting services "+servicename);
                    var svc_started ="nssm64 start "+servicename;
                    var childstart = await require('child_process').exec(svc_started, async function (error, stdout, stderr) {
                      var scriptOutput = "";
                      if(!error)
                      {
                        var returnstat = {
                              "returnstat": {
                                 "RequestID" : RequestID,
                                  "SocketID": messsocketid,
                                  "replymessage": String(servicename) + " : Restart successfully at " + ipaddress
                                  //"replymessage" : "sepatutnya" + t
                              }
                             };
                            console.log(returnstat);	
                            socket.emit('returnstatus', returnstat);
                        console.log(stdout);
                      }else{
                        console.log(stderr);
                        let errstat = stderr.replace(/[^a-zA-Z0-9]/g,'');
                        var returnstat = {
                          "returnstat": {
                              "RequestID" : RequestID,
                              "SocketID": messsocketid,
                              "replymessage": String(servicename) + " : unable to restart, please remote " + ipaddress + " to troubleshoot. Actual error Message : " + errstat
                          }
                        };	
                        socket.emit('returnstatus', returnstat);
                        console.log(returnstat);
                      }
                    });
                    
                    
                  }else if(stopped=="SERVICERUNNING"){
                    //console.log(data+"=>"+stdout);
                    console.log(servicename+" is Running");
                    retstat = String(servicename) + " at " + ipaddress + " is Running";
                    var returnstat = {
                      "returnstat": {
                          "RequestID" : RequestID,
                          "SocketID": messsocketid,
                          "replymessage": retstat,
                      }
                     };	
                    socket.emit('returnstatus', returnstat);
                    console.log(returnstat);
                  }
                }else{
                  console.log(servicename + " is Not Exists");
                  retstat = String(servicename) +" at " + ipaddress +" is Not Exists";
                  var returnstat = {
                    "returnstat": {
                        "RequestID" : RequestID,
                        "SocketID": messsocketid,
                        "replymessage": retstat,
                    }
                  };	
                  socket.emit('returnstatus', returnstat);
                  console.log(returnstat);
                }		
              });
              process.stdout.write('\033c');
        }else {
          console.log("not my ip!!");
        }
              
    });//end socket.on(connect) 
        
      });
    }
    catch (e){
      console.log("socket connection error" + e)
    }
  })()
}
main();

// childstart.stdout.setEncoding('utf8');
// await childstart.stdout.on('data', function(data) {
// console.log(data.toString()); 
// var t = data.toString(); 
// console.log("testing :" + t);
//  var returnstat = {
//     "returnstat": {
//         "SocketID": socket.id,
//         "replymessage": String(servicename) + " : Restart successfully",
//         //"replymessage" : "sepatutnya" + t
//     }
//    };
//   console.log(returnstat);	
//   socket.emit('returnstatus', returnstat);
// });  

// const ip = Object.keys(ifaces).forEach(function (ifname) {
//   var alias = 0;

//   ifaces[ifname].forEach(function (iface) {
//     if ('IPv4' !== iface.family || iface.internal !== false) {
//       // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
//       return;
//     }

//     if (alias >= 1) {
//       // this single interface has multiple ipv4 addresses
//       console.log(ifname + ':' + alias, iface.address);
//     } else {
//       // this interface has only one ipv4 adress
//       console.log(ifname, iface.address);
//     }
//     ++alias;
//   });
// });

