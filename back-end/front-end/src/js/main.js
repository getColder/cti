const host = window.location.host;  //网址
const devInfoURL = 'data'

var devicesList = [];
var devicesOnlineList = [];
var currentDevId = localStorage.getItem("devid");
var devConfig = {}

document.write('<script src="js/component/infotable.js"></script>') //tableInfo组件
document.write('<script src="js/component/indictor.js"></script>') //indictor组件
document.write('<script src="js/component/lock.js"></script>') ///lock组件
document.write('<script src="js/component/btnOptions.js"></script>') //btn-options组件
document.write('<script src="js/component/modal.js"></script>') //modal组件
document.write('<script src="js/component/refresh.js"></script>') //modal组件


window.onbeforeunload = function(){
    localStorage.setItem("devid", currentDevId)
}

//文档加载完毕--> 开始渲染组件
this.onload = function () {

//中央vue事件中转
    var vEvent = new Vue()


    var nav = new Vue({
        el: '.nav',
        data(){
            return {
                devid : currentDevId,
                linkTo: "download/csvinfo?devid=" + currentDevId,
                linkTodb: "download/csvinfodb?devid=" + currentDevId,
                showdbInput : false,
                turninfi : false,
                dbSearchByDev: true,
                dbSearchDevnodes : [],
                queryDev : 0
            }
        },
        methods:{ 
            optDb: function(){
                this.showdbInput = true;
     
            },            
            closeM : function(){
                this.showdbInput = false;
            },
            confirmM : function(){
                var that = this;
                const date1 = this.$refs.inputDbTimeMin.value;
                const date2 = this.$refs.inputDbTimeMax.value;
                if(new Date(date1) > new Date(date2))
                    alert('查询日期有误！')
                else{
                    vEvent.$emit('loadingdb',true);
                    var requrl = '';
                    if(this.dbSearchByDev){
                        const value = this.queryDev;
                        requrl = '/currentstate/db?devid='+ value +'&gt='+date1+ '&lt=' + date2;
                    }
                    else{
                        const value = this.$refs.inputDbAddr.value;
                        requrl = '/currentstate/db?loc='+ value +'&gt='+date1+ '&lt=' + date2;
                    }
                    axios.get(requrl, {timeout: 20000})
                    .then(function(response){
                        if(response.data){
                            setTimeout(() => {
                                if(response.data.length <= 0){
                                    vEvent.$emit('tipbox','抱歉！没有找到任何数据')
                                    that.showdbInput = false;
                                    vEvent.$emit('changelisttype',2)
                                    vEvent.$emit('updateQuerynode', {})
                                    vEvent.$emit('loadingdb',false)
                                    return;
                                }
                                vEvent.$emit('dbquery', response.data)
                                vEvent.$emit('changeopt', 0) 
                                setTimeout(() => {
                                    vEvent.$emit('changelisttype',2)
                                    vEvent.$emit('updateQuerynode', {})
                                    vEvent.$emit('tipbox','一共查询到' + response.data.length + '条数据')
                                }, 100);
                              vEvent.$emit('loadingdb',false)
                                that.showdbInput = false;  
                            }, 1000);
                        }
                        else{
                            setTimeout(() => {
                                vEvent.$emit('loadingdb',false)
                                that.showdbInput = false;
                                alert('抱歉！没有找到任何数据,请检查是否存在该设备！')
                            }, 1000);
                        }    
                    }).catch(err=>{
                        alert('数据库查询超时，请稍后再试')
                        console.log(err)
                    })
                }
            },
            getDevs : function() {
                this.dbSearchDevnodes = devicesList;      
            }
        },
        mounted(){
            var that = this;
            vEvent.$on('updateDev',value=>{
                this.linkTo = "download/csvinfo?devid=" + value;
            }),
            vEvent.$on('loadingdb',function(isloading){
                that.turninfi = isloading;
            })
        },
        components:{
            'modal-t' : modalT
        }
    })

//设备板
    var devTable = new Vue({
        el : '#devTable',
        data(){
            return{
                showit : true,
                showModal : false,
                devID : currentDevId,
                config : {},
                note: '备注:'
            }
        },
        methods: {
            getDevConfig: function (){
                var that = this;
                axios.get('/currentstate/devconfig?devid=' + currentDevId)
                .then(function(response){
                     that.config = response.data
                })
            }
        },
        mounted() {
            var that = this;
            setTimeout(() => {
                that.getDevConfig();
            }, 100);
	    vEvent.$on('updateDev',that.getDevConfig);
        },
       components:{
        }
    })

//表格组件
    var dataDisplay = new Vue({
        el: '#dataDisplay',
        data(){
            return {
                devID : currentDevId,
                showit : false,
                showdbInput : false,
            }
        },
        methods:{
        },
        components: {
            'table-info': tableInfoCom,
            'indictor': indictor,
        },
        mounted(){
            var display = this;
            vEvent.$on('updateTimenode', value => {
                display.$children[0].timenode = value;
                infoListBox.currentTime = value;
            })
            vEvent.$on('updateDev', function(value){
                display.devID = value;
                display.$children[0].devID = value;
            })
            vEvent.$on('updateQuerynode', value => {
                display.$children[0].displayData(value.data)
                infoListBox.currentTime = value.time;
            })
        }
    });

//时间轴框
var infoListBox = new Vue({
    el: '#infoListBox',
    data: {
            typeList : 1, //0：近期， 1：数据库， 2： 设备
            title : "近期数据",
            timenodes : [], //近期数据节点
            devnodes : [], //设备数据节点
            querynodes : [], //数据库节点
            currentTime : '',  //选中时间设备
            currentDevId : '', 
            dbqueryData : [],  //数据库数据
            lockInterval : null,    //自动更新锁
            riseSort : true,    //排序
            tip : '',   //弹出提示
            tipclass : "boxtiphide",
            showtip :  false,
            devOnline : []

    },
    methods: {
        getData: function(time){
          if(time)
            vEvent.$emit('updateTimenode', time)          
        },
        getQueryData: function(key) {
            if(!this.riseSort){ 
                var list = [];
                list = list.concat(this.dbqueryData);
                if(list[key]){
                    vEvent.$emit('updateQuerynode',list.reverse()[key])
                }
            }
            else{
                if(this.dbqueryData[key])
                    vEvent.$emit('updateQuerynode',this.dbqueryData[key])
            }
            this.currentTime = key;
        },
        switchDev: function(dev){
            currentDevId = dev;
            this.currentDevId = currentDevId;
            vEvent.$emit('updateDev',currentDevId)
        },
        getDevs : function() {
            var that = this;
            axios.get('/currentstate/devs')
                .then(function(response){
                    if(response.data){
                        var devs = response.data.all;
                        for (let index = 0; index < devs.length; index++) {
                            devs[index] = devs[index].substring(4, devs.length);                 
                        }
                        devicesList = that.devnodes = devs;
                        devicesOnlineList = response.data.on;
                        console.log(response.data)
                    }
                    else
                    devicesList = that.devnodes = [];
                })
            vEvent.$emit('updateDev',currentDevId)
        },
        getTimeline : function(){
            var thisTimeline = this;
            axios.get('/currentstate/timeline?devid=' + thisTimeline.currentDevId)
            .then(function(response){
                thisTimeline.timenodes = response.data;
                if(thisTimeline.timenodes){
                    thisTimeline.timenodes.reverse();
                    thisTimeline.currentTime = thisTimeline.timenodes[0];
                }
                else
                    thisTimeline.timenodes = [];
            })
            .catch(function(error){
                alert('请求失败:' + error);
            })
        },
        lockAutoUpdate : function(doLock){
            if(doLock){
                clearInterval(this.lockInterval);
            }
            else{
                this.lockInterval = setInterval(() => {
                    this.getTimeline();
                    this.getDevs();
                }, 7500);
            }
        },
        getItems(){
            switch (this.typeList) {
                case 0:
                    this.title = '近期数据'
                    return this.timenodes;
                case 1:
                    this.title = '设备列表'
                    return this.devnodes;
                case 2:
                    this.title = '数据库查询结果'
                    return this.querynodes;
                default:
                    return this.timenodes;
            }
        }
    },
    computed:{
        onlineDev : function(){
            this.devOnline = devicesOnlineList;
        }
    },
    mounted(){
        var that = this;
        this.currentDevId = currentDevId;
        vEvent.$on('updateDev',value=>{
            that.getTimeline();
        })
        vEvent.$on('changelisttype',(type)=>{
            this.typeList = type;
        })
        vEvent.$on('dbquery', function(value) {
            that.dbqueryData = value.reverse();
            that.querynodes = [];
            that.dbqueryData.forEach(element => {
                that.querynodes.push(element.time)
            });
            that.lockInterval = true;
            that.currentTime = that.querynodes[0];
        })
        vEvent.$on('tipbox',value=>{
            that.$refs['scroll'].scrollTop = 0;
            that.showtip = true;
            setTimeout(() => {
                that.tipclass = 'boxtipshow'
            }, 100);
            setTimeout(() => {
                that.tip = '提示';
            }, 250);
            setTimeout(() => {
                that.tip = value;
            }, 1750);
            setTimeout(() => {
                that.tipclass = 'boxtiphide'
                that.tip = '';
            }, 8000);
            setTimeout(() => {
                that.showtip = false; 
            }, 9000);
        })
        setTimeout(()=> {
            that.getTimeline();
            that.getDevs();
        }, 100)
        this.lockAutoUpdate(true); //初始锁定自动更新
    },
    components:{
        'lock-auto-up': lockAutoUp,
        'refresh' : refresh
    }
})

//选卡
    var options = new Vue({
        el: '#options',
        data(){
            return{
                index : -1
            }
        },
        components:{
            'btn-options': btnOptions
        },
        mounted(){
            var that = this;
            this.$on('changeOpt', function (value){
                var opts = this.$children;
                for (const key in opts) {
                    if (Object.hasOwnProperty.call(opts, key)) {
                        const element = opts[key];
                        if (element._uid != value) {
                        }
                        else {
                            vEvent.$emit('changeopt',key)
                        }
                    }       //激活标签选项卡
                }
            })
            that.$children[1].isActive = true;
            vEvent.$on('changeopt',function(index){
                that.$children.forEach(element => {
                    element.isActive = false;
                });
                that.$children[index].isActive = true;
                dataDisplay.showit = false;
                devTable.showit = false; 
                switch (Number(index)) {
                    case 0:
                        vEvent.$emit('changelisttype',0)
                        dataDisplay.showit = true;      
                        break;
                    case 1:
                        vEvent.$emit('changelisttype',1)
                        devTable.showit = true;   
                        break;
                
                    default:
                        break;
                }    
            })
        },
    })

}





