
import { GETAPI, POST } from '../utils/request';
import api from '../services/api.js';
export default {
    namespace: 'margin',

    state: {
        dataSource: {},
        currencyType: window.localStorage.getItem("currencyType") || "XBt",
        parames:{},
    },

    effects: {
        *getAccount({ payload }, { put, call, select }) {
            const dataSource = yield call(GETAPI, api.account.getAccount, null);
            if (dataSource.length > 0) {
                yield put({
                    type: 'save',
                    payload: {
                        dataSource: dataSource[0],
                    },
                });
            }
            // if (code == 0) {
            //     if (result) {
            //         yield put({
            //             type: 'save',
            //             payload: {
            //                 dataSource: result,
            //             },
            //         });
            //     } else {
            //     }
            // }
        },
    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state, ...payload
            };
        },
        update(state, { payload }) {
            let dataSource = { ...state.dataSource, ...payload.dataSource }
            return {
                dataSource
            };
        },
    },

    subscriptions: {

    },
};
