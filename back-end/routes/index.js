// index路由
const express = require('express');
const router = express.Router();  //路由级中间件
const csv = require('../application/csvProcess');   //电子表格下载
const fs = require('fs');
var infos = require('./inspect/info.json')
var allDevsData = require('./inspect/currentState').allDevsData;


router.get('/',(req, res, next) =>{
  res.redirect('/index.html');
  next();
});


router.get('/download/csvinfo', async (req, res, next) => {
  const devid_req = req.query.devid;
  res.set({
      "Context-Type": "application/octet-stream",
      "Content-Disposition": "attachment; filename = infos.csv"
  });
  res.attachment('info.csv');
  if(!allDevsData){
      csv.csvMake([]).then(value => {
          res.end(Buffer.from(value, 'utf-8'));
          console.log('下载为空.');
      })
      return;
  }
  if(!allDevsData.hasOwnProperty(devid_req+'')){
      csv.csvMake([]).then(value => {
          res.end(Buffer.from(value, 'utf-8'));
          console.log('下载为空');
      })
      return;
  }
  csv.csvMake(allDevsData[devid_req]["infoAry"]).then(value => {
      res.end(Buffer.from(value, 'utf-8'));
      console.log('下载完毕');
  })
  console.log('开始下载');
  next();
});





module.exports = router;