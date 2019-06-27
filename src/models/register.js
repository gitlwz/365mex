/*
 * @Author: 刘文柱 
 * @Date: 2018-11-15 17:02:01 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2018-11-15 17:24:21
 */
import { routerRedux } from 'dva/router';
import { POST, GET } from '../utils/request';
import api from '../services/api.js';
import { language } from 'quant-ui';
import { message } from 'antd';
import { JSEncrypt } from 'jsencrypt';
let { getLanguageData } = language;
let $ = getLanguageData;
const encryptSend = (encrypt, publickKey, publickKeyResponse, payload) => {
    let obj = { ...payload }
    encrypt.setPublicKey(publickKeyResponse);
    obj.password = encrypt.encrypt(obj.password);
    obj.confirm = "";
    // obj.publicKey = encrypt.encryptLong(publickKey);
    return obj;
}
export default {
    namespace: 'register',

    state: {
        user: '',
        password: '',
        refsText:null,
        dataSource: {},
        type: 0
    },

    effects: {
        *submit({ payload }, { call, put, select }) {
            let user = payload.email || payload.telephone;
            let password = payload.password;
            yield put({
                type: 'login/getPublicKey',
            });
            let _payload = {};
            let publickKey = yield select(({ login }) => login.publickKey); //查询条件
            let privateKey = yield select(({ login }) => login.privateKey); //查询条件
            let publickKeyResponse = yield select(({ login }) => login.publickKeyResponse); //查询条件
            let encrypt = new JSEncrypt();
            _payload = encryptSend(encrypt, publickKey, publickKeyResponse, payload);
            const { code, result } = yield call(POST, api.user.register, { ..._payload });
            if (code === 0) {
                if (result === 0) {
                    message.success('注册成功! 请用新账号进行登录');
                    yield put({
                        type: 'save',
                        payload: {
                            user: user,
                            password: password,
                        },
                    });
                    yield put(
                        routerRedux.push({
                            pathname: '/user/login',
                        })
                    );
                } else if (result == "1002") {
                    message.error($('用户名已存在，请重新输入。'));
                } else if (result == "1001") {
                    message.error($('验证码输入错误, 请重新提交。'));
                } else if (result == "1003") {
                    message.error($('黑名单限制，注册失败。'));
                }
            } else {
                message.error('注册失败，请联系管理员。');
            }
        },
        *sendEmail({ payload }, { call, put, select }) {
            const { code, result } = yield call(POST, api.user.sendEmail, { ...payload });
            if (payload.number) {
                if (code === 0) {
                    if (result === 0) {
                        message.success('验证码发送成功');
                    }
                } else {
                    message.error('请检查网络');
                }
            } else {
                message.error('请输入邮箱');
            }
        },
        *sendSms({ payload }, { call, put, select }) {
            const { code, result } = yield call(POST, api.user.sendSms, { ...payload });
            if (payload.number) {
                if (code === 0) {
                    if (result === 0) {
                        message.success('验证码发送成功');
                    }
                } else {
                    message.error('请检查网络');
                }
            } else {
                message.error('请输入手机');
            }
        },
        *findUserInfo(_, { put, call, select }) {
            const { code, result } = yield call(GET, api.user.findUserInfo);
            if (code == 0) {
                if (result) {
                    yield put({
                        type: 'save',
                        payload: {
                            dataSource: result,
                        },
                    });
                } else {
                    message.error($('身份信息获取失败, 请检查网络。'));
                }
            }
        },
        *resetPassword({payload}, {put, call, select}) {
            let type = yield select(({ register }) => register.type);
            const {code, result} = yield call(GET, api.user.findUserInfo);
            if(code == 0) {

            } else {
                message.error($('验证失败，请重新输入')+'!');
            }

        }
    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state,
                ...payload
            };
        },
    },
};
