
import {  POSTAPI, PUTAPI } from '../utils/request';
import api from '../services/api.js';
// import { apiSecret } from '../utils/utils';
import { notificationShow, notificationError, notificationSuccess, translationParameters, getLiquidationPrice, getCurrencyType, getMarginRequirement } from '@/utils/utils';
import { language, Utils } from 'quant-ui';
// import { Formula } from '@/utils/formula';
// const FormulaFuc = new Formula();//成本计算公式
const currency = Utils.currency;
let { getLanguageData } = language;
let $ = getLanguageData;
// const ordTypeArr = ["Stop", "LimitIfTouched", "StopLimit", "MarketIfTouched"];
let checkOrderLimit = (instrumentData, payload, positionHavaListData, margin) => {
    let price = payload.price;
    let side = payload.side;
    if(payload.execInst === "Close"){
        if(positionHavaListData){
            if(positionHavaListData.currentQty < 0){
                side = "Buy"
            }else if(positionHavaListData.currentQty > 0){
                side = "Sell"
            }
        }
    }
    if (instrumentData.maxOrderQty < payload.orderQty) {
        notificationError("委托提交错误", "非法的委托数量", "close-circle");
        return false;
    }
    if (price) {//限价下单

    } else if (side === 'Buy') {//市价下单
        price = instrumentData.askPrice;
    } else {
        price = instrumentData.bidPrice;
    }

    //判断委托价格是否大于限价
    let maxPrice = instrumentData.maxPrice || 1000000;
    if (maxPrice < price) {
        notificationError("委托提交错误", "委托价格超过最大下单价格", "close-circle");
        return false;
    }
    if (instrumentData.multiplier) {
        let orderValue = Math.round((1 * 1 / price) * Math.abs(instrumentData.multiplier)) * payload.orderQty;
        if (orderValue > instrumentData.riskLimit) {
            notificationError("委托提交错误", "下单后价值超过风险限额，请调整限额", "close-circle");
            return false;
        }
    }
    if (positionHavaListData && positionHavaListData.currentQty) {//当前是否有持仓
        let position = positionHavaListData;
        let tradeVolume = 0;//预计成交为多仓或者空仓
        //判断成本是否大于可用余额
        let MarginRequirement = getMarginRequirement(instrumentData, position, payload, side === 'Buy' ? true : false, Math.abs(positionHavaListData.currentQty), margin);
        if (MarginRequirement > margin.availableMargin) {
            notificationError("委托提交错误", translationParameters([MarginRequirement, margin.availableMargin], $('委托所需保证金XX大于可用余额XXX')), "close-circle");
            return false;
        }
        let LiquidationPrice = getLiquidationPrice(instrumentData, position, margin, payload, side === "Sell"?true:false, Math.abs(positionHavaListData.currentQty));//预计强平价格
        if(side === "Buy"){//买
            tradeVolume = position.currentQty + Math.abs(payload.orderQty);
            if (position.currentQty > 0) {//多仓
                if (price <= position.liquidationPrice) {
                    let text = "下单价格 " + price + " 低于目前的强平价格 " + position.liquidationPrice;
                    notificationError("委托提交错误", text, "close-circle");
                    return false;
                }
                if (price <= LiquidationPrice * 1) {
                    let text = "下单价格低于多仓的强平价格";
                    notificationError("委托提交错误", text, "close-circle");
                    return false;
                }
            } else if (position.currentQty < 0) {//空仓
                if (price >= position.bankruptPrice) {
                    let text = "下单价格 " + price + " 高于目前的破产价格 " + position.bankruptPrice;
                    notificationError("委托提交错误", text, "close-circle");
                    return false;
                }
            }
            if(tradeVolume > 0){//预计成交如果为多仓，判断预计强平价格>=标记价格*（1-X)
                if(LiquidationPrice * 1 >= instrumentData.markPrice * (1 - instrumentData.liqMarkPrice * 100)){
                    notificationError("委托提交错误", translationParameters([price], $('XXX价格会引起强平，请降低杠杆率')), "close-circle");
                    return false;
                }
            }else if(tradeVolume < 0){ //预计成交如果为空仓，判断预计强平价格<=标记价格*（1+X）
                if(LiquidationPrice * 1 <= instrumentData.markPrice * (1 + instrumentData.liqMarkPrice * 100)){
                    notificationError("委托提交错误", translationParameters([price], $('XXX价格会引起强平，请降低杠杆率')), "close-circle");
                    return false;
                }
            }
        }else{//卖
            tradeVolume = position.currentQty - Math.abs(payload.orderQty);
            if (position.currentQty > 0) {
                //如果为多仓，判断委托价格是否小于等于现有仓位的破产价格，
                if (price <= position.bankruptPrice) {
                    let text = "下单价格 " + price + " 低于目前的破产价格 " + position.bankruptPrice;
                    notificationError("委托提交错误", text, "close-circle");
                    return false;
                }
                
                
            } else if (position.currentQty < 0) {//空仓
                //持仓如果为空仓，判断委托价格是否大于等于现有仓位的强平价格，
                if (price >= position.liquidationPrice) {
                    let text = "下单价格 " + price + " 高于目前的强平价格 " + position.liquidationPrice;
                    notificationError("委托提交错误", text, "close-circle");
                    return false;
                }
                //持仓如果为空仓，判断委托价格是否大于等于现有仓位的强平价格
                if (price >= LiquidationPrice * 1) {
                    let text = "下单价格高于空仓的强平价格";
                    notificationError("委托提交错误", text, "close-circle");
                    return false;
                }
                
            }
            if(tradeVolume > 0){//预计成交如果为多仓，判断预计强平价格>=标记价格*（1-X）
                if(LiquidationPrice * 1 >= instrumentData.markPrice * (1 - instrumentData.liqMarkPrice * 100)){
                    notificationError("委托提交错误", translationParameters([price], $('XXX价格会引起强平，请降低杠杆率')), "close-circle");
                    return false;
                }
            }else if(tradeVolume < 0){ //预计成交如果为空仓，判断预计强平价格<=标记价格*（1+X）
                if(LiquidationPrice * 1 <= instrumentData.markPrice * (1 + instrumentData.liqMarkPrice * 100)){
                    notificationError("委托提交错误", translationParameters([price], $('XXX价格会引起强平，请降低杠杆率')), "close-circle");
                    return false;
                }
            }
        }
    }
    //强平价格大于等于标记价格 * x


    return true;
}
export default {
    namespace: 'orderCommit',

    state: {
        addVisible: {
            addVisibleLimit: false,//限价显示隐藏
            addVisibleMarket: false,//市价显示隐藏
            addVisibleMarketTarget: false,//市价止盈显示隐藏
            addVisibleMarketStop: false,//市价止损显示隐藏
            addVisibleMarketTrai: false,//追踪止损显示隐藏
            addVisibleLimitStop: false,//限价止损显示隐藏
            addVisibleLimitTrai: false,//限价止盈显示隐藏
        },
        addVisiblePosition: false,//持仓弹框显示隐藏
        addVisibleAddMargin: false,//增加仓位保证金显示隐藏
        positionSymbol: "XBTUSD",//增加仓位保证金合约
        positionCurrentQty: 1,//增加仓位保证金合约目前仓位
        positionMaintMargin: 1,//当前分配保证金
        maxMoveMargin: 0,//最大移除金额
        showChangeSendValue:0,//是否渲染发送的价格数量
        positionAlertData: {},
        title: "提交你的委托",
        commitData: {},
        sendPrice: 0,
        sendVolum: 0,
        leverageCal: 0
    },

    effects: {
        *orderCommit({ payload }, { call, put, select }) {
            let symbolCurrent = yield select(({ instrument }) => instrument.symbolCurrent); //查询条件
            let nowSymbol = payload.symbol ? payload.symbol : symbolCurrent;
            let positionHavaListData = yield select(({ orderList }) => orderList.positionHavaListData); //查询条件
            let _positionHavaListData = positionHavaListData.filter(item => item.currentQty !== 0 && item.symbol === nowSymbol)[0];
            let instrumentData = yield select(({ instrument }) => instrument.instrumentData); //查询条件
            let margin = yield select(({ margin }) => margin.dataSource); //查询条件
            // if (!checkOrderLimit(instrumentData, payload, _positionHavaListData, margin)) {//下单校验
            //     return;
            // }
            const orderListData = yield call(POSTAPI, api.trade.orderCommit, { ...payload, symbol: nowSymbol });
            // const orderListData2 = yield call(GETAPI, api.trade.orderCommit, { open:true,reverse:true,count:2 });
            // console.log(orderListData2);
            console.log(orderListData);
            if (!orderListData.errorCode) {
                window.localStorage.setItem("bidPrice", instrumentData.bidPrice);
                window.localStorage.setItem("askPrice", instrumentData.askPrice);
                if (payload.execInst === "Close") {
                    // let obj = {};
                    // obj.timestamp = new Date();
                    // let side = _positionHavaListData.currentQty > 0 ? $("卖出") : $("买入")
                    // let text = translationParameters([$('市价'),side,payload.symbol,Math.abs(_positionHavaListData.currentQty)],$('合约平仓提示'))
                    // if (orderListData.ordType === "Limit") {
                    //     text = translationParameters([payload.price,side,payload.symbol,Math.abs(_positionHavaListData.currentQty)],$('合约平仓提示'))
                    // }
                    // notificationShow(obj, $("委托 已提交"), "check-square", "orderList-notification", "#7ca2bd", text);
                }
                // else if (ordTypeArr.indexOf(payload.ordType) !== -1) {
                //     let text = `在 市价 的价格 ${orderListData.side === "Buy" ? "买入 " : "卖出 "}${orderListData.orderQty} 张 ${orderListData.symbol} 合约.`
                //     notificationShow(orderListData, "委托 已提交", "check-square", "orderList-notification", "#7ca2bd", text);
                // }
            } else {
                if(orderListData.errorCode != 401){
                    let text = $("无法提交委托") + ": " + orderListData.errorMsg || $("委托提交错误。");
                    notificationError($("委托提交错误。"), text, "close-circle");
                }
            }
            yield put({
                type: 'save',
                payload: {
                    addVisiblePosition: false
                },
            });
        },
        *orderUpdate({ payload }, { call, put, select }) {
            let oldPrice = payload.oldPrice;
            let oldOrderQty = payload.oldOrderQty;
            let oldStopPx = payload.oldStopPx;
            delete payload.oldPrice;
            delete payload.oldOrderQty;
            delete payload.oldStopPx;
            const orderListData = yield call(PUTAPI, api.trade.orderCommit, { ...payload });
            if (orderListData.symbol) {
                // let text = translationParameters([orderListData.symbol,$('委托价格'),oldPrice,orderListData.price],$('合约改单提示'));
                // if (!!oldOrderQty) {
                //     text = translationParameters([orderListData.symbol,$('数量'),oldPrice,orderListData.price],$('合约改单提示'));
                // }
                // if (!!oldStopPx) {
                //     text = translationParameters([orderListData.symbol,$('触发价格'),oldPrice,orderListData.price],$('合约改单提示'));
                // }
                // notificationSuccess($("委托 已修改"), "edit", "orderList-notification-success", "#316e44", text);
            } else {
                let text = $("无法提交委托") + ": " + orderListData.errorMsg || $("委托提交错误。");
                notificationError($("委托提交错误。"), text, "close-circle", payload.orderID);
            }
        },
        *transferMargin({ payload }, { call, put, select }) {//设置杠杆系数
            let amount = payload.amount;
            let symbol = payload.symbol;
            let calculate = Math.pow(10,getCurrencyType().tick);
            const marginData = yield call(POSTAPI, api.position.transferMargin, { ...payload });
            if (!marginData.errorCode) {
                yield put({
                    type: 'save',
                    payload: {
                        addVisibleAddMargin: false
                    },
                });
                if (amount > 0) {
                    notificationSuccess($("成功转移保证金"), "bank", "orderList-notification-success", "#316e44", translationParameters([currency(parseInt((amount * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key, symbol], $("已增加xx至你的xx仓位")));
                } else {
                    notificationSuccess($("成功转移保证金"), "bank", "orderList-notification-success", "#316e44", translationParameters([currency(parseInt((-amount * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key, symbol], $("已减少xx至你的xx仓位")));
                }
            } else {
                notificationError("仓位保证金修改错误", marginData.errorMsg, "close-circle");
            }
        },
    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state, ...payload
            };
        },
    },

    subscriptions: {
    },
};
