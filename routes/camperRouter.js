require('dotenv').config();
const express = require("express");
let router = express.Router();
const fs = require('fs');
const path = require('path');
const pool = require('../repo/sqlRepo');
const logger = require('../services/logger')


// Function
concatArray= (array)=>{
  let str = "";
  if (array.length===0){ return "0";}

  array.forEach( (item) => {
    str = str + item;
  })
  return str;
}

// SQL querying function
getAllSqlData = () => {
  return new Promise( (resolve,reject)=> {
    let testQuery = 'SELECT cdcid, chatid, startdate, enddate, dayFilter, weekdayFilter, weekendFilter, class FROM carLesson;';
    pool.query(testQuery, (error, data) =>{
        if (error) { return reject(error); }
        else { return resolve(data); }
    })
  })
};

getUserSqlData = (cdcID,chatid) => {
  return new Promise( (resolve,reject)=> {
    const userQuery = 'select cdcid,chatid,startdate,enddate,dayFilter ,weekdayFilter ,weekendFilter, class from carLesson WHERE cdcid = ? and chatid = ?;';
    pool.query(userQuery,[cdcID,chatid], (error, data) =>{
        if (error) { return reject(error); }
        else { return resolve(data); }
    })
  })
};

setUserSqlData = (bookdetail) => {
  return new Promise( (resolve,reject)=> {
    const userQuery = 'UPDATE carLesson set startdate=?, enddate=?, dayFilter=?, weekdayFilter=?, weekendFilter=? WHERE cdcid = ? and chatid = ?;';
    let a = [
      bookdetail.startdate,
      bookdetail.enddate,
      bookdetail.dayFilter,
      bookdetail.weekdayFilter,
      bookdetail.weekendFilter,
      bookdetail.cdcid,
      bookdetail.chatid
    ]
    pool.query(userQuery,a, (error, data) =>{
        if (error) { return reject(error); }
        else { return resolve(data); }
    })
  })
};

// route 
router.get("/:pw/all",(req, res,next) => {
  if (req.params.pw == process.env.CAMPERBOT_KEY){
    getAllSqlData()
    .then( (data)=>{
        res.json(data);
    })
    .catch((error)=>{ 
        console.log(error);
        res.status(404).json({ "msg":"not found"})
    })
  }
  else{
    res.status(404).json({ "msg":"not found"})
  }
})


router.get("/:chatid/:acct",(req, res,next) => {
  let todayDate = new Date().toISOString().slice(0, 10);
  getUserSqlData(req.params.acct,req.params.chatid)
    .then( (data) => {
      acctinfo = {
        "chatid" : req.params.chatid,
        "acct": req.params.acct,
        "todayDate" : todayDate,
        "curSDate" : data[0].startdate,
        "curEDate" : data[0].enddate,
        "curDayFilter" : data[0].dayFilter,
        "curWeekDayFilter" : data[0].weekdayFilter,
        "curWeekEndFilter" : data[0].weekendFilter,
        "class" : data[0].class
      };
      res.status(200).render("carCamperForm",acctinfo);
      // res.status(200).send(acctinfo)
    })
    .catch( (err) =>{
      res.status(404).send("not found");
    })
})


router.get("/testing/:chatid/:acct", (req, res,next)=>{
  getUserSqlData(req.params.acct,req.params.chatid)
  .then( (data) => {

    res.status(200).json(data);
  })
  .catch( (err) =>{
    res.status(404).send("not found")
  })

})

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
  
router.get("/", (req, res,next) =>{
  res.send("camperbot working")
})

router.post("/", (req, res,next) =>{
  let dayfilter = []
  let weekdayfilter = []
  let weekendfilter = []
  let sDate = (req.body.startDate).split("-")[2] + (req.body.startDate).split("-")[1] + (req.body.startDate).split("-")[0].substring(2)
  let eDate = (req.body.endDate).split("-")[2] + (req.body.endDate).split("-")[1] + (req.body.endDate).split("-")[0].substring(2)

  for (const prop in req.body){
    ["d1","d2","d3","d4","d5","d6","d7"].forEach( (d) => {
      if (d === prop) { dayfilter.push(d.charAt(1)) }
    });
    ["WDs1","WDs2","WDs3","WDs4","WDs5","WDs6","WDs7"].forEach( (WDs) =>{
      if (WDs===prop) {weekdayfilter.push(WDs.charAt(3))}
    });
    ["WEs1","WEs2","WEs3","WEs4","WEs5","WEs6","WEs7"].forEach( (WEs) =>{
      if (WEs===prop) {weekendfilter.push(WEs.charAt(3))}
    });
  }

  let bookingFilter = {
    "chatid" : req.body.chatId,
    "cdcid" : req.body.cdcId,
    "startdate" : sDate,
    "enddate" : eDate,
    "dayFilter" : concatArray(dayfilter),
    "weekdayFilter" : concatArray(weekdayfilter),
    "weekendFilter" : concatArray(weekendfilter)
  }

  setUserSqlData(bookingFilter)
    .then( () =>{
      res.status(200).send("success")
    } )
    .catch( (err)=>{
      res.status(505).send("error updating");
    })
})


module.exports = router;