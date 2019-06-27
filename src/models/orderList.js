
import { GETAPI, DELETEAPI, POSTAPI } from '../utils/request';
import api from '../services/api.js';
import { notificationSuccess, notificationError, translationParameters } from '@/utils/utils'
import { language } from 'quant-ui';
let { getLanguageData } = language;
let $ = getLanguageData;
const arr = ['Canceled', 'Rejected', 'Filled'];
const delay = timeout => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
};
export default {
    namespace: 'orderList',

    state: {
        dataSource: [],
        orderListData: [],//委托数据
        orderListHisData: [],
        orderListHisDataReturn: false,//委托历史数据返回
        orderListReturn: false,//委托数据返回
        tradeListDataReturn: false,//成交数据返回
        tradeListData: [],
        positionHavaListData: [],
        orderID: "", //当前点的取消按钮id
        symbol: "", //当前点的取消按钮id
        cancelOrder: [],
        cancelOrderList: [],//状态为Canceled的订单
        timeSetObj: null,
        addVisible: false,
        depth:0.5,
        orderHeight:6,
        currentTabs:"position",
        currentPosition: 'position',
        setLeverageSuccess:false,
        setRiskSuccess:false,
        myChart:null,//图标对象
    },

    effects: {
        *getPosition({ payload }, { put, call, select }) {
            const dataSource = yield call(GETAPI, api.position.getPosition, null);
            if (dataSource.length > 0) {
                yield put({
                    type: 'save',
                    payload: {
                        positionHavaListData: dataSource,
                    },
                });
            }
        },
        *getOrder({ payload }, { put, call, select }) {
            const dataSource = yield call(GETAPI, api.trade.getOrder, null);
            if (dataSource.length > 0) {
                yield put({
                    type: 'save',
                    payload: {
                        orderListData: dataSource,
                    },
                });
            }
        },
        *tradeListGet({ payload }, { call, put }) {
            let tradeListData = yield call(GETAPI, api.trade.execution, { ...payload });
            if (!tradeListData.errorCode) {
                yield put({
                    type: "save",
                    payload: {
                        tradeListData: tradeListData,
                        tradeListDataReturn: true
                    }
                })
            }
        },
        *orderListHisGet({ payload }, { call, put }) {
            let orderListHisData = yield call(GETAPI, api.trade.orderCommit, { ...payload });
            if (!orderListHisData || orderListHisData.errorCode) {
                orderListHisData = []
            }
            yield put({
                type: "save",
                payload: {
                    orderListHisData: orderListHisData,
                    orderListHisDataReturn:true
                }
            })
        },
        *cancelOrder({ payload }, { call, put, select }) {
            yield put({
                type: "save",
                payload: {
                    orderID: payload.orderID
                }
            })
            const cancelOrder = yield call(DELETEAPI, api.trade.orderCommit, { ...payload });
            if(!cancelOrder.errorCode){
                // let obj = cancelOrder[0];
                // let cancelOrderList = yield select(({ orderList }) => orderList.cancelOrderList); //查询条件
                // if (obj.ordStatus === "Canceled") {
                //     cancelOrderList.push(obj.orderID);
                //     yield put({
                //         type: "save",
                //         payload: {
                //             cancelOrderList: cancelOrderList
                //         }
                //     })
                // }
                yield put({
                    type: "cancelOrderByTime"
                })
            }else{
                notificationError($("委托提交错误"), cancelOrder.errorMsg, "warning", payload.orderID);
            }
        },
        *cancelOrderAll({ payload }, { call, put, select }) {
            const cancelOrder = yield call(DELETEAPI, api.trade.cancelOrderAll, { ...payload });
            if (!cancelOrder.errorCode) {
                // let _cancelOrder = yield select(({ orderList }) => orderList.cancelOrderList);
                // for(let value of cancelOrder){
                //     if (value.ordStatus === "Canceled") {
                //         _cancelOrder.push(value.orderID);
                //     }
                // }
                // yield put({
                //     type: "save",
                //     payload: {
                //         cancelOrderList: _cancelOrder
                //     }
                // })
                yield put({
                    type: "cancelOrderByTime"
                })
            }else{
                notificationError($("委托提交错误"), cancelOrder.errorMsg, "warning");
            }
        },
        *setLeverage({ payload }, { call, put, select }) {//设置杠杆系数
            let symbolCurrent = yield select(({ instrument }) => instrument.symbolCurrent); //查询条件
            const positionData = yield call(POSTAPI, api.position.leverage, { ...payload, symbol: symbolCurrent });
            if (positionData.errorMsg) {
                yield put({
                    type: "save",
                    payload: {
                        setLeverageSuccess: false,
                        setRiskSuccess:false
                    }
                })
                notificationError($("无法更新此仓位的杠杆系数") + "：\n\r" + symbolCurrent + "。", positionData.errorMsg, "warming");
            }else{
                yield put({
                    type: "save",
                    payload: {
                        setLeverageSuccess: true,
                        setRiskSuccess:false
                    }
                })
            }
        },
        *riskLimitSet({ payload }, { call, put, select }) {
            let symbolCurrent = yield select(({ instrument }) => instrument.symbolCurrent); //查询条件
            let riskLimit = yield call(POSTAPI, api.position.riskLimit, { ...payload, symbol: symbolCurrent });
            if (!riskLimit.errorCode) {
                let text = translationParameters([symbolCurrent, riskLimit.riskLimit / 100000000],$('风险限额更新成功提示'));
                notificationSuccess($("成功设置风险限额"), "check-square", "orderList-notification-success", "#316e44", text);
                yield put({
                    type: "orderList/save",
                    payload: {
                        addVisible: false,
                        setRiskSuccess:true
                    }
                })
            } else {
                yield put({
                    type: "orderList/save",
                    payload: {
                        addVisible: false,
                        setRiskSuccess:false
                    }
                })
                notificationError($("无法更新此合约的风险限额") + "：\n\r" + symbolCurrent + "。", $(riskLimit.errorMsg));
            }
        },
        cancelOrderByTime: [function* ({ payload }, { call, put, select }) {
            yield call(delay, 20000);
            let orderListData = yield select(({ orderList }) => orderList.orderListData); //查询条件
            let _orderListData = orderListData.filter((item) => {
                return arr.indexOf(item.ordStatus) === -1
            })
            yield put({
                type: "save",
                payload: {
                    orderListData: _orderListData,
                    orderListReturn:new Date()
                }
            })
        }, { type: 'takeLatest'}],
        // }, { type: 'takeLatest', ms: 1000000 }],
    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state, ...payload
            };
        },
        // orderListUpdate(state, { payload }) {
        //     let orderListData = [];
        //     let orderListHisData = [];
        //     if (!state.orderListData.errorCode) {
        //         orderListData = [...state.orderListData];
        //     }
        //     if (!state.orderListHisData.errorCode) {
        //         orderListHisData = [...state.orderListHisData];
        //     }
        //     let index = orderListData.findIndex(item => item.orderID === payload.orderListData.orderID);
        //     if(index === -1){
        //         orderListData.unshift(payload.orderListData);
        //     }else{
        //         let value = payload.orderListData;
        //         if (value.price > orderListData[index].price) {
        //             value.className = "up";
        //         } else if (value.price < orderListData[index].price) {
        //             value.className = "down";
        //         }
        //         orderListData[index] = { ...orderListData[index], ...payload.orderListData };
        //     }
        //     let indexHis = orderListHisData.findIndex(item => item.orderID === payload.orderListData.orderID);
        //     if(indexHis === -1){
        //         orderListHisData.unshift(payload.orderListData);
        //     }else{
        //         orderListHisData[index] = { ...orderListHisData[index], ...payload.orderListData };
        //     }
        //     return {
        //         ...state, orderListData, orderListHisData
        //     };
        // },
        orderListInsert(state, { payload }) {
            if (!state.orderListHisData.errorCode) {
                let orderListHisData = [...state.orderListHisData];
                let orderListData = [...state.orderListData];
                if (!payload.orderListData.errorCode) {
                    orderListHisData.unshift(payload.orderListData);
                    orderListData.unshift(payload.orderListData);
                }
                if (orderListHisData.length > 200) {
                    orderListHisData.length = 200;
                }
                if (orderListData.length > 200) {
                    orderListData.length = 200;
                }
                return {
                    ...state, orderListHisData, orderListData
                };
            }
            return {
                ...state
            }
        },
        tradeListUpdate(state, { payload }) {
            // let tradeListData = [...state.tradeListData]
            // for (let value of payload.tradeListData) {
            //     let index = tradeListData.findIndex(item => item.orderID === value.orderID)
            //     if (index !== -1) {
            //         let side = value.side === "Buy" ? $("买入") : $("卖出");
            //         if (value.ordStatus === "Filled") {
            //             let text = translationParameters([value.avgPx,side,value.lastQty,value.symbol],$('完全成交提示'))
            //             notificationSuccess($("委托 已成交"), "check-square", "orderList-notification-success", "#316e44", text);
            //         }else if(value.ordStatus === "PartiallyFilled"){
            //             let textTitle = translationParameters([side,value.lastQty],$('部分成交提示标题'));
            //             let text = translationParameters([value.avgPx, side, value.lastQty, value.symbol, value.leavesQty],$('部分成交提示'));
            //             notificationSuccess(textTitle, "check-square", "orderList-notification-success", "#316e44", text);
            //         }
            //         tradeListData[index] = { ...tradeListData[index], ...value };
            //     }else{
            //         let side = value.side === "Buy" ? $("买入") : $("卖出");
            //         if (value.ordStatus === "Filled") {
            //             let text = translationParameters([value.avgPx,side,value.lastQty,value.symbol],$('完全成交提示'))
            //             notificationSuccess($("委托 已成交"), "check-square", "orderList-notification-success", "#316e44", text);
            //             tradeListData.unshift(value);
            //         }else if(value.ordStatus === "PartiallyFilled"){
            //             let textTitle = translationParameters([side,value.lastQty],$('部分成交提示标题'));
            //             let text = translationParameters([value.avgPx, side, value.lastQty, value.symbol, value.leavesQty],$('部分成交提示'));
            //             notificationSuccess(textTitle, "check-square", "orderList-notification-success", "#316e44", text);
            //             tradeListData.unshift(value);
            //         }
            //     }
            // }
            return {
                ...state, tradeListData:payload.tradeListData
            };
        },
        tradeListInsert(state, { payload }) {
            if (!state.tradeListData.errorCode) {
                let tradeListData = [...state.tradeListData]
                for (let value of payload.tradeListData) {
                    let side = value.side === "Buy" ? $("买入") : $("卖出");
                    if (value.ordStatus === "Filled") {
                        let text = translationParameters([value.price,side,value.lastQty,value.symbol],$('完全成交提示'))
                        notificationSuccess($("委托 已成交"), "check-square", "orderList-notification-success", "#316e44", text, value.orderID);
                        tradeListData.unshift(value);
                    }else if(value.ordStatus === "PartiallyFilled"){
                        let textTitle = translationParameters([side,value.lastQty],$('部分成交提示标题'));
                        let text = translationParameters([value.price, side, value.lastQty, value.symbol, value.leavesQty],$('部分成交提示'));
                        notificationSuccess(textTitle, "check-square", "orderList-notification-success", "#316e44", text, value.orderID);
                        tradeListData.unshift(value);
                    }
                }
                if (tradeListData.length > 200) {
                    tradeListData.length = 200;
                }
                return {
                    ...state, tradeListData
                };
            }
            return {
                ...state
            }
        },
        deleteOrder(state, { payload }) {
            let orderListData = [...state.orderListData];
            orderListData = orderListData.filter((item) => item.orderID !== payload.orderID)
            return {
                ...state, orderListData
            };
        },
        deleteAllOrder(state, { payload }) {
            let orderListData = [...state.orderListData];
            orderListData = orderListData.filter((item) => payload.orderIdArr.indexOf(item.orderID) === -1)
            return {
                ...state, orderListData
            };
        },
        positionHaveUpdate(state, { payload }) {
            let { positionHavaListData } = payload;
            return {
                ...state, positionHavaListData
            };
        },
    },

    subscriptions: {

    },
};
