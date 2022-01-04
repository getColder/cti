const tChart = {
    props: ['chartname'],
    template: '<div class="infoCharts" :id="chartname"></div>',
    data(){
        return {
            tempChart : '',
            option: {
                title: {
                    text: this.chartname
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {type: 'cross'}
                },
                legend: {
                    data: ['温度1', '温度2', '温度3', '温度4', '温度5', '温度6', '温度7', '环境温度'],
                    icon: 'pin',
                    selected: {
                        '温度2' : false,
                        '温度3' : false,
                        '温度4' : false,
                        '温度5' : false,
                        '温度6' : false,
                        '温度7' : false,
                    }

                },
                xAxis: {
                    data : [],
                    type: 'category',
                },
                yAxis: {
                    type: 'value',
                    min: 'dataMin'
                },
                series: new Array(8).fill({name : '',
                    data : [],
                    type : 'line',
                }),
                dataZoom:[
                    {
                        xAxisIndex: 0,
                        startValue: 0,
                        endValue: 30,
                    },
                    {
                        type: 'inside',
                        yAxisIndex: 0,
                        startValue: 0,
                        minValueSpan: 0,
                    }
                ]
            }
        }
    },
    methods: {
        paint: function(tempNode, tempModel){
            var tmpView = new Array(8);
            for(var i = 0;i < 8;i ++){
                var obj = {
                    name : '温度' +(i +1),
                    data : [i,i,i,i,i],
                    type : 'line',
                }
                if(i === 7){
                    obj.stack = 'x';
                    obj.areaStyle = {};
                }
                tmpView[i] = obj;
            }
            tmpView[7].name = '环境温度';
            this.option.series = tmpView;
            for(var i = 0;i < this.option.series.length; i++){
                this.option.series[i].data = tempModel.tempC[i];
            }
            this.option.series[7].data = tempModel.tempE;
            this.option.xAxis.data = tempNode;
            this.tempChart.setOption(this.option);
        }
    },
    mounted(){
        this.tempChart = echarts.init(this.$el);
        //this.option.series[7].stack = 'x';
        var that = this;
        vEvent.$on('chart-paint',function(chartname,x,y){
            if(that.chartname === chartname){
                that.tempChart.showLoading();
                setTimeout(() => {
                    that.paint(x,y);
                    that.tempChart.hideLoading();
                }, 1000);
            }
        })
    }
}