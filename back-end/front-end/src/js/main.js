const host = window.location.host;  //网址
const devInfoURL = 'data'

function getCookie(cookieWanted){
    var cookieAry = document.cookie.split("; ");
    if(cookieAry == 0)
        return null;
    for(var i = 0; i < cookieAry.length; i++){
        var aCookie = cookieAry[i].split("=");
        if(cookieWanted== (aCookie[0]) && aCookie.length > 1){
            return aCookie[1];
        }
    }
    return null;
}

var currentDevId = getCookie('cDev');
var currentTimenode = '';

document.write('<script src="js/component/infotable.js"></script>') //tableInfo组件
document.write('<script src="js/component/devBordHandle.js"></script>') //devbordHandle组件

//中央vue事件中转
var vEvent = new Vue();
//文档加载完毕--> 开始渲染组件
this.onload = function () {
    var btn_update = new Vue({
        el: '#button_update',
        data: {
          text: '测试当前数据',
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
        'table-info': tableInfoCom
    },
    mounted(){
        this.$children[0].devID = currentDevId;
        vEvent.$on('updateTimeline', value => {
            this.$children[0].timenode = value;
        })
        vEvent.$on('updateDev', value => {
            this.$children[0].devID = value;
        })
    }
  });

//时间轴框
var timelineBox = new Vue({
    el: '#timelineBox',
    data: {
            timenodes : [],
    },
    methods: {
        getData: function(time){
          if(time)
            vEvent.$emit('updateTimeline', time)          
        }
    },
    props:['timenodes','getData'],
    mounted(){
        vEvent.$on('updateDev',value=>{
            this.$children[0].getTimeline();
        })
    },
    components:{
        'btn-timeline': {
            template: '<button id="fastSearch" @click="getTimeline"> \
            <img src="img/timelist_rise.png" alt="" width=" 20px" height="20px" \
            style="position:relative;top:4px;left: -6px;"><slot></slot></button>',
            methods: {
                getTimeline : function(){
                    axios.get('/currentstate/timeline?devid=' + currentDevId)
                    .then(function(response){
                        timelineBox.timenodes = response.data;
                        if(timelineBox.timenodes)
                            timelineBox.timenodes.reverse();
                        else
                            timelineBox.timenodes = [];
                    })
                    .catch(function(error){
                        alert('请求失败:' + error)
                    })
                }
            },
            mounted(){
		var thisbtn = this;
		setTimeout(()=> {
			thisbtn.getTimeline();
		}, 1000)
                setInterval(() => {
                    thisbtn.getTimeline();
                }, 60000 * 1);
            }
        }
    }
})

//下载csv
  var csvinfo = new Vue({
    el: '#csvinfo',
    data() {
      return {
        devid : currentDevId,
        linkTo: "currentstate/download/csvinfo?devid=" + currentDevId
      }
    },
    mounted(){
        vEvent.$on('updateDev',value=>{
            this.linkTo = "currentstate/download/csvinfo?devid=" + value;
        })
    }
  })

}





