const tableInfoCom = {
    template: '<div class="cycleInfoForms"> \
    <table class="cycleTable"> \
        <thead> \
            <tr> \
                <td colspan="7" class="timeRow">时间戳:&nbsp;&nbsp;&nbsp;&nbsp; \
                    <span id="tabletitle">{{ time }}</span> \
                </td>\
                <td colspan="7" class="timeRow">当前设备:&nbsp;&nbsp;&nbsp;&nbsp; \
                <span id="tabletitle">贵州省花溪区(设备ID:{{ devID }})</span> \
            </td> \
            </tr> \
            <tr id="tableHead"> \
                <th id="buttonHead_floor">层</th> \
                <th id="buttonHead_entry">入口温度</th> \
                <th id="buttonHead_out">出口温度</th> \
                <th id="buttonHead_vavleState">水泵状态</th> \
                <th id="buttonHead_rotate_cool">冷水阀角度</th> \
                <th id="buttonHead_rotate_back">回水阀角度</th> \
                <th id="buttonHead_T1">混凝土温度1</th> \
                <th id="buttonHead_T2">混凝土温度2</th> \
                <th id="buttonHead_T3">混凝土温度3</th> \
                <th id="buttonHead_T4">混凝土温度4</th> \
                <th id="buttonHead_T5">混凝土温度5</th> \
                <th id="buttonHead_T6">混凝土温度6</th> \
                <th id="buttonHead_T7">混凝土温度7</th> \
                <th id="buttonHead_T8">环境温度</th> \
            </tr> \
        </thead> \
        <tbody v-if="infos.length > 0"> \
            <tr class="tableRow" v-for="data in infos" :key="data.floor"> \
                <td>{{ data.Floor }}</td> \
                <td>{{ data.WaterTemp[0] }}</td> \
                <td>{{ data.WaterTemp[1] }}</td> \
                <td>{{ data.PumpStaus }}</td> \
                <td>{{ data.ValveStatus[0] }}</td> \
                <td>{{ data.ValveStatus[1] }}</td> \
                <td>{{ data.CementTemp[0] }}</td> \
                <td>{{ data.CementTemp[1] }}</td> \
                <td>{{ data.CementTemp[2] }}</td> \
                <td>{{ data.CementTemp[3] }}</td> \
                <td>{{ data.CementTemp[4] }}</td> \
                <td>{{ data.CementTemp[5] }}</td> \
                <td>{{ data.CementTemp[6] }}</td> \
                <td>{{ data.EnvirTemp }}</td> \
            </tr> \
        </tbody> \
    </table> \
</div>',
    data() {
        return {
            time: '未知',
            devID: '未知',
            infos: [],
            timenode: [],
            state: 0,
        }
    },
    methods:{
        updateData: function(value){
            var thisTable = this;
            axios.get(value)
            .then(function (response) {
                thisTable.time = '未知';
                thisTable.infos = [];
                if(!response.data){
                    thisTable.state = -1;
                    return;
                }
                if(response.data != ''){
                    var time = '20';
                    time += response.data.Time[0] + '年';
                    time += response.data.Time[1] + '月';
                    time += response.data.Time[2] + '日';
                    time += response.data.Time[3] + '时';
                    time += response.data.Time[4] + '分';
                    thisTable.time = time;
                    thisTable.devID = response.data.Id;
                    thisTable.infos = response.data.TempData;
                }
                thisTable.state = -1;
            })
            .catch(function (error) {
                alert('请求错误' + error);
            });
        }
    },
    watch:{
        timenode: function(){
            let timestr = '' + this.timenode[0] + this.timenode[1] + this.timenode[2] + this.timenode[3] + this.timenode[4];
            this.updateData('/currentstate/data?devid='+ this.devID +'&' + "timenode=" + timestr);
            currentTimenode = timestr;
        },
        devID: function(){
            this.updateData('/currentstate/data?devid='+ this.devID);
        }
    },
    mounted(){
        this.devID = currentDevId;
        this.updateData('/currentstate/data?devid='+ this.devID)
    }
}
