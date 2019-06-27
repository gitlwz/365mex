
import { GET } from '../utils/request';
import api from '../services/api.js';
import { showLastTickDirection } from '@/utils/utils'
export default {
    namespace: 'recentTrade',

    state: {
        dataSource: [],
        sellData: [],
        buyData: [],
        liquidation:[],
        layoutHeight:8,
        maxWidth:1
    },

    effects: {
        *getTrade({ payload }, { call, put , select}) {
            let symbol = yield select(({ instrument }) => instrument.symbolCurrent); //查询条件
            if(!!symbol){
                let symbolCurrent = yield select(({ instrument }) => instrument.symbolCurrent); //查询条件
                const data = yield call(GET, api.trade.getTrade, { symbol: symbol, count: '200', reverse: true });
                if(data.length > 0){
                    if(data[0].symbol === symbolCurrent){
                        data.forEach((ele, index, arr) => {
                            ele.icon = '';
                            if(ele.tickDirection === 'PlusTick'){
                                ele.icon = 'arrow-up';
                            }else if(ele.tickDirection === 'MinusTick'){
                                ele.icon = 'arrow-down';
                            }
                        });
                        yield put({
                            type: "saveTrade",
                            payload: {
                                dataSource: data
                            }
                        })
                    }
                }else{
                    //报错
                }
            }else{
                yield put({
                    type: "saveTrade",
                    payload: {
                        dataSource: []
                    }
                })
            }
        },

    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state, ...payload
            };
        },
        insertL(state, { payload }) {
            let { liquidation } = payload;
            let  dataSource  = [...state.liquidation];
            for(let value of liquidation){
                dataSource.unshift(value);
            }
            return {
                ...state, liquidation:dataSource
            };
        },
        deleteL(state, { payload }) {
            let { liquidation } = payload;
            let  dataSource  = [...state.liquidation];
            for(let value of liquidation){
                dataSource = dataSource.filter( item => item.orderID !== value.orderID);
            }
            return {
                ...state, liquidation:dataSource
            };
        },
        updateL(state, { payload }) {
            let { liquidation } = payload;
            let dataSource  = [...state.liquidation];
            for(let value of liquidation){
                let index = dataSource.findIndex( item => item.orderID === value.orderID);
                dataSource[index] = { ...dataSource[index] , ...value };
            }
            return {
                ...state, liquidation:dataSource
            };
        },
        saveTrade(state, { payload }) {
            let newDataSource = payload.dataSource
            // let oldDataSource = [...state.dataSource];
            // 暂时注释
            // if(oldDataSource.length > 0 && oldDataSource[0].symbol === newDataSource[0].symbol){
            //     oldDataSource.push(...newDataSource)
            //     return {
            //         ...state, dataSource: oldDataSource
            //     };
            // }else{
                return {
                    ...state, dataSource: newDataSource
                };
            // }
        },
        insert(state, { payload }) {
            let { dataSource } = payload
            let oldDataSource = [...state.dataSource]
            oldDataSource.unshift(...dataSource);
            if (oldDataSource.length > 200) {
                oldDataSource.length = 200;
            }
            return {
                ...state, dataSource: oldDataSource
            };
        },
        partial(state, { payload }) {
            let { depthData } = payload;
            let sellData = [];
            let buyData = [];
            let leftAll = 0;
            let rightAll = 0;
            let index = depthData.findIndex(item => item.side === "Buy");
            for (let i = 0; i < 25; i++) {
                let right = depthData[index - 1 - i];
                let left = depthData[index + i];
                if(!!right && right.side === "Sell"){
                    rightAll += right.size;
                    right.all = rightAll;
                    sellData.unshift(right);
                }
                if(left && left.side === "Buy"){
                    leftAll += left.size;
                    left.all = leftAll;
                    buyData.push(left)
                }
            }
            return {
                ...state, buyData, sellData
            };
        },
        partialAll(state, { payload }) {
            let { depthData } = payload;
            let sellData = [];
            let buyData = [];
            let leftAll = 0;
            let rightAll = 0;
            let index = parseInt(depthData.length / 2);
            if(depthData[index].side === "Sell"){
                index ++;
                while(depthData[index].side === "Sell"){
                    index ++;
                }
            }else{
                index --
                while(depthData[index].side === "Buy"){
                    index --;
                }
            }
            for (let i = 0; i < 25; i++) {
                let right = depthData[index - 1 - i];
                let left = depthData[index + i];
                if(!!right && right.side === "Sell"){
                    rightAll += right.size;
                    right.all = rightAll;
                    sellData.unshift(right);
                }
                if(left && left.side === "Buy"){
                    leftAll += left.size;
                    left.all = leftAll;
                    buyData.push(left)
                }
            }
            return {
                ...state, buyData, sellData
            };
        },
        upDateAll(state, { payload }) {
            let { sellData, buyData, maxWidth } = payload;
            return {
                ...state, buyData, sellData, maxWidth
            };
        },
        update(state, { payload }) {
            let { sellData, buyData } = state;
            const { updataData } = payload;
            let _sellData = [];
            let _buyData = [];
            let leftAll = 0;
            let rightAll = 0;
            let length = 25;
            for (let i = 0; i < length; i++) {
                let left = buyData[i] ? buyData[i] : {};
                let right = sellData[length - 1 - i] ? sellData[length - 1 - i] : {};
                let leftUpData = updataData.find((ele) => ele.id === left.id);
                let rightUpData = updataData.find((ele) => ele.id === right.id);
                if (!!leftUpData) {
                    let dic = ""
                    if (left.size > leftUpData.size) {
                        dic = "up"
                    }
                    if (left.size < leftUpData.size) {
                        dic = "down"
                    }
                    left = { ...left, ...leftUpData }
                    left.dic = dic;
                } else {
                    left.dic = "";
                }
                if (!!rightUpData) {
                    let dic = ""
                    if (right.size > rightUpData.size) {
                        dic = "up"
                    }
                    if (right.size < rightUpData.size) {
                        dic = "down"
                    }
                    right = { ...right, ...rightUpData }
                    right.dic = dic;
                } else {
                    right.dic = "";
                }
                if(left.size && left.side === "Buy"){
                    leftAll += left.size;
                    left.all = leftAll;
                    _buyData.push(left);
                }
                if(right.size && right.side === "Sell"){
                    rightAll += right.size;
                    right.all = rightAll;
                    _sellData.unshift(right)
                }
            }
            return {
                ...state, buyData: _buyData, sellData: _sellData
            };
        },
        delete(state, { payload }) {
            let { sellData, buyData } = state;
            const { deleteData } = payload;
            let _sellData = [...sellData];
            let _buyData = [...buyData];
            for (let value of deleteData) {
                _sellData = _sellData.filter(item => item.id !== value.id);
                _buyData = _buyData.filter(item => item.id !== value.id);
            }
            let __sellData = [];
            let __buyData = [];
            let leftAll = 0;
            let rightAll = 0;
            for (let i = 0; i < _buyData.length; i++) {
                let left = _buyData[i] ? _buyData[i] : {};
                if(left.size){
                    leftAll += left.size;
                    left.all = leftAll;
                    __buyData.push(left);
                }
            }
            for(let i = 0; i < _sellData.length; i++){
                let right = _sellData[_sellData.length - 1 - i] ? _sellData[_sellData.length - 1 - i] : {};
                if(right.size){
                    rightAll += right.size;
                    right.all = rightAll;
                    __sellData.unshift(right)
                }
            }
            return {
                ...state, buyData: __buyData, sellData: __sellData
            };
        },
        orderBookInsert(state, { payload }) {
            let { sellData, buyData } = state;
            const { insertData } = payload;
            let _sellData = [...sellData];
            let _buyData = [...buyData];
            let index = 0;
            for (let value of insertData) {
                if (value.side === "Buy") {
                    index = _buyData.findIndex((item) => item.price < value.price);
                    if (index === -1) {
                        index = _buyData.length;
                    }
                    _buyData.splice(index, 0, value);
                } else if (value.side === "Sell") {
                    index = _sellData.findIndex((item) => item.price < value.price);
                    if (index === -1) {
                        index = _sellData.length;
                    }
                    _sellData.splice(index, 0, value);
                }
            }
            let __sellData = [];
            let __buyData = [];
            let leftAll = 0;
            let rightAll = 0;
            for (let i = 0; i < _buyData.length; i++) {
                let left = _buyData[i] ? _buyData[i] : {};
                if(left.size){
                    leftAll += left.size;
                    left.all = leftAll;
                    __buyData.push(left);
                }
            }
            for(let i = 0; i < _sellData.length; i++){
                let right = _sellData[_sellData.length - 1 - i] ? _sellData[_sellData.length - 1 - i] : {};
                if(right.size){
                    rightAll += right.size;
                    right.all = rightAll;
                    __sellData.unshift(right)
                }
            }
            return {
                ...state, buyData: __buyData, sellData: __sellData
            };
        }

    },

    subscriptions: {

    },
};
