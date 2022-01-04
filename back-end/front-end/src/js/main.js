var tempCurrentDevId = localStorage.getItem("devid");

//中央vue事件中转
var vEvent = new Vue({})

var global = {
    pageIndex: 2,
    infoCurrentstate: {
        devconfig: [],
        devicesList: [],
        currentDevId: tempCurrentDevId ? tempCurrentDevId : 0,
    },
    dbqueryRes: [],  //数据库查询结果,
    chartsIndex: [],
};

var dbBuffer = {
    dbqueryRes : []
}

//性能测试
var startTime = new Date();
var endTime = new Date();



window.onbeforeunload = function () {
    localStorage.setItem("devid", global.infoCurrentstate.currentDevId)
}

//文档加载完毕--> 开始渲染组件
this.onload = function () {
    init();

    var cloakDOm = new Vue({
        el: '.cloak'
    })
    var nav = new Vue({
        el: '.nav',
        data() {
            return {
                global: global,
                linkTo: "download/csvinfo?devid=" + global.infoCurrentstate.currentDevId,
                linkTodb: "download/csvinfodb?devid=" + global.infoCurrentstate.currentDevId,
                showdbInput: false,
                turninfi: false,
                dbSearchByDev: true,
                dbSearchDevnodes: [],
                queryDev: 0,
                servert: false,
            }
        },
        methods: {
            optDb: function () {
                this.showdbInput = true;
                setTimeout(() => {
                    this.getDevs();
                }, 300);
            },
            closeM: function () {
                this.showdbInput = false;
            },
            confirmM: async function () {
                startTime = new Date();
                var that = this;
                const date1 = this.$refs.inputDbTimeMin.value;
                const date2 = this.$refs.inputDbTimeMax.value;
                if (new Date(date1) > new Date(date2)) {
                    vEvent.$emit('loadingdb', false);
                    that.showdbInput = false;
                    alert('查询日期有误！')
                }
                else {
                    dbBuffer.dbqueryRes = [];
                    vEvent.$emit('loadingdb', true);
                    var requrl = '';
                    if (this.dbSearchByDev) {
                        const value = this.queryDev;
                        requrl = '/currentstate/db?devid=' + value + '&gt=' + date1 + '&lt=' + date2 + '&servert=' + (this.servert ? 'y' : 'n');
                    }
                    else {
                        const value = this.$refs.inputDbAddr.value;
                        requrl = '/currentstate/db?loc=' + value + '&gt=' + date1 + '&lt=' + date2;
                    }
                    await axios.get(requrl)
                        .then(function (response) {
                            endTime = new Date();
                            console.log('请求时间：' + endTime.getTime() - startTime.getTime() + 'ms')
                            if (response.data) {
                                setTimeout(() => {
                                    if (response.data.length <= 0) {
                                        vEvent.$emit('tipbox', '抱歉！没有找到任何数据')
                                        that.showdbInput = false;
                                        vEvent.$emit('changeopt', 1)
                                        vEvent.$emit('changelisttype', 11)
                                        vEvent.$emit('updateQuerynode', {})
                                        vEvent.$emit('loadingdb', false)
                                        return;
                                    }
                                    dbBuffer.dbqueryRes = response.data.reverse();
                                    vEvent.$emit('dbquery', -1); //表示新的查询
                                    vEvent.$emit('changeopt', 1)
                                    setTimeout(() => {
                                        vEvent.$emit('changelisttype', 11)
                                        vEvent.$emit('updateQuerynode', {});
                                        vEvent.$emit('tipbox', '一共查询到' + response.data.length + '条数据')
                                    }, 100);
                                    vEvent.$emit('loadingdb', false)
                                    that.showdbInput = false;
                                }, 1000);
                            }
                            else {
                                setTimeout(() => {
                                    vEvent.$emit('loadingdb', false);
                                    that.showdbInput = false;
                                    alert('抱歉！没有找到任何数据,请检查是否存在该设备！');
                                }, 1000);
                            }
                        }).catch(err => {
                            alert('数据库查询超时，请稍后再试')
                            console.log(err)
                        })
                }
            },
            getDevs: function () {
                this.dbSearchDevnodes = global.infoCurrentstate.devicesList;
            }
        },
        mounted() {
            var that = this;
            vEvent.$on('updateDev', value => {
                this.linkTo = "download/csvinfo?devid=" + value;
                this.linkTodb = "download/csvinfodb?devid=" + value;
            }),
                vEvent.$on('loadingdb', function (isloading) {
                    that.turninfi = isloading;
                })
        },
        components: {
            'modal-t': modalT
        }
    })

    //设备板
    var devTable = new Vue({
        el: '#devTable',
        data() {
            return {
                global: global,
                showit: true,
                showModal: false,
                devID: global.infoCurrentstate.currentDevId,
                config: {},
                note: '备注:'
            }
        },
        methods: {
            getDevConfig: function () {
                var that = this;
                axios.get('/currentstate/devconfig?devid=' + global.infoCurrentstate.currentDevId)
                    .then(function (response) {
                        that.config = response.data;
                        vEvent.$emit('updateConf', response.data);
                    })
            }
        },
        mounted() {
            var that = this;
            setTimeout(() => {
                that.getDevConfig();
            }, 200);
            vEvent.$on('updateDev', that.getDevConfig);
        },
        components: {
        }
    })

    //提示栏
    var tipBox = new Vue({
        el: '#tipBox',
        data() {
            return {
                global: global,
                box: [{
                    tip: '',   //弹出提示
                    tipclass: "boxtiphide",
                    showtip: false,
                },
                {
                    tip: '',   //弹出提示
                    tipclass: "boxtiphide",
                    showtip: false,
                }],
                buzy: [false, false],
            }
        },
        mounted() {
            var that = this;
            vEvent.$on('tipbox', value => {
                for (var index = 0; index < that.buzy.length; index++) {
                    var i = index;
                    if (!that.buzy[i]) {
                        that.box[i].tip = '提示';
                        that.buzy[i] = true;
                        that.box[i].tipclass = 'boxtipshow'
                        setTimeout(() => {
                            that.box[i].tip = value;
                        }, 1750);
                        setTimeout(() => {
                            that.box[i].tipclass = 'boxtiphide'
                            that.box[i].tip = '';
                        }, 8000);
                        setTimeout(() => {
                            that.buzy[i] = false;
                        }, 9000);
                        return;
                    }
                }
                setTimeout(() => {
                    vEvent.$emit('tipbox', value);
                }, 2000);
            })
        },
    })


    //表格组件
    var dataDisplay = new Vue({
        el: '#dataDisplay',
        data() {
            return {
                global: global,
                showdbInput: false,
            }
        },
        methods: {
        },
        components: {
            'table-info': tableInfoCom,
            'indictor': indictor,
        },
        mounted() {
            var that = this;
            vEvent.$on('updateTimenode', value => {
                that.$children[0].timenode = value;
                infoListBox.currentTime = value;
            })
            vEvent.$on('updateDev', function (value) {
                that.thedevID = value;
            })
            vEvent.$on('updateQuerynode', value => {
                if (value) {
                    that.$children[0].displayData(value.data)
                    infoListBox.currentTime = value.time;
                }
            })
        }
    });

    //时间轴框
    var infoListBox = new Vue({
        el: '#infoListBox',
        data: {
            global: global,
            typeList: 2, //10：近期， 11：数据库 2：设备 30、数据库曲线 31、数据库曲线
            timenodes: [], //节点近期数据
            devnodes: [], //节点设备
            querynodes: [], //缓存数据库数据,
            lazyLoadIndex: 0, //懒加载索引,
            lazyLoading: false,
            currentTime: '',  //选中时间
            displayQuery: [], //部分query
            lockInterval: null,    //自动更新锁
            riseSort: true,    //排序
            dbmenu: false,
            dbmenuCloseDelay: false,
            dbBuf : dbBuffer
        },
        methods: {
            getData: function (time) {
                if (time)
                    vEvent.$emit('updateTimenode', time)
            },
            getQueryData: function (index, node) {
                dbBuffer.dbqueryRes.forEach(element => {
                    if (element.time === node)
                        vEvent.$emit('updateQuerynode', element);
                });
                this.currentTime = node + index;
            },
            loadAll: function () {
                vEvent.$emit('dbquery', dbBuffer.dbqueryRes.length);
            },
            switchDev: function (devid) {
                vEvent.$emit('updateDev', devid);
            },
            getDevs: async function () {
                var that = this;
                this.onelineKeep = false;
                await axios.get('/currentstate/devs')
                    .then(function (response) {
                        if (response.data) {
                            var devs = response.data.all;
                            that.devnodes = devs;
                            vEvent.$emit('updateDevAll', devs);
                            vEvent.$emit('updateDevOn', response.data.on);
                        }
                        else {
                            vEvent.$emit('updateDevAll', []);
                            vEvent.$emit('updateDevOn', []);
                            that.devnodes = [];
                        }
                    }).catch(error => {
                        alert('无法获取设备信息!');
                        console.log(error);
                    })
                vEvent.$emit('updateDev', global.infoCurrentstate.currentDevId)
            },
            dbNodeSort() {
                this.querynodes.reverse();
            },
            getTimeline: function () {
                var that = this;
                axios.get('/currentstate/timeline?devid=' + global.infoCurrentstate.currentDevId)
                    .then(function (response) {
                        that.timenodes = response.data;
                        if (that.timenodes) {
                            that.timenodes.reverse();
                            that.currentTime = that.timenodes[0];
                        }
                        else
                            that.timenodes = [];
                    })
                    .catch(function (error) {
                        alert('请求失败:' + error);
                    })
            },
            lockAutoUpdate: function (doLock) {
                if (doLock) {
                    clearInterval(this.lockInterval);
                }
                else {
                    this.lockInterval = setInterval(() => {
                        this.getTimeline();
                        this.getDevs();
                    }, 7500);
                }
            },
            getItems() {
                switch (this.typeList) {
                    case 10:
                        return this.timenodes;
                    case 11:
                        return this.querynodes;
                    case 2:
                        return this.devnodes;
                    case 30:
                        return this.global.chartsIndex;
                    case 31:
                        return this.global.chartsIndex;
                    default:
                        return [];
                }
            },
            changeSource(){
                const sourceIndex = this.typeList % 10;
                this.typeList = parseInt(this.typeList / 10) * 10 + (sourceIndex === 0 ? 1:0);
            },
            loadQuery() {
                if (this.typeList !== 11)
                    return;
                const scroll = this.$refs['scroll'];
                var distToBottom = scroll.scrollHeight - scroll.scrollTop - document.body.clientHeight;
                if (distToBottom < 30) {
                    vEvent.$emit('dbquery');
                }
            },
            openDbmenu() {
                this.dbmenuCloseDelay = true;
                this.dbmenu = true;
            },
            closeDbmenu() {
                this.dbmenuCloseDelay = false;
                setTimeout(() => {
                    if (this.dbmenuCloseDelay === false)
                        this.dbmenu = false;
                }, 300);
            },
            delayDbmenu() {
                this.dbmenuCloseDelay = true;
            },
            dbCharts() {
                vEvent.$emit('changeopt', 3);
                vEvent.$emit('changelisttype',31)
                setTimeout(() => {
                    vEvent.$emit('dbCharts')
                }, 100);
            }
        },
        mounted() {
            var that = this;
            vEvent.$on('updateDev', value => {
                that.getTimeline();
            })
            vEvent.$on('changelisttype', (type) => {
                this.typeList = type;
            })
            vEvent.$on('dbquery', function (number) {
                that.lockInterval = true;
                if (Number(number) === -1) {
                    //新的查询集合
                    number = 500;
                    that.lazyLoadIndex = 0;
                }
                const numberOnceLoad = Number(number ? number : 2000);
                const len = dbBuffer.dbqueryRes.length;
                var tempNode = that.querynodes;
                if (that.lazyLoading === true || that.lazyLoadIndex >= dbBuffer.dbqueryRes.length) {
                    return;
                }
                that.lazyLoading = true; //开始加载
                setTimeout(() => {
                    that.$nextTick(function (){
                        for (let i = 0; i < ((len < numberOnceLoad) ? len : numberOnceLoad); i++) {
                            if (that.lazyLoadIndex >= dbBuffer.dbqueryRes.length) {
                                setTimeout(() => {
                                    that.$nextTick(()=>{
                                        vEvent.$emit('tipbox', "所有数据已加载完毕!")
                                    })
                                }, 700);
                                break;
                            }
                            if (that.riseSort === true)
                                tempNode.push(dbBuffer.dbqueryRes[that.lazyLoadIndex].time); //尾载入200条
                            else
                                tempNode.unshift(dbBuffer.dbqueryRes[that.lazyLoadIndex].time); //头载入200条
                            that.lazyLoadIndex++;
                        }
                        that.querynodes = tempNode;
                        that.lazyLoading = false;
                        that.currentTime = that.querynodes[0];
                    })
                }, 500);
            });
            setTimeout(() => {
                that.getTimeline();
                that.getDevs();
            }, 100);
            this.lockAutoUpdate(true); //初始锁定自动更新
        },
        computed: {
            title: function(){
                switch (this.typeList) {
                    case 10:
                        return '近期数据';
                    case 11:
                        return '数据库查询结果';
                    case 2:
                        return '设备列表';
                    case 30:
                        return '曲线图:近期数据';
                    case 31:
                        return '曲线图:数据库';
                    default:
                        break;
                }
            },
        },
        components: {
            'lock-auto-up': lockAutoUp,
            'refresh': refresh
        }
    })

    //选卡
    var options = new Vue({
        el: '#options',
        props: ['msg'],
        data() {
            return {
                global: global,
            }
        },
        components: {
            'btn-options': btnOptions
        },
        mounted() {
            var that = this;
            that.$children[1].isActive = true;
            vEvent.$on('changeopt', function (index) {
                global.pageIndex = index;
                that.$children.forEach(element => {
                    if (element.index === index) {
                        element.isActive = true;
                    }
                    else
                        element.isActive = false;
                });
                switch (index) {
                    case 1:
                        vEvent.$emit('changelisttype', 10)
                        break;
                    case 2:
                        vEvent.$emit('changelisttype', 2)
                        break;
                    case 3:                       
                        vEvent.$emit('changelisttype', 30);
                        break;               
                    default:
                        break;
                }
            })
        },
    })
    var charts = new Vue({
        el: '#chartsDisplay',
        data() {
            return {
                dbBuffer : dbBuffer,
                currentSeries: {
                    time: [],
                    data: []
                }
            }
        },
        methods: {
            fetchSeries: function(){
                var that = this;
                that.currentSeries = {
                    time: [],
                    data: []
                }
                axios.get('/currentstate/data?devid=' + global.infoCurrentstate.currentDevId
                 + '&lately=y&timenode=null')
                 .then(function(response){
                     const src = response.data;
                     if(src){
                        that.currentSeries.data = src;
                        for(var i = 0; i < src.length; i++){
                            let timenode = new Date(
                                Number(src[i].Time[0]) ,
                                Number(src[i].Time[1]) - 1 ,
                                Number(src[i].Time[2]) , 
                                Number(src[i].Time[3]) ,
                                Number(src[i].Time[4])
                            );
                            that.currentSeries.time.push(timenode);
                        }
                        const tempModel = that.getCurrentTempInfo;
                        const tempNode = that.getCurrentTempNode;
                        vEvent.$emit('chart-paint','层一',tempNode,tempModel[0]);
                        vEvent.$emit('chart-paint','层二',tempNode,tempModel[1]);
                        vEvent.$emit('chart-paint','层三',tempNode,tempModel[2]);
                        vEvent.$emit('chart-paint','层四',tempNode,tempModel[3]);
                        vEvent.$emit('chart-paint','层五',tempNode,tempModel[4]);
                        vEvent.$emit('chart-paint','层六',tempNode,tempModel[5]);
                     }
                 })
            },
            makeSeriesX: function(source,srcType){
                var node = [];
                switch (srcType) {
                    case 0:
                        for(var i = 0;i < source.length;i ++)
                            node.push(new Date(source[i].time).toLocaleString('cn',{hour12:false}))
                        return node;
                    case 1:
                        for(var i = 0;i < source.length;i ++)
                            node.push(source[i].toLocaleString('cn',{hour12:false}))
                        return node;        
                    default:
                        break;
                }
            },
            makeSeriesY: function(source, srcType){
                var temp = new Array(6);
                for (var lay = 0; lay < 6; lay++) {
                    var model = {
                        tempC: new Array(7),
                        tempE: []
                    }
                    for (var i = 0; i < 7; i++) {
                        model.tempC[i] = [];
                    }
                    switch (srcType) {
                        case 0:
                            console.log(srcType)
                            source.forEach(element => {
                                for (var i = 0; i < 7; i++) {
                                    model.tempC[i].push(element.data.TempData[lay].CementTemp[i]);
                                }
                                model.tempE.push(element.data.TempData[lay].EnvirTemp);
                            });
                            break;
                        case 1:
                            source.forEach(element => {
                                for (var i = 0; i < 7; i++) {
                                    model.tempC[i].push(element.TempData[lay].CementTemp[i]);
                                }
                                model.tempE.push(element.TempData[lay].EnvirTemp);
                            });
                            break;
                    
                        default:
                            break;
                    }
                    temp[lay] = model;
                }
                return temp;
            }
        },
        mounted(){
            var that = this;
            vEvent.$on('dbCharts',function(){
                const tempModel = that.getDbTempInfo;
                const tempNode = that.getDbTempNode;
                vEvent.$emit('chart-paint','层一',tempNode,tempModel[0]);
                vEvent.$emit('chart-paint','层二',tempNode,tempModel[1]);
                vEvent.$emit('chart-paint','层三',tempNode,tempModel[2]);
                vEvent.$emit('chart-paint','层四',tempNode,tempModel[3]);
                vEvent.$emit('chart-paint','层五',tempNode,tempModel[4]);
                vEvent.$emit('chart-paint','层六',tempNode,tempModel[5]);
            });
            for(var i =0; i<  this.$children.length; i++){
                global.chartsIndex.push(this.$children[i].chartname)
            };
            vEvent.$on('fetchlately',that.fetchSeries)
        },
        computed: {
            getDbTempInfo() {
                return this.makeSeriesY(dbBuffer.dbqueryRes,0);
            },
            getDbTempNode(){
                return this.makeSeriesX(dbBuffer.dbqueryRes,0)
            },
            getCurrentTempInfo(){
                return this.makeSeriesY(this.currentSeries.data,1)
            },
            getCurrentTempNode(){
                return this.makeSeriesX(this.currentSeries.time,1)
            }
        },
        components: {
            't-chart': tChart
        }
    })
}


function init() {
    vEvent.$on('updateConf', (data) => { global.infoCurrentstate.devconfig = data });
    vEvent.$on('updateDevAll', (data) => { global.infoCurrentstate.devicesList = data; });
    vEvent.$on('updateDevOn', (data) => { global.infoCurrentstate.devicesOnlineList = data; });
    vEvent.$on('updateDev', (data) => { global.infoCurrentstate.currentDevId = data; });
    vEvent.$emit('init', global.infoCurrentstate);

}

async function reqTimeline() {
    return new Promise((resolve, reject) => {

    })
}