
import { GETAPI } from '../utils/request';
import api from '../services/api.js';
export default {
    namespace: 'tradeHistory',

    state: {
        dataSource: [],
        walletHistory:[],
        depthData:[]
    },

    effects: {
        *getTradeHistory({ payload }, { call, put, select }) {
            const dataSource = yield call(GETAPI, api.trade.tradeHistory,{ ...payload});
            if(dataSource.length >= 0){
                yield put({
                    type: "save",
                    payload: {
                        dataSource
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
    },

    subscriptions: {

    },
};
