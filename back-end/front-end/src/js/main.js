const host = window.location.host;  //网址
const devInfoURL = 'data'


var currentDevId = localStorage.getItem("devid");

document.write('<script src="js/component/infotable.js"></script>') //tableInfo组件
document.write('<script src="js/component/devBordHandle.js"></script>') //devbordHandle组件
document.write('<script src="js/component/indictor.js"></script>') //indictor组件
document.write('<script src="js/component/lock.js"></script>') //lock组件



//中央vue事件中转
var vEvent = new Vue();
//文档加载完毕--> 开始渲染组件
this.onload = function () {
    var btn_update = new Vue({
        el: '#button_update',
        data: {
          text: '测试',
        },
        methods: {
          ajaxInfo: ()=>{
            axios
            .get('http://' + host + '/currentstate/data?devid='+currentDevId)
            .then((response) => {
              alert(JSON.stringify(response.data));
            })
            .catch(function(error){
              alert('数据异常' + error);
            })
          }
        }
      })  //测试按钮

//选项卡


//设备板
var device = new Vue({
    el: '#device',
    data() {
      return {
        runningColor: '#ff3322'
      }
    },
    methods:{
        switchDev: function(value){
            document.cookie = encodeURI("cDev="+ value + ";SameSite=Strict");
            vEvent.$emit('updateDev', value);
        }
    },
    components: {
      'devbord-handle': devBordHandleCOM
    },
    computed: {
      run: {
        set: function(value){
          if(value === true)
            this.runningColor = '#aafdcc';
          else
            this.runningColor = '#ff3322';
        }
      }
    },
    mounted(){
        this.$children[0].devID = currentDevId;
    }
  })

//表格组件
var dataDisplay = new Vue({
    el: '#dataDisplay',
    data(){
        return {
            thehost : host
        }
    },
    components: {
        'table-info': tableInfoCom,
        'indictor': indictor
    },
    mounted(){
        this.$children[0].devID = currentDevId;
        vEvent.$on('updateTimeline', value => {
            this.$children[0].timenode = value;
            timelineBox.currentTime = value;
        })
        vEvent.$on('updateDev', value => {
            this.$children[0].devID = value;
            currentDevId = value;
        })
    }
  });

//时间轴框
var timelineBox = new Vue({
    el: '#timelineBox',
    data: {
            timenodes : [],
            currentTime : '',
            lockInterval : null
    },
    methods: {
        getData: function(time){
          if(time)
            vEvent.$emit('updateTimeline', time)          
        },
        getTimeline : function(){
            var thisTimeline = this;
            axios.get('/currentstate/timeline?devid=' + currentDevId)
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
                alert('请求失败:' + error)
            })
        },
        lockAutoUpdate : function(doLock){
            if(doLock){
                clearInterval(this.lockInterval);
            }
            else{
                this.lockInterval = setInterval(() => {
                    this.getTimeline();
                    dataDisplay.$children[0].updateData('/currentstate/data?devid='+ currentDevId);
                }, 60000 * 1);
            }
        }
    },
    props:['timenodes','getData'],
    mounted(){
        vEvent.$on('updateDev',value=>{
            this.getTimeline();
        })
        setTimeout(()=> {
            this.getTimeline();
        }, 1000)
        this.lockAutoUpdate(false);
    },
    components:{
        'btn-timeline': {
            template: '<button id="fastSearch" @click.native="getTimeline"> \
            <img src="img/timelist_rise.png" alt="" width=" 20px" height="20px" \
            style="position:relative;top:4px;left: -6px;"><slot></slot></button>',
        },
        'lock-auto-up': lockAutoUp
    }
})

//下载csv
  var csvinfo = new Vue({
    el: '#csvinfo',
    data() {
      return {
        devid : currentDevId,
        linkTo: "download/csvinfo?devid=" + currentDevId
      }
    },
    mounted(){
        vEvent.$on('updateDev',value=>{
            this.linkTo = "download/csvinfo?devid=" + value;
        })
    }
  })
  window.onbeforeunload = function(){
      localStorage.setItem("devid", currentDevId)
  }
}





