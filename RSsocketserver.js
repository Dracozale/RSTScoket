process.env.NODE_ENV = 'Configuration';
const _ = require('lodash');
const config = require('./config/config.js');
var express = require('express');
const mssql = require('mssql')
var app = express();
var io = require('socket.io');
const fs = require('fs');
const { stringify } = require('querystring');

var server = app.listen(global.gConfig.SocketServerport, function(){
  console.log('listening to request on prt' + global.gConfig.SocketServerport);
});

const sockets = io(server);
const mssqlcon = mssql.connect(global.gConfig.sqlConfig);

async function main(){
    (async function () {
      await server;
      try{
        sockets.on('connection', (function(socket) {
          console.log('made socket connection!!!', socket.id);
          socket.on('message', async function(data) {
              console.log("receiving data");
              console.log(data);
              const messsocketid = data.restart.socketid;
              const servicename = data.restart.servicename;
              const ipaddress = data.restart.ipaddress;
              const requestID = data.restart.userID;
              const message = data.restart.message;
              // console.log("servicename:" + servicename);
              // console.log("ipaddress:" + ipaddress);
              try{
              if(data.restart.broadcastatt != null){
                socket.broadcast.emit('message',data);
                var sqlf="UPDATE [dbo].[Tbl_Request] SET [BroadcastAtt] = '" + 2 + "' WHERE [RequestID] = '" + requestID + "' and [SocketID] = '" + messsocketid + "'";
                const queryresult = await mssql.query(sqlf); 
                console.log("update broadcast attempt : 2") 
              }else {
                await mssqlcon;
                  // create Request object
                  // query to the database and get the records
                  var sqlC="INSERT INTO [dbo].[Tbl_Request] ([SocketID],[RequestID],[ReplyFlag],[RequestMessage],[ReplyMessage],[ServerIPadd],[ServiceName],[BroadcastAtt],[ReqDateTime]) VALUES ('"+ messsocketid +"','"+ requestID +"','"+ 0 +"','" + message + "',null,'"+ ipaddress +"','"+servicename+"','1',GETDATE())";
                  const queryresult = await mssql.query(sqlC);
                  console.log("******query result")
                  console.log(sqlC)
                  console.log(queryresult)
                  console.log("**************************")
                  socket.broadcast.emit('message',data);        
                }
              }
              catch (e){
                console.log("query error :" + e);
              }
            });
            
            socket.on('returnstatus',async function(data){
            const retreqid = data.returnstat.RequestID;
            const messsocketid = data.returnstat.SocketID;
            const retrepmessage = data.returnstat.replymessage;
            console.log('**********returnstatus*******')
            console.log(data)
            try{
              var sqld="UPDATE [dbo].[Tbl_Request] SET [ReplyMessage] = '" + retrepmessage + "' WHERE [RequestID] = '" + retreqid + "' and [SocketID] = '" + messsocketid + "'";
              const queryresult = await mssql.query(sqld);
              console.log(sqld);
              } catch(e){
                console.log("update table error:" + e);
              };
          });
        }));
      }
      catch (e){
        console.log("socket connection error" + e)
      }
      mssql.on('error', err => {
        console.log(err);
        })
    })()
}

main();




// var x =Object.values(require('os').networkInterfaces()).reduce(
//     (r, list) => r.concat(list.reduce(
//         (rr, i) => rr.concat(
//                     i.family==='IPv4' && !i.internal && i.address || []
//                 ), [])), []
//     )
// let settings = require('./settings.json');
        
// async function CheckingServices()
// {	
    

//         const fs = require('fs');
//         let config="";
//         let services_list = null;
//         try
//         {
//             config = await fs.readFileSync('./ars_settings.json','utf8');
//             //console.log(config);
            
//         }catch(err){
//             console.log("test=>"+err);
//         }
//         let obj = JSON.parse(config);
//         services_list = obj.Services;
//         //console.log(services_list)
    
    
//         services_list.forEach(async function(data) {		 
        

//         //Using NSSM to get windows services status
//         var svc_status ="nssm64 status "+data;
//         var child = await require('child_process').exec(svc_status, function (error, stdout, stderr) {
            
//             if(!error){
                
//                 let stopped = stdout.replace(/[^a-zA-Z0-9]/g,'');					
//                 //console.log(stopped);
                
//                 if(stopped=="SERVICESTOPPED"){
//                     console.log(data+" is Stopped");
//                     console.log("starting services "+data);
//                     var svc_started ="nssm64 start "+data;
//                     var childstart = require('child_process').exec(svc_started, function (error, stdout, stderr) {
//                         if(!error)
//                         {
//                             console.log(data + "=>"+ stdout);
//                         }else{
//                             console.log(stderr);
//                         }
//                     });	
//                 }else if(stopped=="SERVICERUNNING"){
                    
//                     //console.log(data+"=>"+stdout);
//                     console.log(data+" is Running");
//                 }
//             }else{
//                 console.log(data +" is Not Exists");
//             }			
            
//         });
//         process.stdout.write('\033c');
      
// });

// }
// CheckingServices();	