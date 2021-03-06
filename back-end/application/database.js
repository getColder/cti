const mongo = require('../node_modules/mongodb').MongoClient //database
const ObjectId = require('mongodb').ObjectId
const emitter = require('./event').emitter
var url_mongo = "mongodb://localhost:27017/concrete_temper_info";

var arrayToSync = {};
var dbconnection;
var db;
var syncTimer;
var isConnected = false;
var cCount = 0;
var tickPrintState; //打印次数计时

function hasDbConnect(){
    return isConnected;
}

function dropTickPrintState(){
    clearInterval(tickPrintState);
}

function startDB(){
    tickPrintState = setInterval(function() {
        if(isConnected == false){
            console.log('[%s]正在连接数据库..',cCount)
            ++ cCount;
        }
    }.bind(this), 2000);
    mongo.connect(url_mongo,async (err, mongodb)=>{
        if(err) {
            console.log('ERR[-2]DataBase\t 数据库连接失败! \t %s',new Date().toLocaleString());
            isConnected = false;
            setTimeout(function() {
                dropTickPrintState();
            }.bind(this), 500);
            return;
        }
        mongodb.on('serverClosed',()=>{
            console.log('数据库已关闭')
            clearInterval(syncTimer)
        })
        console.log('DataBase\t 数据库连接成功! \t %s',new Date().toLocaleString());
        db = mongodb.db("concrete_temper_info");
        isConnected = true;
        syncTimer = setInterval(() => {
            syncData();
        }, 1000 * 60);
        dropTickPrintState();
    });
}



async function insert(dealData){
    var devID = dealData['Id']
    if(!isConnected){
        return;
    }
    var theLocation = dealData.location;
    var theProjectNumber = dealData.projectNumber;
    const theTime = new Date(dealData.Time[0],Number(dealData.Time[1]) - 1,dealData.Time[2],Number(dealData.Time[3]),dealData.Time[4])
    var document = {
        time : theTime,
        location : theLocation,
        projectNumber: theProjectNumber,
        data : dealData
    }
    var targetCollection  = 'dev_' + devID;
    if(!arrayToSync[targetCollection])
        arrayToSync[targetCollection] = []
    arrayToSync[targetCollection].push(document);
}

async function checkDev(targetCollection){
    db.listCollections().toArray(async (err, collections)=>{
        var isNotExsisted = true;
        collections.some(col=>{
            if(col.name == targetCollection)
                isNotExsisted &= (col.name != targetCollection);
        })
        if(isNotExsisted){
            db.createCollection(targetCollection);
            console.log('DataBase\t 新设备集合%s \t %s',targetCollection,new Date().toLocaleString());
        }
    });
}


async function syncData(){
    var total = 0;
    if(!isConnected || arrayToSync.length <= 0){
        return;
    }
    for (const key in arrayToSync) {
        if (Object.hasOwnProperty.call(arrayToSync, key)) {
            const element = arrayToSync[key];
            await checkDev(key);
            setTimeout(() => {
                    if(arrayToSync[key].length <= 0)
                        return;
                    db.collection(key).insertMany(arrayToSync[key], (err, res) => {
                        if (err) {
                            console.log('ERR[-30]DataBase\t 数据插入失败！ \t %s', new Date().toLocaleString());
                            throw err;
                        }
                    arrayToSync[key] = [];
                })
            }, 1000);
        }
    }
    console.log('DataBase\t 数据库插入%s条 \t %s', total, new Date().toLocaleString());
}


async function find(collection, where, queryType){
    return new Promise(async function(resolve, reject){
        if(!isConnected){
            reject('数据库未连接');
            return;
        }
        var tableNames = [];
        tableNames = await db.listCollections().toArray()
        .then(table =>{
            var temp = [];
             table.forEach(element => {
                 temp.push(element.name)
             });
             return temp;
        })
        if(queryType == 0){
            //按设备查找
            var collectionExist = false;
            tableNames.forEach(theName => {
                if (collection == theName)
                    collectionExist = true;
            });
            if (!collectionExist) {
                reject('集合' + collection + '不存在');
                return;
            }
            db.collection(collection).find(where).toArray(async (err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
        }
        else if(queryType == 1){
            //按地址信息查询
            var ress = [];
            for (const key in tableNames) {
                if (Object.hasOwnProperty.call(tableNames, key)) {
                    const element = tableNames[key];
                    var resQ;
                    resQ = await db.collection(element).find(where).toArray()
                    .then(async (res) => {
                        return res;
                    })
                    try {
                        if(resQ.length > 0)
                            ress = ress.concat(resQ)
                    } catch (error) {
                        console.log('ERR[-22]DataBase\t 数据库查询异常：%s! \t %s',error, new Date().toLocaleString());
                    }
                }
            }
            resolve(ress);
        }
    })
}


exports.startDB = startDB;
exports.insertInfo = insert;
exports.find = find;
exports.isConnected = hasDbConnect;
exports.listDevs = async function(){
    var tableNames = [];
    tableNames = await db.listCollections().toArray()
    .then(table =>{
        var temp = [];
         table.forEach(element => {
             temp.push(element.name)
         });
         return temp;
    })
    tableNames.sort();
    return tableNames;
}

const offset = 8 * 60 * 60 * 1000
function timeToObjId(time){
    var date = new Date(time)
    var t = new Date(date.getTime() - offset);
    t = t.getTime()/1000;
    return t.toString(16) + '0000000000000000';
}

exports.whereByServerTime = function(time1,time2){
   return {
        '_id':{
            '$gt': ObjectId(timeToObjId(time1)),
            '$lt': ObjectId(timeToObjId(time2))
        }
    }   
}