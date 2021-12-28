const btnOptions = {
    data() {
        return {
            isActive: false,
            activeCss: "btnOpt_inactive"
        }
    },
    template: '<button @click="slct" :class="activeCss"><slot><slot></button>',
    methods: {
        slct: async function () {
            this.$parent.$emit('changeOpt', this._uid);
            // 基于准备好的dom，初始化echarts实例
            setTimeout(() => {
                var myChart = echarts.init(document.getElementById("chartsDisplay"));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: 'ECharts 入门示例'
                },
                tooltip: {},
                legend: {
                    data: ['销量','数字']
                },
                xAxis: {
                    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
                },
                yAxis: {},
                series: [
                    {
                        name: '销量',
                        type: 'line',
                        data: [5, 20, 36, 10, 10, 20],
                        smooth: true
                    },
                    {
                        name: '数字',
                        type: 'line',
                        data: [5, 20, 36, 10, 10, 20]
                    }
                ]
            };
            setTimeout(() => {
                option.series = [
                    {
                        name: '销量',
                        type: 'line',
                        data: [5, 20, 36, 10, 10, 25],
                        smooth : false
                    },
                    {
                        name: '数字',
                        type: 'line',
                        data: [15, 2, 76, 30, 40, 20]
                    }
                ]
                myChart.setOption(option);
            }, 3000);
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
            }, 1000);
            
        }
    },
    watch: {
        isActive: function (isActive, state) {
            if (isActive == state)
                return;
            if (isActive) {
                this.activeCss = "btnOpt_active";
            }
            else {
                this.activeCss = "btnOpt_inactive";
            }
        }
    }
}