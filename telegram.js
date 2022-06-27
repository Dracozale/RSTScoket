process.env.NODE_ENV = 'Configuration';
const express = require('express');
const app = express();
const _ = require('lodash');
const config = require('./config/config.js');

app.get('/', (req, res) => {
   res.json(global.gConfig);
});

// app.listen(global.gConfig.node_port, () => {
//    console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
// });

//console.log("Telegram Token : " + global.gConfig.TeleToken)

const Telegraf = require('telegraf');
const bot = new Telegraf(global.gConfig.TeleToken);
const request = require('request');

bot.start((ctx) => 
   request.get(global.gConfig.RSTApiURLauth+ctx.from.id, {json: true } , (err, res, body) => {
      if (err) { return console.log(err);}
      const auth = body.message;
      // console.log('*********** body value *******');
      // console.log(body);
      // console.log(body.message);
      // console.log(auth); 
      // console.log('*********** body value end *******');
      if (auth == 1){
         ctx.reply('Dear '+ ctx.update.message.from.first_name + ' ' + ctx.update.message.from.id + ' Welcome to Our Bot.\n\nPlease enter /RS Servicename|Ipaddress command to use bot!')
      }else {
         ctx.reply('you are not registered user. please contact admin and give your ID no: ' + ctx.update.message.from.id)
      }
   }))

   bot.hears(/.rs (.+)/, (ctx) => {
   const userId = ctx.from.id;
   //const match = ctx.input.message;
   const svcnip = ctx.message.text.split(' ')[1];
   const servicename =  svcnip.split('|')[0];
   const Ipaddress = svcnip.split('|')[1];
   console.log(svcnip);
   if(servicename.trim() == "" || Ipaddress.trim() == ""){
      ctx.reply('Please check input.\nPlease enter /RS<space>Servicename<nospace>|<nospace>Ipaddress.')
   }else {
      request.get(global.gConfig.RSTApiURLauth+userId, {json: true } , (err, res, body) => {
         try{
            if (err) { return console.log(err);}
         const auth = body.message;
         // console.log('*********** body value *******');
         // console.log(body);
         // console.log(body.message);
         // console.log(auth); 
         // console.log('*********** body value end *******');
         if (auth == 1){
            ctx.reply('Restarting ' + servicename + ' at ' + Ipaddress);
            request.get(global.gConfig.RSTApiURLrestart+servicename+'/'+Ipaddress+'/'+userId+'/'+svcnip, {json: true } , (err, res, body) => {
            if (err) { return console.log(err);}
            console.log(body);
            }); 
         }else {
            ctx.reply('you are not registered user. please contact admin')
         }
         }catch(e){
            console.log("error : " + e); 
         }
      });
   }
   });

    // // console.log(svcnip);
   // // console.log(servicename);
   // // console.log(Ipaddress);
   // //console.log(ctx);
   // //console.log(ctx.message.text);
   // bot.hears(/.RS (.+)/, (ctx) => {
   // const userId = ctx.from.id;
   // ctx.reply('Type svc<space><Servicename>');
   // console.log(ctx);
   // });

//launch bot
bot.launch()

