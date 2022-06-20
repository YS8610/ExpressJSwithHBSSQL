require('dotenv').config();
const express = require("express");
let router = express.Router();
const fs = require('fs');
const path = require('path');
const pool = require('../repo/sqlRepo');
const logger = require('../services/logger')

// logging requests
router.post("/"+ process.env.TOKEN,(req, res,next) =>{
  // fs.appendFile('acamper.log',JSON.stringify(req.body)+"\n", err=>{
  //     if (err) {
  //         console.error(err)
  //         return
  //     }
  // })
  // logger.info(JSON.stringify(req.body))
  // logger.info(req.body["message"]["chat"])
  // res.json({msg:"ok"});
  next()
})


// SQL querying function
getAllSqlData = () => {
  return new Promise( (resolve,reject)=> {
    let testQuery = 'SELECT * FROM User';
    pool.query(testQuery, (error, data) =>{
        if (error) { return reject(error); }
        else { return resolve(data); }
    })
  })
};


// SQL querying
router.get("/" + process.env.TOKEN + "/alldata",(req, res,next) =>{
  getAllSqlData()
    .then( (data)=>{
        res.json(data);
    })
    .catch((error)=>{ 
        console.log(error);
    })
})


// telegraf telegram bot
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.TOKEN);
router.use(bot.webhookCallback("/" + process.env.TOKEN));
bot.start((ctx) => {
  ctx.telegram.sendChatAction(ctx.message.chat.id, "typing")
    .then( () => ctx.reply('Welcome') )
});
bot.command('id', (ctx) => {
  ctx.telegram.sendChatAction(ctx.message.chat.id, "typing")
    .then( () => ctx.reply(ctx.message.chat.id) )
})


// heartbeat test function
router.get("/",(req, res,next) =>{
    res.render('test',{msg:new Date().toISOString() + " from telegram"})
})

router.get("/"+ process.env.TOKEN,(req, res,next) =>{
  res.json({msg:"webhook working" });
})



module.exports = router;