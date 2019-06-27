/* eslint-disable eqeqeq */
import React, { Component } from 'react'
// import Forker from "./worker/mian.worker.js";
import { webSocket, Tabs, Layout, Icon, language, screenfull, Spin, Input, Button, Tooltip, Menu, message } from "quant-ui";
import TotalRight from "./totalRight";
import RecentTrade from "./recentTrade";
import OrderList from "./orderList";
import OrderListSecond from "./orderListSecond";
import Kline from "./kline";
import Depthchart from "./depthchart";
import CommodityIndex from "./commodityIndex";
import Unlogin from "./unLogin";
import InstrumentMarket from "./instrumentMarket";
import ReConnect from './totalRight/addModal.js';
import UnTradeUser from './totalRight/unTradeUser.js';
import LeftSider from "./leftSider";
import { notificationShow, notificationError, getAuthKeyExpires, translationParameters, toLowPrice, notificationSuccess, setAllTradeLocalSetting, getLanguageKey } from '@/utils/utils'
import { connect } from 'dva';
import each from "lodash/each";
import groupBy from "lodash/groupBy";
import throttle from "lodash/throttle";
import GridContent from "../../components/GridContent/index.js";
import { getUserUserInfo } from '@/utils/authority';
// import PositionHave from "./userOrder/positionHave/index.js";
// import PositionClose from "./userOrder/positionClose/index.js";
import RenderTabs from "./renderTabs/index.js";
import PositionTabs from "./renderTabs/positionTabs.js";
import MenuItem from "./renderTabs/menuItem.js";
import MenuItemPos from "./renderTabs/menuItemPos.js";
import { getCrossoverIndex } from "@/utils/formula";
import { getOrdType, inMarket } from "@/utils/dictionary";
import { routerRedux } from 'dva/router';

let { getCurrentLanguage } = language;
const $ = language.getLanguageData;
const ordTypeArr = ["LimitIfTouched", "StopLimit"];
const ordTypeArrMarket = ["Stop", "MarketIfTouched"];
// const ordTypeArrStop = ["Stop", "LimitIfTouched", "StopLimit", "MarketIfTouched"];
const {
    Sider, Content,
} = Layout;
let page = null;
// function stringToHex(str) {
//     var val = "";
//     for (var i = 0; i < str.length; i++) {
//         if (val == "")
//             val = str.charCodeAt(i).toString(16);
//         else
//             val += str.charCodeAt(i).toString(16);
//     }
//     return val;
// }
window._message = {};
let setinterTime = null;

class Index extends Component {
    constructor(props) {
        super(props);
        this.ws = null;
        this.state = {
            renderSecond: false,
            height: window.localStorage.getItem("recent_data_height_second") || 14,
        }
        page = this;
        this.webSocketStatus = false;
        this.instrumentData = [];//所有合约信息
        this.instrument = {};//当前合约
        this.instrumentArr = {};//合约symbol对应index
        this.symbolCurrent = "XBTUSD";
        this.firstRender = true;
        this.orderID = "";
        this.clOrdID = "";
        this.orderDataSave = [];//委托列表数据缓存
        this.positionDataSave = [];//持仓数据缓存
        this.recentTradeData = [];//近期交易数据缓存
        this.orderListDataSave = [];//委托数据缓存
        this.orderListDataHIsSave = [];//委托历史数据缓存
        this.tradeListDataSave = [];//已成交数据缓存
        this.tradingViewStream = false; // 是否开启tradingView推送
    }
    // componentWillUnmount = () => {
    //     if (!!window._worker) {
    //         window._worker.terminate()
    //         window._worker = null;
    //         window._message = {};
    //     }

    // }

    componentWillMount = () => {
        let authority = localStorage.getItem('antd-pro-authority');
        if (authority === 'admin') {
            const { dispatch } = this.props;
            dispatch({
                type: "orderList/tradeListGet",
                payload: {
                    count: 200,
                    reverse: true
                }
            })
            dispatch({
                type: "orderList/orderListHisGet",
                payload: {
                    count: 200,
                    reverse: true
                }
            })
        }
        // window._worker = new window.Worker("/worker.js");
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.props.symbolCurrent !== nextProps.symbolCurrent) {
            return true;
        }
        if (this.props.moveRight !== nextProps.moveRight) {
            return true;
        }
        if (this.props.hideSlider !== nextProps.hideSlider) {
            return true;
        }
        if (this.props.depth !== nextProps.depth) {
            return true;
        }
        if (this.state.renderSecond !== nextState.renderSecond) {
            this.orderBookL2UpdateAllForce(nextProps.depth);
            return true;
        }
        if (this.props.orderListData.length !== nextProps.orderListData.length) {
            return true;
        }
        return false;
    }
    onLayoutChangeSecond = (height) => {
        this.orderBookL2UpdateAll()
    }
    onLayoutChangeOrder = (height) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/save",
            payload: {
                orderHeight: height
            }
        })
    }
    // componentWillMount = () => {
    //     const { dispatch, publickKeyResponse } = this.props;
    //     if (publickKeyResponse === "" || !publickKeyResponse) {
    //         dispatch({
    //             type: "login/getUserSysApiKey",
    //         })
    //     }
    // }
    componentWillReceiveProps = (nextProps) => {
        if (nextProps.tradeListDataReturn) {
            this.tradeListDataSave = nextProps.tradeListData;
        }
        if (nextProps.orderListReturn) {
            this.orderListDataSave = nextProps.orderListData;
        }
        if (nextProps.orderListHisDataReturn) {
            this.orderListDataHIsSave = nextProps.orderListHisData;
        }
        if (this.props.depth !== nextProps.depth) {
            this.orderBookL2UpdateAllForce(nextProps.depth);
        }
        // if (nextProps.publickKeyResponse !== "" && this.firstRender) {//测试用,后面放开
        if (this.firstRender) {
            let authority = localStorage.getItem('antd-pro-authority');
            if (authority === "admin") {
                if (this.webSocketStatus) {
                    // let { API_KEY, expires, signature } = getAuthKeyExpires({ ENDPOINT: '/realtime' });//bitmex
                    if (setinterTime === null) {
                        setinterTime = setInterval(() => {
                            let { API_KEY, expires, signature } = getAuthKeyExpires();
                            if (API_KEY) {
                                this.ws.send(JSON.stringify({ op: "authKeyExpires", args: [API_KEY, expires, signature] }));
                                this.ws.send(JSON.stringify({
                                    op: "subscribe", args: [
                                        "order:XBTUSD",
                                        "execution",
                                        "position",
                                        "margin",
                                    ]
                                }));
                                clearInterval(setinterTime);
                                setinterTime = null;
                            }
                        }, 200);
                    }
                    this.firstRender = false;
                }
            }
        }
        this.symbolCurrent = nextProps.symbolCurrent;
        this.instrument = nextProps.instrumentData;
    }
    instrumentUpdate = (data) => {
        let instrumentData = this.instrumentData;
        let index = this.instrumentArr[data.symbol];
        if (!!instrumentData) {
            instrumentData[index] = { ...instrumentData[index], ...data };
            this.instrumentData = instrumentData;
            if (data.symbol === this.symbolCurrent) {
                // debugger
                // let icon = this.instrument.lastTickDirection;
                // if (icon === '') {
                //     if (this.instrument.lastPrice > data.lastPrice) {
                //         icon = "arrow-down";
                //     } else if (this.instrument.lastPrice < data.lastPrice) {
                //         icon = "arrow-up";
                //     }
                // }
                this.instrument = { ...this.instrument, ...data }
                // this.instrument.icon = icon;
            }
        }
    }
    throttleInstrument = throttle((instrumentData, instrument) => {
        const { dispatch } = this.props;
        dispatch({
            type: "instrument/instrumentupdate",
            payload: {
                dataSource: instrumentData,
                instrumentData: instrument
            }
        })
    }, 250);
    screenfullChange = () => {
        screenfull.on('change', (a, b, c, d) => {
            console.log("----", a.target.dataset)
            console.log('是否全屏?', screenfull.isFullscreen ? 'Yes' : 'No');
        });
    }
    showAlert = (orderCancel, showText, leavesQty) => {//订单取消提示框
        let text = <div>
            <div>{translationParameters([orderCancel.side === "Buy" ? $("买入") : $("卖出"), leavesQty || orderCancel.orderQty, orderCancel.symbol, inMarket(orderCancel.ordType) ? $('市价') : orderCancel.price], $('合约下单提交提示'))}</div>
            <div>{showText}</div>
        </div>
        let textPrice = orderCancel.execInst === "IndexPrice" ? $("指数价格") : (orderCancel.execInst === "LastPrice" ? $("最新成交价") : $("标记价格"))
        let bigOrsmall = $("以下");
        if (orderCancel.side === "Buy" && (orderCancel.ordType === "Stop" || orderCancel.ordType === "StopLimit")) {
            bigOrsmall = $("以上");
        }
        if (orderCancel.side === "Sell" && (orderCancel.ordType === "MarketIfTouched" || orderCancel.ordType === "LimitIfTouched")) {
            bigOrsmall = $("以上");
        }
        if (ordTypeArrMarket.indexOf(orderCancel.ordType) !== -1) {
            text = <div>
                <div>{translationParameters([orderCancel.side === "Buy" ? $("买入") : $("卖出"), leavesQty || orderCancel.orderQty, orderCancel.symbol, $('市价')], $('合约下单提交提示'))}</div>
                <div>{translationParameters([textPrice, orderCancel.stopPx, bigOrsmall], $('触发价格: xx @ xx 及 xx'))}</div>
                <div>{showText}</div>
            </div>
        }
        if (ordTypeArr.indexOf(orderCancel.ordType) !== -1) {
            text = <div>
                <div>{translationParameters([orderCancel.side === "Buy" ? $("买入") : $("卖出"), leavesQty || orderCancel.orderQty, orderCancel.symbol, orderCancel.price], $('合约下单提交提示'))}</div>
                <div>{translationParameters([textPrice, orderCancel.stopPx, bigOrsmall], $('触发价格: xx @ xx 及 xx'))}</div>
                <div>{showText}</div>
            </div>
        }
        return text;
    }
    //后面要放开这个代码

    componentDidMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "register/save",
            payload: { refsText: this.refs.gridContentRefs }
        })
        // let symbol = match.params.symbol || "XBTUSD";
        // dispatch({
        //     type: "instrument/save",
        //     payload: { symbolCurrent: symbol }
        // })
        // let { API_KEY, expires, signature } = getAuthKeyExpires({ ENDPOINT: '/realtime' });
        // window._worker.postMessage({
        //     method: "open", data: {
        //         API_KEY: API_KEY,
        //         expires: expires,
        //         signature: signature,
        //         symbol: symbol
        //     }
        // })
        // window._worker.onmessage = function (e) {
        //     if (e.data.length !== undefined) {//这个判断有问题 引的这个方法吗 
        //         e.data.forEach(({ method, data }) => {
        //             if (typeof window._message[method] == "object") {
        //                 window._message[method].forEach((item) => {
        //                     item(data)
        //                 })
        //                 //不要动他
        //             }
        //         })
        //     } else {
        //         const { method, data } = e.data
        //         if (typeof window._message[method] == "object") {
        //             window._message[method].forEach((item) => {
        //                 item(data)
        //             })
        //             //不要动他
        //         }
        //     }
        // }
        // let trade = window._message.trade || [];
        // trade.push((data) => {
        //     const { dispatch } = this.props;
        //     dispatch({
        //         type: "recentTrade/insert",
        //         payload: {
        //             dataSource: data
        //         }
        //     })
        // });
        // window._message.trade = trade;
        // let instrumentSave = window._message.instrumentSave || [];
        // instrumentSave.push((data) => {
        //     const { dispatch } = this.props;
        //     dispatch({
        //         type: "instrument/instrumentSave",
        //         payload: {
        //             dataSource: data
        //         }
        //     })
        // });
        // window._message.instrumentSave = instrumentSave;
        window.addEventListener("message", (e) => this.onTVMessage(e));
        this.componentIsLogin()
    }
    onTVMessage(e) {
        if (e.data && e.data.id === "tradingView") {
            if (e.origin === window.location.origin) {
                let n = e.data.data;
                if (n.event === "addStream") {
                    this.tradingViewStream = true;
                } else if (n.event === "endStream") {
                    this.tradingViewStream = false;
                }
            }
        }
    }
    getReferenceSymbol(symbol) {
        let referenceSymbol = "";
        let instrumentSymbolData = this.instrumentData.filter(item => item.symbol === symbol);
        if (instrumentSymbolData.length > 0) {
            referenceSymbol = instrumentSymbolData[0].referenceSymbol;
        }
        return referenceSymbol;
    }
    updateTrades(trade) {
        let t = this;
        let groupTrade = groupBy(trade, "symbol");
        each(groupTrade, (value, key) => {
            t._sendMessage({
                cmd: "addTrades",
                data: JSON.parse(JSON.stringify(value)),
                symbol: key
            })
        })
    }
    _sendMessage(data) {
        window.postMessage(data, window.location.origin);
    }
    componentIsLogin = () => {
        let key = getLanguageKey(getCurrentLanguage());
        const { dispatch, match } = this.props;
        let symbol = match.params.symbol || "XBTUSD";
        dispatch({
            type: "instrument/save",
            payload: { symbolCurrent: symbol }
        })
        // if (process.env.NODE_ENV === 'development') {//开发环境
        //     this.ws = new webSocket("ws://192.168.100.113:9988", null, { breatheParams: "ping", reconnectInterval: 600000, timeoutInterval: 10000, debugger: false });
        // } else {//部署环境
        //     this.ws = new webSocket("ws://192.168.100.113:9988", null, { breatheParams: "ping", reconnectInterval: 600000, timeoutInterval: 10000, debugger: false });
        // }
        if (process.env.NODE_ENV === 'development') {//开发环境
            this.ws = new webSocket("ws://192.168.100.113:9988", null, { breatheParams: "ping", reconnectInterval: 10000, timeoutInterval: 10000, debugger: false });
        } else {//部署环境
            // this.ws = new webSocket("ws://192.168.100.113:9988", null, { breatheParams: "ping", reconnectInterval: 600000, timeoutInterval: 10000, debugger: false });
            var ws_url = "ws://192.168.100.113:9988"
            if (document.location.host.startsWith("192.168.100.113")) {
                ws_url = "ws://192.168.100.113:9988"
            } else {
                var ws_proto = document.location.protocol === "https:" ? "wss:" : "ws:"
                ws_url = ws_proto + "//" + document.location.host + "/realtime"
            }
            this.ws = new webSocket(ws_url, null, { breatheParams: "ping", reconnectInterval: 10000, timeoutInterval: 10000, debugger: false });
        }
        // this.ws = new webSocket("wss://testnet.bitmex.com/realtime", null, { breatheParams: "ping", reconnectInterval: 600000, timeoutInterval: 10000, debugger: false });
        this.ws.onopen = (evt) => {
            this.firstRender = true;
            this.webSocketStatus = true;
            dispatch({
                type: "instrument/save",
                payload: { webSocket: this.ws }
            })
            // let { API_KEY, expires, signature } = getAuthKeyExpires({ ENDPOINT: '/realtime' });//bitmex
            // let { API_KEY, expires, signature } = getAuthKeyExpires();
            // this.ws.send(JSON.stringify({ op: "authKeyExpires", args: [API_KEY, expires, signature] }));
            this.ws.send(JSON.stringify({
                op: "subscribe", args: [
                    "orderBookL2:" + symbol,
                    "trade:" + symbol,
                    "instrument:" + symbol,
                    "liquidation:" + symbol,
                    "announcement_" + key,
                ]
            }));
        };
        this.ws.onmessage = ({ data }) => {
            const { showReConecting } = page.props;
            if (showReConecting === true) {
                dispatch({
                    type: "login/save",
                    payload: {
                        showReConecting: false,
                    }
                })
            }
            if (data !== "pong") {
                let res = {};
                try {
                    res = JSON.parse(data)
                } catch (error) {

                }
                if (res.table === "orderBookL2_25") {
                    if (res.action === "partial") {
                        window.localStorage.setItem("recent_data_height_L", JSON.stringify(res.data.length))
                        dispatch({
                            type: "recentTrade/partial",
                            payload: {
                                depthData: res.data
                            }
                        })
                    }
                    if (res.action === "update") {
                        dispatch({
                            type: "recentTrade/update",
                            payload: {
                                updataData: res.data
                            }
                        })
                    }
                    if (res.action === "delete") {
                        dispatch({
                            type: "recentTrade/delete",
                            payload: {
                                deleteData: res.data
                            }
                        })
                    }
                    if (res.action === "insert") {
                        dispatch({
                            type: "recentTrade/orderBookInsert",
                            payload: {
                                insertData: res.data
                            }
                        })
                    }
                } else if (res.table === "orderBookL2") {
                    if (res.action === "partial") {
                        window.localStorage.setItem("recent_data_height_L", JSON.stringify(res.data.length))
                        page.orderDataSave = res.data;
                        page.orderBookL2UpdateAll()
                    }
                    if (res.action === "update") {
                        page.orderBookL2Update(res.data)
                        page.orderBookL2UpdateAll()
                    }
                    if (res.action === "delete") {
                        page.orderBookL2Delete(res.data)
                        page.orderBookL2UpdateAll()
                    }
                    if (res.action === "insert") {
                        page.orderBookL2Insert(res.data)
                        page.orderBookL2UpdateAll()
                    }
                }
                else if (res.table === "trade") {
                    if (res.action === "partial") {
                        page.saveTradeFunction(res.data);
                        // dispatch({
                        //     type: "recentTrade/save",
                        //     payload: {
                        //         dataSource: res.data
                        //     }
                        // })
                    }
                    if (res.action === "insert") {
                        page.recentTradeInsert(res.data)
                        page.recentTradeInsertSet()
                        if (page.tradingViewStream === true) {
                            page.updateTrades(res.data);
                        }
                    }
                } else if (res.table === "instrument") {
                    if (res.action === "partial") {
                        page.instrumentData = res.data;
                        for (let index = 0; index < res.data.length; index++) {
                            page.instrumentArr[res.data[index].symbol] = index;
                        }
                        dispatch({
                            type: "instrument/instrumentSave",
                            payload: {
                                dataSource: res.data
                            }
                        })
                    }
                    //卡
                    if (res.action === "update") {
                        page.instrumentUpdate(res.data[0]);
                        page.throttleInstrument(page.instrumentData, page.instrument);
                        if (page.tradingViewStream === true) {
                            let instrumentData = res.data[0];
                            if (instrumentData.indicativeSettlePrice) {
                                let referenceSymbol = page.getReferenceSymbol(instrumentData.symbol);
                                page.updateTrades([{
                                    timestamp: instrumentData.timestamp,
                                    price: instrumentData.indicativeSettlePrice,
                                    symbol: referenceSymbol,
                                }]);
                            }
                        }
                        // dispatch({
                        //     type: "instrument/instrumentupdate",
                        //     payload: {
                        //         instrumentData: res.data[0]
                        //     }
                        // })
                    }
                }
                else if (res.table === "order") {
                    if (res.action === "partial") {
                        if (Array.isArray(res.data)) {
                            page.orderListDataSave = res.data;
                            dispatch({
                                type: "orderList/save",
                                payload: {
                                    orderListData: res.data
                                }
                            })
                        } else {
                            message.error($('order推送数据发送错误'));
                        }
                    }
                    if (res.action === "update") {
                        // let obj = res.data[0];
                        if (Array.isArray(res.data)) {
                            for (let obj of res.data) {
                                const { orderListData } = page.props;
                                let orderCancel = orderListData.find(item => item.orderID === obj.orderID);
                                if (obj.text.indexOf('Amended') !== -1) {
                                    try {
                                        if (orderCancel.symbol && obj.ordRejReason === '') {
                                            let text = translationParameters([orderCancel.symbol, $('委托价格'), orderCancel.price, obj.price], $('合约改单提示'));
                                            if (obj.text.indexOf('orderQty') !== -1) {
                                                let direction = 1;
                                                if (obj.side === "Sell") {
                                                    direction = -1;
                                                }
                                                text = translationParameters([orderCancel.symbol, $('数量'), orderCancel.orderQty * direction, obj.orderQty * direction], $('合约改单提示'));
                                            } else if (obj.text.indexOf('price') === -1) {
                                                text = translationParameters([orderCancel.symbol, $('触发价格'), orderCancel.stopPx, obj.stopPx], $('合约改单提示'));
                                            }
                                            notificationSuccess($("委托 已修改"), "edit", "orderList-notification-success", "#316e44", text, obj.orderID);
                                        }else if(obj.ordRejReason !== ''){
                                            notificationError($("改单 失败"), obj.ordRejReason, "close-circle", obj.orderID);
                                        } else {
                                            let text = $("无法提交委托") + ": " + (obj.ordRejReason || $("委托提交错误。"));
                                            notificationError($("委托提交错误。"), text, "close-circle", obj.orderID);
                                        }
                                    } catch (error) {
                                    }
                                } else if (obj.ordStatus === "Rejected" || obj.ordRejReason !== '') {
                                    notificationError($("委托 已拒绝"), obj.ordRejReason, "warning",obj.orderID);
                                } else if (obj.ordStatus === "Canceled") {
                                    let showText = this.showAlert(orderCancel || obj, obj.text, obj.leavesQty || obj.orderQty);
                                    notificationShow(obj, $("委托 已取消"), "minus-circle", "orderList-notification", "#7ca2bd", showText);
                                } else if (obj.execInst === 'Close') {
                                    let side = obj.side === 'Sell' ? $("卖出") : $("买入");
                                    let text = translationParameters([$('市价'), side, obj.symbol, Math.abs(obj.orderQty)], $('合约平仓提示'))
                                    if (obj.ordType === "Limit") {
                                        text = translationParameters([obj.price, side, obj.symbol, Math.abs(obj.orderQty)], $('合约平仓提示'))
                                    }
                                    notificationShow(obj, $("委托 已提交"), "check-square", "orderList-notification", "#7ca2bd", text);
                                } else if (obj.ordStatus === "New") {
                                     if (obj.triggered === "StopOrderTriggered") {
                                        const { orderListData, instrumentData } = page.props;
                                        let orderCancel = orderListData.find(item => item.orderID === obj.orderID);
                                        let calculatePrice = instrumentData.lastPrice;
                                        if (orderCancel.execInst.indexOf("LastPrice") !== -1) {
                                            calculatePrice = instrumentData.lastPrice;
                                        } else if (orderCancel.execInst.indexOf("IndexPrice") !== -1) {
                                            calculatePrice = toLowPrice(instrumentData.indicativeSettlePrice);
                                        } else {
                                            calculatePrice = toLowPrice(instrumentData.markPrice);
                                        }
                                        let text = translationParameters([calculatePrice, orderCancel.orderQty, orderCancel.symbol, orderCancel.side === "Buy" ? $("买入") : $("卖出"), getOrdType(orderCancel.ordType)], $('已触发提示信息'))
                                        notificationSuccess($("委托 已触发"), "check-square", "orderList-notification-success", "#316e44", text, obj.orderID);
                                    } else if (obj.ordType === "Market") {
                                        let text = translationParameters([obj.side === "Buy" ? $("买入") : $("卖出"), obj.orderQty, obj.symbol, $('市价')], $('合约下单提交提示'))
                                        notificationShow(obj, $("委托 已提交"), "check-square", "orderList-notification", "#7ca2bd", text);
                                    } else if (obj.ordType === "Limit") {
                                        let text = translationParameters([obj.side === "Buy" ? $("买入") : $("卖出"), obj.orderQty, obj.symbol, obj.price], $('合约下单提交提示'))
                                        notificationShow(obj, $("委托 已提交"), "check-square", "orderList-notification", "#7ca2bd", text);
                                    }
                                    else {
                                        let showText = this.showAlert(obj, obj.text);
                                        notificationShow(obj, $("委托 已提交"), "minus-circle", "orderList-notification", "#7ca2bd", showText);
                                    }
                                }else if(obj.ordStatus === "Filled"){
                                    if (obj.triggered === "StopOrderTriggered") {
                                        const { orderListData, instrumentData } = page.props;
                                        let orderCancel = orderListData.find(item => item.orderID === obj.orderID);
                                        let calculatePrice = instrumentData.lastPrice;
                                        if (orderCancel.execInst && orderCancel.execInst.indexOf("LastPrice") !== -1) {
                                            calculatePrice = instrumentData.lastPrice;
                                        } else if (orderCancel.execInst && orderCancel.execInst.indexOf("IndexPrice") !== -1) {
                                            calculatePrice = toLowPrice(instrumentData.indicativeSettlePrice);
                                        } else {
                                            calculatePrice = toLowPrice(instrumentData.markPrice);
                                        }
                                        let text = translationParameters([calculatePrice, orderCancel.orderQty, orderCancel.symbol, orderCancel.side === "Buy" ? $("买入") : $("卖出"), getOrdType(orderCancel.ordType)], $('已触发提示信息'))
                                        notificationSuccess($("止损 已触发"), "check-square", "orderList-notification-success", "#316e44", text, obj.orderID);
                                    }
                                }
                                page.orderListDataSaveUpdate(obj)

                            }
                        } else {
                            message.error($('order推送数据发送错误'));
                        }
                    }
                    if (res.action === "insert") {
                        if (Array.isArray(res.data)) {
                            let obj = res.data[0];
                            if (obj.ordStatus === "Canceled") {
                                const { orderListData } = page.props;
                                let orderCancel = orderListData.find(item => item.orderID === obj.orderID);
                                let showText = this.showAlert(orderCancel, obj.text);
                                notificationShow(orderCancel, $("委托 已取消"), "minus-circle", "orderList-notification", "#7ca2bd", showText);
                            } else if (obj.ordStatus === "New") {
                                if (obj.execInst === "Close") {
                                    // let text = `在 市价 的价格 ${orderListData.side === "Buy" ? "买" : "卖"} 方法平仓 ${orderListData.symbol} 的 ${orderListData.orderQty} 张 合约.`
                                    // if (orderListData.ordType === "Limit") {
                                    //     text = `在 ${orderListData.price} 的价格 ${orderListData.side === "Buy" ? "买" : "卖"} 方法平仓 ${orderListData.symbol} 的 ${orderListData.orderQty} 张 合约.`
                                    // }
                                    // notificationShow(orderListData, "已提交", "check-square", "orderList-notification", "#7ca2bd", text);
                                }
                                else if (obj.ordType === "Market") {
                                    let text = `在 市价 的价格 ${obj.side === "Buy" ? "买入 " : "卖出 "}${obj.orderQty} 张 ${obj.symbol} 合约.`
                                    notificationShow(obj, "已提交", "check-square", "orderList-notification", "#7ca2bd", text);
                                } else if (obj.ordType === "Limit") {
                                    let text = `在 ${obj.price} 的价格 ${obj.side === "Buy" ? "买入 " : "卖出 "}${obj.orderQty} 张 ${obj.symbol} 合约.`
                                    notificationShow(obj, "委托 已提交", "check-square", "orderList-notification", "#7ca2bd", text);
                                } else {
                                    let showText = this.showAlert(obj, obj.text);
                                    notificationShow(obj, $("委托 已提交"), "minus-circle", "orderList-notification", "#7ca2bd", showText);
                                }
                            } else if (obj.ordStatus === "Rejected") {
                                notificationError($("委托 已拒绝"), obj.ordRejReason, "warning", obj.orderID);
                            }
                            dispatch({
                                type: "orderList/orderListInsert",
                                payload: {
                                    orderListData: res.data[0]
                                }
                            })
                        } else {
                            message.error($('order推送数据发送错误'));
                        }
                    }
                }
                else if (res.table === "execution") {
                    if (res.action === "update") {
                        if (Array.isArray(res.data)) {
                            page.tradeListUpdateTime(res.data)
                            // dispatch({
                            //     type: "orderList/tradeListUpdate",
                            //     payload: {
                            //         tradeListData: res.data
                            //     }
                            // })
                        } else {
                            message.error($('execution推送数据发送错误'));
                        }
                    }
                    if (res.action === "insert") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "orderList/tradeListInsert",
                                payload: {
                                    tradeListData: res.data
                                }
                            })
                        } else {
                            message.error($('execution推送数据发送错误'));
                        }
                    }
                }
                else if (res.table === "margin") {
                    if (res.action === "partial") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "margin/save",
                                payload: {
                                    dataSource: res.data[0] || {}
                                }
                            })
                        } else {
                            message.error($('margin推送数据发送错误'));
                        }
                    }
                    if (res.action === "update") {
                        if (Array.isArray(res.data)) {
                            page.marginDataUpdate(res.data[0])
                        } else {
                            message.error($('margin推送数据发送错误'));
                        }
                    }
                }
                else if (res.table === "position") {
                    if (res.action === "partial") {
                        if (Array.isArray(res.data)) {
                            // dispatch({
                            //     type: "orderList/save",
                            //     payload: {
                            //         positionHavaListData: res.data
                            //     }
                            // })
                            page.positionDataSave = res.data;
                            page.updatePositionForce(res.data, true)
                        } else {
                            message.error($('position推送数据发送错误'));
                        }
                    }
                    if (res.action === "update") {
                        if (Array.isArray(res.data)) {
                            page.updatePositionForce(res.data, false);
                        } else {
                            message.error($('position推送数据发送错误'));
                        }
                    }
                }
                else if (res.table === "liquidation") {
                    if (res.action === "partial") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "recentTrade/save",
                                payload: {
                                    liquidation: res.data
                                }
                            })
                        } else {
                            message.error($('liquidation推送数据发送错误'));
                        }
                    }
                    if (res.action === "insert") {
                        if (Array.isArray(res.data)) {
                            let obj = res.data[0];
                            let title = translationParameters([obj.symbol, $('空仓')], $('强制平仓提示标题'));
                            if (obj.side === "Sell") {
                                title = translationParameters([obj.symbol, $('多仓')], $('强制平仓提示标题'));
                            }
                            let text = obj.side + " " + obj.leavesQty + " 张合约 @ " + obj.price;
                            notificationShow(obj, title, "check-square", "orderList-notification", "#7ca2bd", text);
                            dispatch({
                                type: "recentTrade/insertL",
                                payload: {
                                    liquidation: res.data
                                }
                            })
                        } else {
                            message.error($('liquidation推送数据发送错误'));
                        }
                    }
                    if (res.action === "update") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "recentTrade/updateL",
                                payload: {
                                    liquidation: res.data
                                }
                            })
                        } else {
                            message.error($('liquidation推送数据发送错误'));
                        }
                    }
                    if (res.action === "delete") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "recentTrade/deleteL",
                                payload: {
                                    liquidation: res.data
                                }
                            })
                        } else {
                            message.error($('liquidation推送数据发送错误'));
                        }
                    }
                } else if (res.table === "announcement") {
                    if (res.action === "partial") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "accountInfo/save",
                                payload: {
                                    announcementData: res.data
                                }
                            })
                        } else {
                            message.error($('annoucement推送数据发送错误'));
                        }
                    }
                    if (res.action === "update") {
                        if (Array.isArray(res.data)) {
                            dispatch({
                                type: "accountInfo/save",
                                payload: {
                                    announcementData: res.data
                                }
                            })
                        } else {
                            message.error($('annoucement推送数据发送错误'));
                        }
                    }
                }
            }

        };
        this.ws.onclose = function (evt) {
            page.firstRender = true;
            page.webSocketStatus = false;
        };
        this.ws.onerror = function () {
            page.firstRender = true;
            page.webSocketStatus = false;
        }
        this.ws.onconnecting = () => {
            const { dispatch } = page.props;
            dispatch({
                type: "login/save",
                payload: {
                    showReConecting: true,
                }
            })
            page.firstRender = true;
            page.webSocketStatus = false;
        }
    }
    saveTradeFunction = (data) => {
        let { symbolCurrent, dispatch } = this.props; //查询条件
        if (data.length > 0) {
            if (data[0].symbol === symbolCurrent) {
                data.forEach((ele, index, arr) => {
                    ele.icon = '';
                    if (ele.tickDirection === 'PlusTick') {
                        ele.icon = 'arrow-up';
                    } else if (ele.tickDirection === 'MinusTick') {
                        ele.icon = 'arrow-down';
                    }
                });
                dispatch({
                    type: "recentTrade/saveTrade",
                    payload: {
                        dataSource:data
                    }
                })
            }
        } else {
            dispatch({
                type: "recentTrade/saveTrade",
                payload: {
                    dataSource:[]
                }
            })
        }
    }
    orderBookL2Update = (data) => {
        for (let value of data) {
            this.orderDataSave.map((item) => {
                if (item.id === value.id) {
                    item.size = value.size;
                }
                return item;
            })
        }
    }
    orderBookL2Insert = (data) => {
        for (let value of data) {
            let index = this.orderDataSave.findIndex((item) => {
                return item.price < value.price;
            })
            // if (index !== -1 || this.orderDataSave.length === 0)
            if (index === -1) {
                this.orderDataSave.splice(this.orderDataSave.length, 0, value);
            } else {
                this.orderDataSave.splice(index, 0, value);
            }
        }
    }
    orderBookL2Delete = (data) => {
        let idArr = [];
        for (let value of data) {
            idArr.push(value.id);
        }
        this.orderDataSave = this.orderDataSave.filter(item => idArr.indexOf(item.id) === -1);
    }
    orderBookL2UpdateAllForce = (nextDepth) => {
        const { dispatch } = this.props;
        let { depth } = this.props;
        if (nextDepth) {
            depth = nextDepth;
        }
        let sellData = [];
        let buyData = [];
        let leftAll = 0;
        let rightAll = 0;
        let left = {};
        let right = {};
        let maxWidth = 1; //档位中最大的数量
        if (this.orderDataSave.length > 0) {
            let index = getCrossoverIndex(this.orderDataSave) - 1;
            if (depth == 0.5) {
                let height = window.localStorage.getItem("recent_data_height_second");
                for (let i = 0; i < height; i++) {
                    right = { ...this.orderDataSave[index - i] };
                    left = { ...this.orderDataSave[index + i + 1] };
                    if (!!right && right.side === "Sell") {
                        rightAll += right.size;
                        right.all = rightAll;
                        sellData.unshift(right);
                    }
                    if (left && left.side === "Buy") {
                        leftAll += left.size;
                        left.all = leftAll;
                        buyData.push(left)
                    }
                }
            } else {
                try {
                    index = index + 1;
                    let leftPrice = this.orderDataSave[index].price - this.orderDataSave[index].price % depth;
                    let rightPrice = 0;
                    if (this.orderDataSave[index - 1]) {
                        rightPrice = this.orderDataSave[index - 1].price + depth - this.orderDataSave[index - 1].price % depth;
                        if (this.orderDataSave[index - 1].price % depth === 0) {
                            rightPrice = this.orderDataSave[index - 1].price;
                        }
                    }
                    let numberL = 0;
                    let numberR = 0;
                    let height = window.localStorage.getItem("recent_data_height_second");
                    for (var i = 0; i < height; i++) {
                        left = { ...this.orderDataSave[index + numberL] };
                        right = { ...this.orderDataSave[index - 1 - numberR] };
                        numberR++;
                        numberL++;
                        while (left.price > leftPrice) {
                            if (index + numberL < this.orderDataSave.length) {
                                let _left = { ...this.orderDataSave[index + numberL] };
                                if (!_left.price) {
                                    break;
                                }
                                if (_left.price % depth === 0 && _left.price !== leftPrice) {
                                    break;
                                }
                                if (_left.price < leftPrice) {
                                    break;
                                }
                                left.size += _left.size;
                                left.price = _left.price;
                                numberL++;
                            } else {
                                break;
                            }
                        }
                        while (right.price < rightPrice) {
                            if (1 + numberR < this.orderDataSave.length) {
                                let _right = { ...this.orderDataSave[index - 1 - numberR] };
                                if (!_right.price) {
                                    break;
                                }
                                if (_right.price % depth === 0 && _right.price !== rightPrice) {
                                    break;
                                }
                                if (_right.price > rightPrice) {
                                    break;
                                }
                                right.size += _right.size;
                                right.price = _right.price;
                                numberR++;
                            } else {
                                break;
                            }
                        }
                        if (!!left && left.side === "Buy") {
                            // left.id = left.id + "depth";
                            left.price = leftPrice;
                            leftAll += left.size;
                            left.all = leftAll;
                            buyData.push(left)
                            if (this.orderDataSave[index + numberL]) {
                                let newPrice = left.price - this.orderDataSave[index + numberL].price;
                                if (newPrice !== 0.5) {
                                    if (this.orderDataSave[index + numberL].price % depth === 0) {
                                        leftPrice = this.orderDataSave[index + numberL].price;
                                    } else {
                                        leftPrice = this.orderDataSave[index + numberL].price - this.orderDataSave[index + numberL].price % depth;
                                    }
                                } else {
                                    leftPrice = leftPrice - depth;
                                }
                            } else {
                                leftPrice = leftPrice - depth;
                            }
                        }
                        if (!!right && right.side === "Sell") {
                            // right.id = right.id + "depth";
                            right.price = rightPrice;
                            rightAll += right.size;
                            right.all = rightAll;
                            sellData.unshift(right);
                            if (this.orderDataSave[index - 1 - numberR]) {
                                let newRightPrice = this.orderDataSave[index - 1 - numberR].price - right.price;
                                if (newRightPrice !== 0.5) {
                                    if (this.orderDataSave[index - 1 - numberR].price % depth === 0) {
                                        rightPrice = this.orderDataSave[index - 1 - numberR].price;
                                    } else {
                                        rightPrice = this.orderDataSave[index - 1 - numberR].price + depth - this.orderDataSave[index - 1 - numberR].price % depth;
                                    }
                                } else {
                                    rightPrice = rightPrice + depth;
                                }
                            } else {
                                rightPrice = rightPrice + depth;
                            }
                        }
                    }
                } catch (error) {

                }
            }
            if (buyData.length > 0 && sellData.length > 0) {
                maxWidth = Math.max(buyData[buyData.length - 1].all, sellData[0].all);
            } else if (sellData.length > 0) {
                maxWidth = sellData[0].all;
            } else if((buyData.length > 0)) {
                maxWidth = buyData[buyData.length - 1].all;
            }
            dispatch({
                type: "recentTrade/upDateAll",
                payload: {
                    sellData: sellData,
                    buyData: buyData,
                    maxWidth: maxWidth
                }
            })
        } else {
            dispatch({
                type: "recentTrade/upDateAll",
                payload: {
                    sellData: [],
                    buyData: [],
                    maxWidth: 0
                }
            })
        }
    }
    orderBookL2UpdateAll = throttle(() => {
        this.orderBookL2UpdateAllForce();
        this.orderBookL2DepthData()
    }, 250);
    recentTradeInsert = (data) => {
        if (Array.isArray(data)) {
            if (data.length >= 1) {
                // data = data.sort((a, b) => {
                //     if (a.timestamp < b.timestamp) {
                //         return 1;
                //     } else {
                //         return -1;
                //     }
                // })
                data.reverse();
                data.forEach((ele) => {
                    ele.anite = "light";
                    if (ele.tickDirection === 'PlusTick') {
                        ele.icon = 'arrow-up';
                    } else if (ele.tickDirection === 'MinusTick') {
                        ele.icon = 'arrow-down';
                    }
                })
                this.recentTradeData = data.concat(this.recentTradeData);
                if (this.recentTradeData > 200) {
                    this.recentTradeData = this.recentTradeData.slice(0, 200);
                }
            }
        }
    };
    orderListDataSaveUpdate = (data) => {
        let orderListData = [];
        let orderListHisData = [];
        if (!this.orderListDataSave.errorCode) {
            orderListData = [...this.orderListDataSave];
        }
        if (!this.orderListDataHIsSave.errorCode) {
            orderListHisData = [...this.orderListDataHIsSave];
        }
        let index = orderListData.findIndex(item => item.orderID === data.orderID);
        if (index === -1) {
            orderListData.unshift(data);
        } else {
            let value = data;
            if (value.price > orderListData[index].price) {
                value.className = "up";
            } else if (value.price < orderListData[index].price) {
                value.className = "down";
            }
            orderListData[index] = { ...orderListData[index], ...data };
        }
        let indexHis = orderListHisData.findIndex(item => item.orderID === data.orderID);
        if (indexHis === -1) {
            orderListHisData.unshift(data);
        } else {
            orderListHisData[indexHis] = { ...orderListHisData[indexHis], ...data };
        }
        this.orderListDataSave = [...orderListData];
        if (orderListHisData.length > 200) {
            this.orderListDataHIsSave = [...orderListHisData].slice(0, 200);
        } else {
            this.orderListDataHIsSave = [...orderListHisData];
        }
        console.log("数组：",this.orderListDataSave,"数据",data);
        this.orderListDataSaveUpdateTime(this.orderListDataSave, this.orderListDataHIsSave);
    };
    tradeListUpdateTime = (receveData) => {
        let tradeListData = [...this.tradeListDataSave];
        for (let value of receveData) {
            // let index = tradeListData.findIndex(item => item.orderID === value.orderID)
            // if (index !== -1) {
            //     let side = value.side === "Buy" ? $("买入") : $("卖出");
            //     if (value.ordStatus === "Filled") {
            //         let text = translationParameters([value.avgPx, side, value.lastQty, value.symbol], $('完全成交提示'))
            //         notificationSuccess($("委托 已成交"), "check-square", "orderList-notification-success", "#316e44", text);
            //     } else if (value.ordStatus === "PartiallyFilled") {
            //         let textTitle = translationParameters([side, value.lastQty], $('部分成交提示标题'));
            //         let text = translationParameters([value.avgPx, side, value.lastQty, value.symbol, value.leavesQty], $('部分成交提示'));
            //         notificationSuccess(textTitle, "check-square", "orderList-notification-success", "#316e44", text);
            //     }
            //     tradeListData[index] = { ...tradeListData[index], ...value };
            // } else {
            let side = value.side === "Buy" ? $("买入") : $("卖出");
            // tradeListData.unshift(value);
            if (value.ordStatus === "Filled") {
                let text = translationParameters([value.avgPx, side, value.lastQty, value.symbol], $('完全成交提示'))
                notificationSuccess($("委托 已成交"), "check-square", "orderList-notification-success", "#316e44", text, value.orderID);
                tradeListData.unshift(value);
            } else if (value.ordStatus === "PartiallyFilled") {
                let textTitle = translationParameters([side, value.lastQty], $('部分成交提示标题'));
                let text = translationParameters([value.avgPx, side, value.lastQty, value.symbol, value.leavesQty], $('部分成交提示'));
                notificationSuccess(textTitle, "check-square", "orderList-notification-success", "#316e44", text, value.orderID);
                tradeListData.unshift(value);
            } else if (value.ordStatus === "Canceled") {
                value.ordStatus = 'PartiallyFilled';
                tradeListData.unshift(value);
            }
            // }
        }
        if (tradeListData.length > 200) {
            this.tradeListDataSave = [...tradeListData].slice(0, 200);
        } else {
            this.tradeListDataSave = [...tradeListData]
        }
        this.tradeListUpdateTimeT(this.tradeListDataSave)
    }
    tradeListUpdateTimeT = throttle((tradeListDataSave) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/tradeListUpdate",
            payload: {
                tradeListData: tradeListDataSave
            }
        })
    }, 250);
    deleteAllOrder = (orderIdArr) => {
        let orderListData = [...this.orderListDataSave];
        orderListData = orderListData.filter((item) => orderIdArr.indexOf(item.orderID) === -1)
        this.orderListDataSave = [...orderListData];
        this.orderListDataSaveUpdateTimeForce()
    }
    deleteOrder = (orderID) => {
        let orderListData = [...this.orderListDataSave];
        orderListData = orderListData.filter((item) => item.orderID !== orderID)
        this.orderListDataSave = [...orderListData];
        this.orderListDataSaveUpdateTimeForce();
    }
    orderListDataSaveUpdateTimeForce = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/save",
            payload: {
                orderListData: this.orderListDataSave,
                orderListHisData: this.orderListDataHIsSave,
            }
        })
        dispatch({
            type: 'orderList/cancelOrderByTime'
        })
    }
    orderListDataSaveUpdateTime = throttle((orderListDataSave, orderListDataHIsSave) => {
        this.orderListDataSave = [...orderListDataSave];
        this.orderListDataHIsSave = [...orderListDataHIsSave];
        this.orderListDataSaveUpdateTimeForce()
    }, 250);
    recentTradeInsertSet = throttle(() => {
        const { dispatch } = this.props;
        dispatch({
            type: "recentTrade/insert",
            payload: {
                dataSource: this.recentTradeData
            }
        })
        this.recentTradeData = [];
    }, 250);
    marginDataUpdate = throttle((data) => {
        const { dispatch } = this.props;
        dispatch({
            type: "margin/update",
            payload: {
                dataSource: data
            }
        })
    }, 250);
    updateOrderForce = (data) => {

    }
    updatePositionForce = (data, flag) => {
        const { dispatch } = this.props;
        if (flag) {
            dispatch({
                type: "orderList/save",
                payload: {
                    positionHavaListData: data
                }
            })
        } else {
            let positionHavaListData = this.positionDataSave
            for (let value of data) {
                let index = positionHavaListData.findIndex(item => item.symbol === value.symbol)
                if (index !== -1) {
                    if (value.markPrice > positionHavaListData[index].markPrice) {
                        value.className = "up";
                    } else if (value.markPrice < positionHavaListData[index].markPrice) {
                        value.className = "down";
                    }
                    if (value.markValue > positionHavaListData[index].markValue) {
                        value.classNameValue = "up";
                    } else if (value.markValue < positionHavaListData[index].markValue) {
                        value.classNameValue = "down";
                    }
                    positionHavaListData[index] = { ...positionHavaListData[index], ...value };
                } else {
                    positionHavaListData.unshift(value);
                }
            }
            this.positionDataSave = [...positionHavaListData]
        }
        this.updatePosition();
    }
    updatePosition = throttle(() => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/positionHaveUpdate",
            payload: {
                positionHavaListData: this.positionDataSave
            }
        })
    }, 250);
    orderBookL2DepthData = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "tradeHistory/save",
            payload: {
                depthData: this.orderDataSave
            }
        })
    };

    componentWillUnmount = () => {
        try {
            if (setinterTime) {
                clearInterval(setinterTime);
            }
            window.removeEventListener("message", this.onTVMessage);
            if (this.ws) {
                this.ws.close();
            }
        } catch (error) {

        }
    }
    // 测试用, 后面删掉
    // renderInput(){
    //     return <div>
    //         orderID:<Input onChange={(e) => {this.orderID = e.target.value}} />
    //         clOrdID:<Input onChange={(e) => {this.clOrdID = e.target.value}}/>
    //         <Button onClick={this.cancelOrder}>撤单</Button>
    //     </div>
    // }
    // cancelOrder = () => {
    //     const { dispatch } = this.props;
    //     let obj = {
    //         orderID: this.orderID,
    //         clOrdID: this.clOrdID,
    //     }
    //     dispatch({
    //         type: "orderList/cancelOrder",
    //         payload: {
    //             ...obj
    //         }
    //     })
    // }
    // positionSwitch = () => {
    //     switch (this.state.currentPosition) {
    //         case 'position':
    //             return <PositionHave />
    //         case 'positionHave':
    //             return <PositionClose />
    //         default:
    //             return ''
    //     }
    // }
    renderItem = (l) => {
        let authority = localStorage.getItem('antd-pro-authority');
        switch (l.i) {
            case "0":
                // return this.renderInput()
                return this.state.renderSecond ? <OrderListSecond item={l} /> : <OrderList item={l} />
                // return <OrderList item={l} />
                break;
            case "1":
                return <Kline item={l} />
                break;
            case "2":
                return <RecentTrade item={l} />
                break;
            case "3":
                return authority === "admin" ? <div className='userOrder'><RenderTabs deleteAllOrder={this.deleteAllOrder} deleteOrder={this.deleteOrder} /></div> : <Unlogin item={l} />
                break;
            case "4":
                return <Depthchart item={l} />
                break;
            // case "5":
            //     return authority === "admin" ? <div className='userOrder'><PositionTabs /></div> : <Unlogin item={l} />
            //     break;
            case "5":
                return authority === "admin" ? <TotalRight item={l} /> : <Unlogin item={l} />
                break;
            case "6":
                return <CommodityIndex item={l} />
                break;
            default:
                break;
        }
    }
    callback = () => {

    }
    resetChart = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "recentTrade/save",
            payload: {
                isFullscreen: false
            }
        })
        this.reRenderChart(10)
    }
    reRenderChart = (time) => {
        try {
            const { myChart } = this.props;
            setTimeout(() => {
                try {
                    myChart.resize();
                } catch (error) {
                }
            }, time);
        } catch (error) {

        }
    }
    screenChange = (isFullscreen, item) => {
        console.log("&&&&&&&&&", isFullscreen, item)
    }
    marginTitle = () => {
        return <div>
            {this.renderTitle($("保证金"))}
            <Tooltip placement="top" title={$('单击此处查看钱包的全部细节')}>
                <Icon onClick={() => this.toDrawDetails()} style={{ zIndex: 100, cursor: "pointer" }} type="question-circle" theme="filled"></Icon>
            </Tooltip>
        </div>
    }
    toDrawDetails = () => {
        const { dispatch } = this.props;
        dispatch(
            routerRedux.push({
                pathname: '/account/account-capital',
            })
        )
        
    }

    clearDep = () => {
        const { dispatch } = this.props;
        window.localStorage.setItem("recent_data_depth", 0.5);
        // window._worker.postMessage({ method: "title", data: { depth: 0.5 } })
        dispatch({
            type: "orderList/save",
            payload: {
                depth: 0.5
            }
        })
    }
    orderListTitle = () => {
        const { symbolCurrent, depth } = this.props;
        let symbol = "(" + symbolCurrent + ")";
        let text = "";
        if (depth != 0.5) {
            text = "(" + $('合并') + depth + ")";
        }
        return <div>
            {this.renderTitle($("委托列表") + symbol)}
            <Tooltip mouseLeaveDelay={0} placement="right" title={$('点击清除')}>
                <span onClick={this.clearDep} className="orderList_title">{text}</span>
            </Tooltip>
        </div>
    }
    showSettingFun = (value, key) => {
        if (key === "value") {
            if (value === 2) {
                this.setState({
                    renderSecond: true
                })
            } else {
                this.setState({
                    renderSecond: false
                })
            }
        }
    }
    showSlide = () => {
        const { dispatch } = this.props;
        setAllTradeLocalSetting("hideSlider", false)
        dispatch({
            type: "login/save",
            payload: {
                hideSlider: false
            }
        })
    }
    // showPosition = () => {
    //     return <div>
    //         <Menu
    //             onClick={this.handleClickPos}
    //             selectedKeys={[this.state.currentPosition]}
    //             mode="horizontal"
    //         >
    //             <Menu.Item key="position">
    //                 {$('持有仓位')}
    //             </Menu.Item>
    //             <Menu.Item key="positionHave">
    //                 {$('已平仓仓位')}
    //             </Menu.Item>
    //         </Menu>
    //     </div>
    // }
    // showUserOrderMenu = () => {
    //     const { orderListData, symbolCurrent, currentTabs } = this.props;
    //     let tabStr = symbolCurrent + "[0]";
    //     let active = $('活动委托') + "[0]";
    //     let stop = $('止损委托') + "[0]";
    //     let activeLength = orderListData.length;
    //     let length = orderListData.length;
    //     let stopLength = 0;
    //     for (let value of orderListData) {
    //         if (value.ordStatus !== "New" && value.ordStatus !== "PartiallyFilled") {
    //             activeLength--;
    //             length--;
    //         } else if (value.symbol !== symbolCurrent) {
    //             length--;
    //         } else if (ordTypeArrStop.indexOf(value.ordType) !== -1) {
    //             stopLength++;
    //             if (value.triggered !== 'StopOrderTriggered') {
    //                 activeLength--;
    //             }
    //         }
    //     }
    //     if (activeLength > 0 && orderListData[0].symbol) {
    //         active = $('活动委托') + "[" + activeLength + "]";
    //     }
    //     if (stopLength > 0) {
    //         stop = $('止损委托') + "[" + stopLength + "]";
    //     }
    //     tabStr = symbolCurrent + "[" + length + "]";
    //     return <div>
    //         <Menu
    //             onClick={this.handleClick}
    //             selectedKeys={[currentTabs]}
    //             mode="horizontal"
    //         >
    //             <Menu.Item key="tabStr">
    //                 {tabStr}
    //             </Menu.Item>
    //             <Menu.Item key="active">
    //                 {active}
    //             </Menu.Item>
    //             <Menu.Item key="stop">
    //                 {stop}
    //             </Menu.Item>
    //             <Menu.Item key="trade">
    //                 {$('已成交')}
    //             </Menu.Item>
    //             <Menu.Item key="orderHis">
    //                 {$('委托历史')}
    //             </Menu.Item>
    //         </Menu>
    //     </div>
    // }
    // handleClick = (e) => {
    //     const { dispatch } = this.props;
    //     debugger
    //     dispatch({
    //         type: "orderList/save",
    //         payload: {
    //             currentTabs: e.key
    //         }
    //     })
    // }
    // handleClickPos = (e) => {
    //     const { dispatch } = this.props;
    //     dispatch({
    //         type: "orderList/save",
    //         payload: {
    //             currentPosition: e.key
    //         }
    //     })
    // }
    renderTitle = (value) => {
        return <span style={{paddingLeft: 10}}>
            {value}
        </span>
    }
    render() {
        const { symbolCurrent, moveRight, hideSlider } = this.props;
        let symbol = "(" + symbolCurrent + ")";
        let width = hideSlider ? "calc(100% - 25px)" : "calc(100% - 250px)";
        setTimeout(() => {
            var myEvent = new Event('resize');
            window.dispatchEvent(myEvent);
        }, 10);
        let userID = getUserUserInfo();
        let height = Math.max(parseInt((window.innerHeight) / 38) - 9,15);
        return (
            <div className="transaction">
                <Layout className={moveRight}>
                    {hideSlider ? <Sider className="slideHide">
                        <Icon onClick={this.showSlide} className="slideHide_icon" type={moveRight === 'layout' ? "double-left" : "double-right"} />
                    </Sider> :
                        <Sider className="slide">
                            <LeftSider />
                        </Sider>
                    }
                    <div className="transaction_back" style={{ width: width }}>
                        {/* <InstrumentMarket /> */}
                        {/* {instrumentData.symbol ? */}
                        <Content>
                            <GridContent
                                onLayoutChangeSecond={this.onLayoutChangeSecond}
                                onLayoutChangeOrder={this.onLayoutChangeOrder}
                                showSettingFun={this.showSettingFun}
                                screenChange={this.screenChange}
                                resetChart={this.resetChart}
                                reRenderChart={this.reRenderChart}
                                ref="gridContentRefs"
                                name={userID}
                                titles={[this.orderListTitle(), this.renderTitle($("图表") + symbol), this.renderTitle($("近期交易") + symbol), <MenuItem />, this.renderTitle($("深度图") + symbol), this.marginTitle(), this.renderTitle($("合约指数"))]}
                                cols={{ lg: 24, md: 20, sm: 16, xs: 12, xxs: 8 }}
                                defaultLayouts={
                                    {
                                        lg: [
                                            { x: 0, y: 0, w: 6, h: height, i: '0', minW: 4, checked: true },
                                            { x: 6, y: 0, w: 12, h: height, i: '1', checked: true },
                                            { x: 18, y: 0, w: 6, h: height, i: '2', checked: true },
                                            { x: 0, y: height, w: 24, h: 9, i: '3', checked: true },
                                            { x: 6, y: height + 9, w: 18, h: 7, i: '4', checked: false },
                                            { x: 0, y: height + 9, w: 6, h: 7, i: '5', checked: false },
                                            { x: 0, y: height + 16, w: 24, h: 7, i: '6', checked: false }
                                        ]
                                        ,
                                        md: [
                                            { x: 0, y: 0, w: 5, h: height, i: '0', minW: 4, checked: true  },
                                            { x: 5, y: 0, w: 10, h: height, i: '1', checked: true  },
                                            { x: 15, y: 0, w: 5, h: height, i: '2', checked: true  },
                                            { x: 0, y: height, w: 20, h: 9, i: '3', checked: true  },
                                            { x: 5, y: height + 9, w: 15, h: 7, i: '4', checked: false  },
                                            { x: 0, y: height + 9, w: 5, h: 7, i: '5', checked: false  },
                                            { x: 0, y: height + 16, w: 20, h: 7, i: '6', checked: false  },
                                        ],
                                        sm: [
                                            { x: 0, y: 0, w: 16, h: 6, i: '0', checked: true  },
                                            { x: 0, y: 6, w: 16, h: 6, i: '1', checked: true  },
                                            { x: 0, y: 12, w: 16, h: 6, i: '2', checked: true  },
                                            { x: 0, y: 18, w: 16, h: 6, i: '3', checked: true  },
                                            { x: 0, y: 24, w: 16, h: 6, i: '4', checked: false  },
                                            { x: 0, y: 36, w: 16, h: 6, i: '5', checked: false  },
                                            { x: 0, y: 42, w: 16, h: 6, i: '6', checked: false  },
                                        ],
                                        xs: [
                                            { x: 0, y: 0, w: 12, h: 6, i: '0', checked: true  },
                                            { x: 0, y: 6, w: 12, h: 6, i: '1', checked: true  },
                                            { x: 0, y: 12, w: 12, h: 6, i: '2', checked: true  },
                                            { x: 0, y: 18, w: 12, h: 6, i: '3', checked: true  },
                                            { x: 0, y: 24, w: 12, h: 6, i: '4', checked: false  },
                                            { x: 0, y: 36, w: 12, h: 6, i: '5', checked: false  },
                                            { x: 0, y: 42, w: 12, h: 6, i: '6', checked: false  }
                                        ]
                                    }
                                }
                                renderItem={this.renderItem}
                            />
                        </Content>
                        <ReConnect />
                        <UnTradeUser />
                        {/* : ""} */}
                    </div>
                </Layout>
            </div>
        );
    }
}
export default connect(({ orderList, instrument, loading, login }) => {
    const { orderListData, depth, myChart, orderListHisData, orderListHisDataReturn, tradeListDataReturn, tradeListData, orderListReturn } = orderList;
    const { publickKeyResponse, moveRight, hideSlider, showReConecting } = login;
    const { symbolCurrent, instrumentData, webSocket } = instrument;
    return {
        orderListData,
        orderListHisData,
        orderListHisDataReturn,
        tradeListDataReturn,
        tradeListData,
        symbolCurrent,
        instrumentData,
        depth,
        myChart,
        publickKeyResponse,
        moveRight,
        hideSlider,
        webSocket,
        orderListReturn,
        showReConecting,
        loading: !!loading.effects["login/getUserSysApiKey"]
    }
})(
    Index
)
