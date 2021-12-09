const path = require('path')
const express = require("express")
const indexRoute = require('../routes/index.js');    //index路由
const cookieRoute = require('../routes/cookie.js');    //index路由
const currentStateRoute = require('../routes/inspect/currentState.js'); //当前状态路由
const cookieParser = require('cookie-parser')



//开启服务器
const port = 9527;
function start() {
  const app = express()
  app.use(express.static('front-end/src'));
  app.use(cookieParser());
  app.use('/', cookieRoute);
  app.use('/', indexRoute);
  app.use('/currentstate', currentStateRoute);
  app.listen(port, () => {
    console.log('Webserver\tlistening:%s\t %s' ,port,new Date().toLocaleTimeString());
  })
}

module.exports.start = start;
//发一个或一组JSON数据
module.exports.sendJSON = function update(data,...msgJSON){
    currentStateRoute.update(data,...msgJSON);
}

module.exports.devconf = function devconf(devID){
    currentStateRoute.devconf(devID)
}