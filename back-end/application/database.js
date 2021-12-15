const mongo = require('../node_modules/mongodb').MongoClient //database
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
    var theLocation = '';
    const theTime = new Date(dealData.Time[0],Number(dealData.Time[1]) - 1,dealData.Time[2],Number(dealData.Time[3]),dealData.Time[4])
    var document = {
        time : theTime,
        location : theLocation,
        data : dealData
    }
    var targetCollection  = 'dev_' + devID;
    if(!arrayToSync[targetCollection])
        arrayToSync[targetCollection] = []
    arrayToSync[targetCollection].push(document);
}

function checkDev(targetCollection){
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
    if(!isConnected){
        return;
    }
    for (const key in arrayToSync) {
        if (Object.hasOwnProperty.call(arrayToSync, key)) {
            const element = arrayToSync[key];
            checkDev(key);
            var goLen = element.length > 10000 ? 10000 : element.length;
            var rest = 10000;
            if(goLen == 10000)
                rest = 1000; //需要处理的数据过多，加快处理速度
            total += goLen;
            setTimeout(() => {
                if(element.length > 0){
                    db.collection(key).insertMany(arrayToSync[key].splice(0,goLen), (err, res) => {
                        if (err) {
                            console.log('ERR[-30]DataBase\t 数据插入失败！! \t %s', new Date().toLocaleString());
                            throw err;
                        }
                    })
                }
            }, rest);
        }
    }
    console.log('DataBase\t 数据库插入%s条 \t %s', total, new Date().toLocaleString());
}


async function find(collection, where){
    return new Promise(function(resolve, reject){
        if(!isConnected){
            reject('数据库未连接');
        }
        db.collection(collection).find(where).toArray(async (err, res)=>{
            if(err) {
                reject(err)
            }
            resolve(res)
        })
    })
}


exports.startDB = startDB;
exports.insertInfo = insert;
exports.find = find;
exports.isConnected = hasDbConnect;