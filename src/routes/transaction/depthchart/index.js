/* eslint-disable array-callback-return */
import React, { Component } from 'react'
import { theme } from 'quant-ui';
import { connect } from 'dva';
import { getCrossoverIndex } from "@/utils/formula";
import { toLowPrice } from "@/utils/utils";
// import echarts from 'echarts';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';  //折线图是line,饼图改为pie,柱形图改为bar
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/markLine';
import throttle from "lodash/throttle";
let page = {};
let numberIndex = 0;
let priceStart = 100;
window.onresize = function () {
    page.timer = setTimeout(() => {
        try {
            if (page.myChart) {
                page.myChart.resize();
            }
        } catch (error) {
            
        }
    }, 10);
}
let option = {
    grid: { left: 50, top: "15%", right: 30, bottom: 30 },
    backgroundColor: theme.getCurrentColor() === "default" ? "#23303B" : "",
    tooltip: {
        confine: true,
        trigger: 'axis',
        axisPointer: {
            type: 'line',
            lineStyle: {
                color: 'rgba(0, 0, 0, 0)',
                opacity: 0.1,
            },
            label: {
                show: true,
                margin:-2000,
                color: "white",
                backgroundColor: "gray",
                formatter: (data) => {
                    try {
                        let midPrice = 0;
                        if(page.state.buyData.length > 0 && page.state.sellData.length){
                            let left = page.state.buyData[0];
                            let right = page.state.sellData[page.state.sellData.length - 1];
                            midPrice = toLowPrice((left.price + right.price) / 2)
                        }
                        let percentNum = ((midPrice - data.value) * 100 / midPrice);
                        let priceRight = midPrice + midPrice * (percentNum / 100);
                        let rightIndex = page.state.sellData.find((item) => {
                            if (item.price <= priceRight) {
                                return item
                            }
                        });
                        if (percentNum > 0 && rightIndex) {
                            return "买档: " + data.value + ", 卖档:" + rightIndex.price;
                        } else if (percentNum < 0) {
                            priceRight = midPrice + midPrice * (percentNum / 100);
                            rightIndex = page.state.buyData.find((item) => {
                                if (item.price <= priceRight) {
                                    return item
                                }
                            });
                            if (rightIndex) {
                                return "买档: " + rightIndex.price + ", 卖档:" + data.value;
                            } else {
                                return "买档: " + data.value + ", 卖档:" + data.value;
                            }
                        } else {
                            return "买档: " + data.value + ", 卖档:" + data.value;
                        }
                    } catch (error) {
                        //aa
                    }

                }
            }
        },
        formatter: function (params, ticket, callback) {
            try {
                let midPrice = 0;
                if(page.state.buyData.length > 0 && page.state.sellData.length){
                    let left = page.state.buyData[0];
                    let right = page.state.sellData[page.state.sellData.length - 1];
                    midPrice = toLowPrice((left.price + right.price) / 2)
                }
                let percentNum = ((midPrice - params[1].name * 1) * 100 / midPrice);
                let percent = percentNum.toFixed(1) + "%";
                let priceRight = midPrice + midPrice * (percentNum / 100);
                let rightIndex = page.state.sellData.find((item) => {
                    if (item.price <= priceRight) {
                        return item
                    }
                });
                let option = {
                    series: [{
                        id: "1234",
                        type: "line",
                        markLine: {
                            silent: true,
                            label: {
                                position: "middle",
                                show: true,
                                formatter: percent,
                            },
                            animation: false,
                            symbol: "none",
                            lineStyle: {
                                opacity: 1
                            },
                        }
                    }
                    ]
                };
                if (percentNum > 0 && rightIndex) {
                    option.series[0].markLine.data = [
                        [
                            {
                                lineStyle: {               //警戒线的样式  ，虚实  颜色
                                    type: "solid",
                                    color: "#00BC7D",
                                    width: 0.5
                                },
                                label: {
                                    formatter: "-" + percent,
                                },
                                coord: [params[1].name.toString(), params[1].value || params[0].value]
                            },
                            {
                                coord: [midPrice.toString() + " ", params[1].value || params[0].value]
                            }
                        ], [
                            {
                                lineStyle: {               //警戒线的样式  ，虚实  颜色
                                    type: "solid",
                                    color: "#DB5252",
                                    width: 0.5
                                },
                                label: {
                                    formatter: "+" + percent,
                                },
                                coord: [midPrice.toString() + " ", rightIndex.all]
                            },
                            {
                                coord: [rightIndex.price.toString(), rightIndex.all]
                            }
                        ],
                    ]
                } else if (percentNum < 0) {
                    priceRight = midPrice + midPrice * (percentNum / 100);
                    percent = (-percentNum).toFixed(1) + "%";
                    rightIndex = page.state.buyData.find((item) => {
                        if (item.price <= priceRight) {
                            return item
                        }
                    });
                    if (rightIndex) {
                        option.series[0].markLine.data = [
                            [
                                {
                                    lineStyle: {               //警戒线的样式  ，虚实  颜色
                                        type: "solid",
                                        color: "#00BC7D",
                                        width: 0.5
                                    },
                                    label: {
                                        formatter: "-" + percent,
                                    },
                                    coord: [rightIndex.price.toString(), rightIndex.all]
                                },
                                {
                                    coord: [midPrice.toString() + " ", rightIndex.all]
                                }
                            ], [
                                {
                                    lineStyle: {               //警戒线的样式  ，虚实  颜色
                                        type: "solid",
                                        color: "#DB5252",
                                        width: 0.5
                                    },
                                    label: {
                                        formatter: "+" + percent,
                                    },
                                    coord: [midPrice.toString() + " ", params[1].value || params[0].value]
                                },
                                {
                                    coord: [params[1].name.toString(), params[1].value || params[0].value]
                                }
                            ],
                        ]
                    }
                }
                page.myChart.setOption(option);
            } catch (error) {

            }

            // return 'Loading';
        },
        textStyle: { color: '#fff', fontSize: '12em' },
        extraCssText: 'box-shadow: 0 0 16px 0 rgba(0, 0, 0, .2);border-radius: 4px;'
    },
    axisPointer: {
        link: {
            xAxisId: ['buy', 'sell'],
        },
    },
    xAxis: {
        type: 'category',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            show: true,
            textStyle: {
                color: theme.getCurrentColor() === "default" ? "white" : ""
            },
        },
        splitLine: { show: false },
        scale: true,
        boundaryGap: false,
    },
    dataZoom: [{
        type: 'inside',
        xAxisIndex: [0],
        filterMode: 'none',
        moveOnMouseMove: false,
        moveOnMouseWheel: false,
    },
    {
        show: true,
        type: 'inside',
        yAxisIndex: [0],
        moveOnMouseMove: false,
        moveOnMouseWheel: false,
        filterMode: 'filter',
    }],

    yAxis: [{
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
            show: true,
            color: theme.getCurrentColor() === "default" ? "white" : "",
            fontSize: "12em",
            formatter: function (value, index) {
                if (value >= 1000 && value <= 999999) {
                    return (value / 1000).toFixed(1) + "k";
                } else if (value >= 1000000 && value <= 999999999) {
                    return (value / 1000000).toFixed(1) + "M";
                } else {
                    return value;
                }
            }
        }
    }],
    series: [
        {
            id: "buy",
            name: '买单',
            type: 'line',
            showSymbol: false,
            symbolSize: 3,
            step: 'start',
            sampling: 'average',
            itemStyle: { normal: { color: '#4cc453' } },
            lineStyle: { normal: { color: '#9CD7BA' } },
            areaStyle: {
                color: '#9CD7BA',
            },
        },
        {
            id: "sell",
            name: '卖单',
            type: 'line',
            showSymbol: false,
            symbolSize: 3,
            step: 'start',
            sampling: 'average',
            itemStyle: { normal: { color: '#e94c4c' } },
            lineStyle: { normal: { color: '#F399A1' } },
            areaStyle: { color: '#F399A1' },
        },
    ]
}
class Index extends Component {
    constructor(props) {
        super(props)
        this.myChart = null;
        this.state = {
            sellData: [],
            buyData: []
        }
        this.height = 0;
        this.width = 0;
        this.oldStart = 0;
        this.oldEnd = 100;
        this.index = 0;
        this.firstShow = true;
        page = this;
    }
    // componentWillMount = () => {
    //     let orderBookL2_deep = window._message.orderBookL2_deep || [];
    //     orderBookL2_deep.push((depthData) => {
    //         if (depthData) {
    //             if (this.firstShow) {
    //                 this.firstShow = false;
    //                 this.myChart.on('globalout', (e) => {
    //                     let option = {
    //                         series: [{
    //                             id: "1234",
    //                             type: "line",
    //                             markLine: {
    //                                 label: {
    //                                     show: false,
    //                                 },
    //                                 lineStyle: {
    //                                     opacity: 0
    //                                 }
    //                             }
    //                         }
    //                         ]
    //                     };
    //                     this.myChart.setOption(option)
    //                 })
    //             }
    //             let buyData = [];
    //             let sellData = [];
    //             let leftAll = 0;
    //             let rightAll = 0;
    //             let index = parseInt(depthData.length / 2);
    //             if (depthData.length > 0) {
    //                 if (depthData[index].side === "Sell") {
    //                     index++;
    //                     while (depthData[index].side === "Sell") {
    //                         index++;
    //                     }
    //                 } else {
    //                     index--
    //                     while (depthData[index].side === "Buy") {
    //                         index--;
    //                     }
    //                 }
    //                 // const { buyData, sellData } = nextProps;
    //                 for (let i = 0; i < 100; i++) {
    //                     let right = depthData[index - 1 - i];
    //                     let left = depthData[index + i];
    //                     if (!!right && right.side === "Sell") {
    //                         rightAll += right.size;
    //                         right.all = rightAll;
    //                         sellData.unshift(right);
    //                     }
    //                     if (left && left.side === "Buy") {
    //                         leftAll += left.size;
    //                         left.all = leftAll;
    //                         buyData.push(left)
    //                     }
    //                 }
    //                 if (buyData.length > 0 && sellData.length > 0) {
    //                     let option = {
    //                         xAxis: {
    //                             min: buyData[buyData.length - 1].price,
    //                             max: sellData[0].price
    //                         },
    //                         yAxis: [{
    //                             axisLine: { show: true },
    //                             axisTick: { show: true },
    //                         }],
    //                         series: [
    //                             {
    //                                 data: buyData.map((ele) => ([ele.price, ele.all])),
    //                             },
    //                             {
    //                                 data: sellData.map((ele) => ([ele.price, ele.all]))
    //                             }, {
    //                                 name: '趋势线',
    //                                 type: 'line',
    //                                 markLine: {
    //                                     animation: false,
    //                                     silent: true,
    //                                     label: {
    //                                         show: false
    //                                     },
    //                                     symbol: "none",               //去掉警戒线最后面的箭头
    //                                     data: [{
    //                                         silent: true,             //鼠标悬停事件  true没有，false有
    //                                         label: {
    //                                             show: false        //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
    //                                         },
    //                                         lineStyle: {               //警戒线的样式  ，虚实  颜色
    //                                             type: "solid",
    //                                             color: "#e6e6e6",
    //                                             // opacity: 0.5
    //                                         },
    //                                         xAxis: buyData[0].price           // 警戒线的标注值，可以有多个yAxis,多条警示线   或者采用   {type : 'average', name: '平均值'}，type值有  max  min  average，分为最大，最小，平均值
    //                                     }]
    //                                 }
    //                             }
    //                         ]
    //                     }
    //                     if (document.getElementById(`depthchart-charts`)) {
    //                         if (this.height !== document.getElementById(`depthchart-charts`).clientHeight
    //                             || this.width !== document.getElementById(`depthchart-charts`).clientWidth) {
    //                             this.myChart.resize();
    //                             this.height = document.getElementById(`depthchart-charts`).clientHeight;
    //                             this.width = document.getElementById(`depthchart-charts`).clientWidth;
    //                         }
    //                     }
    //                     this.myChart.setOption(option);
    //                     this.setState({
    //                         sellData, buyData
    //                     })
    //                 }

    //             }
    //         }
    //     })
    //     window._message.orderBookL2_deep = orderBookL2_deep;
    //     this.updateChart();

    // }
    // updateChart = () => {
    //     let orderBookL2_deep_update = window._message.orderBookL2_deep_update || [];
    //     orderBookL2_deep_update.push((depthData) => {
    //         if (depthData.length > 0) {
    //             console.log(2)
    //             if (this.firstShow) {
    //                 this.firstShow = false;
    //                 this.myChart.on('globalout', (e) => {
    //                     let option = {
    //                         // xAxis:{
    //                         //     interval: 25,
    //                         //     axisLabel: {
    //                         //         show:true
    //                         //     }
    //                         // },
    //                         series: [{
    //                             id: "1234",
    //                             type: "line",
    //                             markLine: {
    //                                 label: {
    //                                     show: false,
    //                                 },
    //                                 lineStyle: {
    //                                     opacity: 0
    //                                 }
    //                             }
    //                         }
    //                         ]
    //                     };
    //                     this.myChart.setOption(option)
    //                 })
    //             }
    //             let buyData = [];
    //             let sellData = [];
    //             let leftAll = 0;
    //             let rightAll = 0;
    //             let index = parseInt(depthData.length / 2);
    //             if (depthData.length > 0) {
    //                 if (depthData[index].side === "Sell") {
    //                     index++;
    //                     while (depthData[index].side === "Sell") {
    //                         index++;
    //                     }
    //                 } else {
    //                     index--
    //                     while (depthData[index].side === "Buy") {
    //                         index--;
    //                     }
    //                 }
    //                 // const { buyData, sellData } = nextProps;
    //                 for (let i = 0; i < 100; i++) {
    //                     let right = depthData[index - 1 - i];
    //                     let left = depthData[index + i];
    //                     if (!!right && right.side === "Sell") {
    //                         rightAll += right.size;
    //                         right.all = rightAll;
    //                         sellData.unshift(right);
    //                     }
    //                     if (left && left.side === "Buy") {
    //                         leftAll += left.size;
    //                         left.all = leftAll;
    //                         buyData.push(left)
    //                     }
    //                 }
    //                 if (buyData.length > 0 && sellData.length > 0) {
    //                     let option = {
    //                         xAxis: {
    //                             min: buyData[buyData.length - 1].price,
    //                             max: sellData[0].price
    //                         },
    //                         yAxis: [{
    //                             axisLine: { show: true },
    //                             axisTick: { show: true },
    //                         }],
    //                         series: [
    //                             {
    //                                 data: buyData.map((ele) => ([ele.price, ele.all])),
    //                             },
    //                             {
    //                                 data: sellData.map((ele) => ([ele.price, ele.all]))
    //                             }, {
    //                                 name: '趋势线',
    //                                 type: 'line',
    //                                 markLine: {
    //                                     animation: false,
    //                                     silent: true,
    //                                     label: {
    //                                         show: false
    //                                     },
    //                                     symbol: "none",               //去掉警戒线最后面的箭头
    //                                     data: [{
    //                                         silent: true,             //鼠标悬停事件  true没有，false有
    //                                         label: {
    //                                             show: false        //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
    //                                         },
    //                                         lineStyle: {               //警戒线的样式  ，虚实  颜色
    //                                             type: "solid",
    //                                             color: "#e6e6e6",
    //                                             // opacity: 0.5
    //                                         },
    //                                         xAxis: buyData[0].price           // 警戒线的标注值，可以有多个yAxis,多条警示线   或者采用   {type : 'average', name: '平均值'}，type值有  max  min  average，分为最大，最小，平均值
    //                                     }]
    //                                 }
    //                             }
    //                         ]
    //                     }
    //                     if (document.getElementById(`depthchart-charts`)) {
    //                         if (this.height !== document.getElementById(`depthchart-charts`).clientHeight
    //                             || this.width !== document.getElementById(`depthchart-charts`).clientWidth) {
    //                             this.myChart.resize();
    //                             this.height = document.getElementById(`depthchart-charts`).clientHeight;
    //                             this.width = document.getElementById(`depthchart-charts`).clientWidth;
    //                         }
    //                     }
    //                     this.myChart.setOption(option);
    //                     this.setState({
    //                         sellData, buyData
    //                     })
    //                 }

    //             }
    //         }
    //     })
    //     window._message.orderBookL2_deep_update = orderBookL2_deep_update;
    // };
    componentWillReceiveProps = throttle((nextProps) => {
        this.showChart(nextProps);
    }, 1000)
    showChart = (nextProps) => {
        if (nextProps.depthData.length > 0) {
            if (this.firstShow) {
                this.firstShow = false;
                this.myChart.on('globalout', (e) => {
                    let option = {
                        // xAxis:{
                        //     interval: 25,
                        //     axisLabel: {
                        //         show:true
                        //     }
                        // },
                        series: [{
                            id: "1234",
                            type: "line",
                            markLine: {
                                label: {
                                    show: false,
                                },
                                lineStyle: {
                                    opacity: 0
                                }
                            }
                        }
                        ]
                    };
                    this.myChart.setOption(option)
                })
            }
            let buyData = [];
            let sellData = [];
            let leftAll = 0;
            let rightAll = 0;
            if (nextProps.depthData.length > 0) {
                let indexNum = getCrossoverIndex(nextProps.depthData);
                let num = Math.min(indexNum, nextProps.depthData.length - indexNum);
                let xArr = [];
                let showLinePrice = '';
                let yArrBuy = [];
                let yArrSell = [];
                let midPrice = " ";
                for (let i = 0; i < num; i++) {
                    let right = nextProps.depthData[indexNum - 1 - i];
                    let left = nextProps.depthData[indexNum + i];
                    if (!!right && right.side === "Sell") {
                        rightAll += right.size;
                        right.all = rightAll;
                        sellData.unshift(right);
                        if(i === 0){
                            if(!!right && !!left){
                                midPrice = toLowPrice((left.price + right.price) / 2) + " "
                                xArr.push(midPrice);
                                yArrSell.push("");
                            }
                        }
                        xArr.push(right.price)
                        yArrSell.push(rightAll)
                        yArrSell.unshift('')
                    }
                    if (left && left.side === "Buy") {
                        if (i === 0) {
                            showLinePrice = left.price + '';
                        }
                        leftAll += left.size;
                        left.all = leftAll;
                        buyData.push(left);
                        xArr.unshift(left.price);
                        yArrBuy.unshift(leftAll)
                        yArrBuy.push('')
                    }
                }
                // if (buyData.length > 0 && sellData.length > 0) {
                    let option = {
                        xAxis: {
                            data: xArr
                        },
                        yAxis: [{
                            axisLine: { show: true },
                            axisTick: { show: true },
                        }],
                        series: [
                            {
                                data: yArrBuy,
                            },
                            {
                                data: yArrSell
                            }, {
                                name: '趋势线',
                                type: 'line',
                                markLine: {
                                    animation: false,
                                    silent: true,
                                    label: {
                                        show: false
                                    },
                                    symbol: "none",               //去掉警戒线最后面的箭头
                                    data: [
                                        {
                                            silent: true,             //鼠标悬停事件  true没有，false有
                                            label: {
                                                show: false        //将警示值放在哪个位置，三个值“start”,"middle","end"  开始  中点 结束
                                            },
                                            lineStyle: {               //警戒线的样式  ，虚实  颜色
                                                type: "solid",
                                                color: "#e6e6e6",
                                                // opacity: 0.5
                                            },
                                            xAxis: midPrice         // 警戒线的标注值，可以有多个yAxis,多条警示线   或者采用   {type : 'average', name: '平均值'}，type值有  max  min  average，分为最大，最小，平均值
                                        }]
                                    // [
                                    //     {
                                    //         name: '两个屏幕坐标之间的标线',
                                    //         x: "51.4%",
                                    //         y: "10%",
                                    //         lineStyle: {               //警戒线的样式  ，虚实  颜色
                                    //             type: "solid",
                                    //             color: "#e6e6e6",
                                    //             // opacity: 0.5
                                    //         },
                                    //     },
                                    //     {
                                    //         x: "51%",
                                    //         y: "94%"
                                    //     }
                                    // ]]
                                }
                            }
                        ]
                    }
                    if (document.getElementById(`depthchart-charts`)) {
                        if (this.height !== document.getElementById(`depthchart-charts`).clientHeight
                            || this.width !== document.getElementById(`depthchart-charts`).clientWidth) {
                                setTimeout(() => {
                                    this.myChart.resize();
                                }, 0);
                            this.height = document.getElementById(`depthchart-charts`).clientHeight;
                            this.width = document.getElementById(`depthchart-charts`).clientWidth;
                        }
                    }
                    // if(numberIndex !== 0){
                        try {
                            option.dataZoom = [{
                                startValue: buyData[buyData.length - numberIndex - 1].price.toString(),
                                endValue: sellData[numberIndex].price.toString()
                            }, {
                                startValue: 0,
                                endValue: Math.max(buyData[buyData.length - numberIndex - 1].all, sellData[numberIndex].all)
                            }]
                        } catch (error) {
                            // option.dataZoom = [{
                            //     startValue: buyData[buyData.length - numberIndex - 1].price.toString(),
                            //     endValue: sellData[numberIndex].price.toString()
                            // }, {
                            //     startValue: 0,
                            //     endValue: Math.max(buyData[buyData.length - numberIndex - 1].all, sellData[numberIndex].all)
                            // }]
                        }
                    // }
                    this.myChart.setOption(option);
                    this.setState({
                        sellData, buyData
                    })
                // }

            }
        }else{
            this.setState({
                sellData:[], buyData:[]
            })
        }
    }
    componentDidMount = () => {
        const { dispatch } = this.props;
        this.myChart = echarts.init(document.getElementById(`depthchart-charts`),null,{devicePixelRatio:2})
        this.myChart.setOption(option);
        this.resize = this.myChart.resize;
        dispatch({
            type: "orderList/save",
            payload: {
                myChart: this.myChart
            }
        })
        window.addEventListener("resize", this.resize);
        this.myChart.getZr().on('mousewheel',(e) => {
            const { depthData } = page.props;
            let indexNum = getCrossoverIndex(depthData);
            let num = Math.min(indexNum, depthData.length - indexNum);
            if(e.wheelDelta > 0){//向上滚
                numberIndex++;
                if (numberIndex > num - 2) {
                    numberIndex = num - 2;
                }
            }else{//向下滚
                numberIndex--;
                if (numberIndex < 0) {
                    numberIndex = 0;
                }
            }
            if(numberIndex < 0){
                numberIndex = 0;
            }
        })
        this.myChart.on('datazoom', (e) => {
            const { buyData, sellData } = page.state;
            try {
                let option = {
                    dataZoom: [{
                        startValue: buyData[buyData.length - numberIndex - 1].price.toString(),
                        endValue: sellData[numberIndex].price.toString()
                    }, {
                        startValue: 0,
                        endValue: Math.max(buyData[buyData.length - numberIndex - 1].all, sellData[numberIndex].all)
                    }]
                }
                page.myChart.setOption(option);
            } catch (error) {
                
            }
        })
        this.showChart(this.props)
    }
    componentWillUnmount = () => {
        try {
            if (page.timer) {
                clearTimeout(page.timer);
            }
            window.removeEventListener("resize", this.resize);
            
        } catch (error) {
            
        }
    }
    render() {
        return (
            <div className="depthchart" id="depthchart-charts"></div>
        )
    }
}

export default connect(({ recentTrade, loading, tradeHistory }) => {
    const { buyData, sellData } = recentTrade;
    const { depthData } = tradeHistory;
    return {
        buyData,
        sellData,
        depthData,
        loading: !!loading.effects["recentTrade/getDepth"]
    }
})(
    Index
)

