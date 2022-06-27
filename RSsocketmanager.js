process.env.NODE_ENV = 'Configuration';
const _ = require('lodash');
const config = require('./config/config.js');
const Telegraf = require('telegraf');
const bot = new Telegraf(global.gConfig.TeleToken);
const request = require('request');
var express = require('express');
const mssql = require('mssql')
var app = express();
var io = require('socket.io');
const fs = require('fs');
const { stringify } = require('querystring');
var io = require('socket.io-client');
var socket = io.connect(global.gConfig.SocketServer + global.gConfig.SocketServerport);

const {
    setIntervalAsync,
    clearIntervalAsync 
  } = require('set-interval-async/dynamic');
const { reset, restart } = require('nodemon');

const mssqlcon = mssql.connect(global.gConfig.sqlConfig);

async function main(){
    const timer = setIntervalAsync(
    (async function(){
        await mssqlcon;
        try{
            var sqlC="SELECT TOP(1) * FROM [dbo].[Tbl_Request] where ReplyFlag = 0";
            const queryresult = await mssql.query(sqlC);
            if (queryresult.recordsets[0].length > 0){ 
            dbdata = queryresult.recordset[0];
            socketid = dbdata["SocketID"];
            requestid = dbdata["RequestID"];
            servicename = dbdata["ServiceName"];
            replyflag = dbdata["ReplyFlag"];
            replymessage = dbdata["ReplyMessage"];
            broadcastatt = dbdata["BroadcastAtt"];
            ipaddress = dbdata["ServerIPadd"];
            message = dbdata["RequestMessage"];
             if(replymessage != null & replyflag == 0){
             try{
                bot.telegram.sendMessage(requestid, String(replymessage));
                var sqla="UPDATE [dbo].[Tbl_Request] SET [ReplyFlag] = '" + 1 + "' WHERE [RequestID] = '" + requestid + "' and [SocketID] = '" + socketid + "'";
                const queryresult = await mssql.query(sqla); 
             }catch(e){
                console.log("error " + e);
             }
             await clearIntervalAsync(timer);
             main();
            }
            if (replymessage == null & broadcastatt == 1 & timer.id == 10){
                try{
                    var info = {
                        "restart": {
                            "socketid": socketid.trim(),
                            "servicename": servicename.trim(),
                            "ipaddress": ipaddress,
                            "userID": requestid.trim(),
                            "message": message.trim(),
                            "broadcastatt" : broadcastatt
                        }
                      };
                      socket.emit('message', info);
                    }catch(e){
                        console.log("error " + e);    
                    }
                await clearIntervalAsync(timer);
                main();
            }
            if(replymessage == null & broadcastatt == 2 & timer.id == 10){
                try{
                    console.log("unable to trace server : " + dbdata.recordsets);
                    var retrepmessage = "Unable to trace server " + ipaddress + " please check ip address and services"
                    var sqld="UPDATE [dbo].[Tbl_Request] SET [ReplyMessage] = '" + retrepmessage + "' WHERE [RequestID] = '" + requestid + "' and [SocketID] = '" + socketid + "'";
                    const queryresult = await mssql.query(sqld);
                }catch(e){
                    console.log("error " + e);    
                }
                await clearIntervalAsync(timer);
                main();
            }
        }
        console.log(timer.id);
        }catch(e){
            console.log("error : " + e);
        }
        if(timer.id > 20){
            clearIntervalAsync(timer);
            main();
        }
    })
    ,1000)
}
main();
