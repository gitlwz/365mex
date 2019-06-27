export default {
    namespace: 'safeSetting',
    state: {
        dataSource: [], //表格数据
        addVisible: false, //modal显示隐藏
        isUpdate: false,   //当前modal状态
        googleVisible: false, //google显示隐藏
        currentData: {}, //当前操作数据
        title:"设置资金密码"

    },
    effects: {
        //新增
        *add({ payload }, { call, put, select }) {
            // let queryCondition = yield select(({ dashboard }) => dashboard.queryCondition); //查询条件
            // const { errorCode, data } = yield call(POST, api.dashboard.add, payload);
            // if (errorCode == 0) {
            //     message.success("新增成功!");
            //     yield put({
            //         type: "save",
            //         payload: {
            //             addVisible: false
            //         }
            //     })
            //     yield put({
            //         type: "findByQuery",
            //         payload: queryCondition
            //     })
            // }
        },
        //删除
        *delete({ payload }, { call, put, select }) {
            // let queryCondition = yield select(({ dashboard }) => dashboard.queryCondition); //查询条件
            // const { errorCode, data } = yield call(POST, api.dashboard.delete, payload);
            // if (errorCode == 0) {
            //     message.success("删除成功!");
            //     yield put({
            //         type: "findByQuery",
            //         payload: queryCondition
            //     })
            // }
        },
        //修改
        *update({ payload }, { call, put, select }) {
            // let queryCondition = yield select(({ dashboard }) => dashboard.queryCondition); //查询条件
            // const { errorCode, data } = yield call(POST, api.dashboard.update, payload);
            // if (errorCode == 0) {
            //     message.success("修改成功!");
            //     yield put({
            //         type: "save",
            //         payload: {
            //             addVisible: false
            //         }
            //     })
            //     yield put({
            //         type: "findByQuery",
            //         payload: queryCondition
            //     })
            // }
        },
        *sendEmailCheck({ payload }, { call, put, select }) {
            // let queryCondition = yield select(({ dashboard }) => dashboard.queryCondition); //查询条件
        }
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