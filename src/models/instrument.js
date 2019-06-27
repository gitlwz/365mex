
export default {
    namespace: 'instrument',

    state: {
        dataSource: [],
        instrumentData: {},
        lastPrice: "",
        markPrice: "",
        indicativeSettlePrice: "",
        riskStep: "",
        riskLimit: "",
        symbolCurrent: "XBTUSD",
        tickSize: "0.5",
        webSocket: null,
        initMargin: "0.01",//起始保证金
        maintMargin: "0.005",//维持保证金
        multiplier: -100000000,//合约乘数
        takerFee: 0.00075,//合约乘数
        fundingTimestamp:''

    },
    effects: {
        *getInstrumentBySymbol({ payload }, { call, put, select }) {
            let webSocket = yield select(({ instrument }) => instrument.webSocket); //查询条件
            let symbolCurrent = yield select(({ instrument }) => instrument.symbolCurrent); //查询条件
            if (payload.symbol === symbolCurrent) {
                return;
            }
            if (!!webSocket && !!symbolCurrent) {
                // yield put({
                //     type: "recentTrade/getTrade"
                // })
                webSocket.send(JSON.stringify({
                    op: "unsubscribe", args: [
                        "orderBookL2_25:" + symbolCurrent, "trade:" + symbolCurrent,
                    ]
                }));
                webSocket.send(JSON.stringify({
                    op: "subscribe", args: [
                        "orderBookL2_25:" + payload.symbol, "trade:" + payload.symbol,
                    ]
                }));
            }
            yield put({
                type: "save",
                payload: {
                    symbolCurrent: payload.symbol
                }
            })
            let dataSource = yield select(({ instrument }) => instrument.dataSource); //查询条件
            const instrumentData = dataSource.find(item => item.symbol === payload.symbol);
            window.localStorage.setItem("bidPrice", instrumentData.bidPrice);
            window.localStorage.setItem("askPrice", instrumentData.askPrice);
            yield put({
                type: "save",
                payload: {
                    instrumentData,
                    lastPrice: instrumentData.lastPrice,
                    indicativeSettlePrice: instrumentData.indicativeSettlePrice,
                    markPrice: instrumentData.markPrice,
                    tickSize: instrumentData.tickSize,
                    riskStep: instrumentData.riskStep,
                    riskLimit: instrumentData.riskLimit,
                    initMargin: instrumentData.initMargin,
                    maintMargin: instrumentData.maintMargin,
                    multiplier: instrumentData.multiplier,
                }
            })
        },
    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state, ...payload
            };
        },
        instrumentSave(state, { payload }) {
            let dataSource = payload.dataSource;
            let instrumentData = {};
            let riskStep = "";
            let riskLimit = "";
            let initMargin = "";
            let maintMargin = "";
            let multiplier = "";
            let fundingTimestamp = "";
            let takerFee = "";
            if (!!dataSource) {
                for (let index = 0; index < dataSource.length; index++) {
                    if (state.symbolCurrent === dataSource[index].symbol) {
                        instrumentData = { ...dataSource[index] };
                        window.localStorage.setItem("bidPrice", instrumentData.bidPrice);
                        window.localStorage.setItem("askPrice", instrumentData.askPrice);
                        riskStep = instrumentData.riskStep;
                        riskLimit = instrumentData.riskLimit;
                        initMargin = instrumentData.initMargin;
                        maintMargin = instrumentData.maintMargin;
                        multiplier = instrumentData.multiplier;
                        takerFee = instrumentData.takerFee;
                        fundingTimestamp = instrumentData.fundingTimestamp;
                    }
                }
            }
            return {
                ...state, dataSource, instrumentData, tickSize: instrumentData.tickSize, multiplier: multiplier,
                indicativeSettlePrice: instrumentData.indicativeSettlePrice,
                markPrice: instrumentData.markPrice,
                lastPrice: instrumentData.lastPrice,
                riskStep: riskStep, riskLimit: riskLimit, initMargin: initMargin, maintMargin: maintMargin,takerFee,fundingTimestamp:fundingTimestamp
            };
        },
        instrumentupdate(state, { payload }) {
            // let instrumentData = state.instrumentData;
            // let index = state.instrumentArr[payload.instrumentData.symbol];
            // let dataSource = [];
            // if (!!state.dataSource) {
            //     dataSource = [...state.dataSource];
            //     dataSource[index] = { ...dataSource[index], ...payload.instrumentData };
            //     if (payload.instrumentData.symbol === state.symbolCurrent) {
            //         let icon = state.instrumentData.icon;
            //         if (!!payload.instrumentData.lastPrice) {
            //             if (state.instrumentData.lastPrice > payload.instrumentData.lastPrice) {
            //                 icon = "arrow-down";
            //             } else if (state.instrumentData.lastPrice < payload.instrumentData.lastPrice) {
            //                 icon = "arrow-up";
            //             } else {
            //                 icon = "";
            //             }
            //         }
            //         instrumentData = { ...state.instrumentData, ...payload.instrumentData }
            //         instrumentData.icon = icon;
            //         return {
            //             ...state, instrumentData: instrumentData, dataSource: dataSource, lastPrice: instrumentData.lastPrice
            //         };
            //     }
            // }
            // return {
            //     ...state, dataSource: dataSource
            // };
            const dataSource = [...payload.dataSource];
            if (payload.instrumentData) {
                const instrumentData = payload.instrumentData;
                return {
                    ...state, instrumentData, dataSource, lastPrice: instrumentData.lastPrice, indicativeSettlePrice: instrumentData.indicativeSettlePrice,
                    markPrice: instrumentData.markPrice,
                };
            } else {
                return {
                    ...state, dataSource
                };
            }

        },
    },

    subscriptions: {

    },
};
