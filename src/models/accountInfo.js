/* eslint-disable eqeqeq */

import { routerRedux } from 'dva/router';
import { POST, POSTAPI,  GET, DELETE, GETAPI } from '../utils/request';
import api from '../services/api.js';
import { reloadAuthorized } from '../utils/Authorized';
import { notificationSuccess, notificationError } from '@/utils/utils'
import { message } from 'antd';
import { JSEncrypt } from 'jsencrypt';
import { language } from 'quant-ui';
let { getLanguageData } = language;
let $ = getLanguageData;
function objKeySort(obj){
    var newkey = Object.keys(obj).sort();
    var newObj = {};
    for (var i = 0; i < newkey.length; i++) {
        newObj[newkey[i]] = obj[newkey[i]];
    }
    return newObj;
}
export default {
    namespace: 'accountInfo',

    state: {
        collapsed: false,
        selectedKeys: ["capital-all"],
        openKeys: ["account"],
        addVisible: false,//谷歌两步验证显示
        addVisibleTel: false,//手机验证显示
        addVisibleCaptal: false,//资金密码显示
        addVisibleApi: false,//API新增显示
        addVisibleApiShow: false,//API显示
        addVisibleEmail: false,//修改邮箱显示
        applyStatus: "",//验证状态码
        dataSource: {},
        announcementData: [],
        title: "",
        currentData: {},//谷歌两部验证数据
        apiData: [],//api密钥数据
        currentApiData: {},//api密钥数据
        myAdviceData: {},//我的邀请数据
        myAdviceDataList: [],//我的邀请返佣列表
        currencyData: [],//币种查询数据
        latelyWithdraw: [],//充提查询
        inOutType:window.localStorage.getItem("in_out_type") || "1",
        depositAddress:"", //提现二维码地址
        activeLogData:[],//日志数据
        statementData: [],
        transactionHistory:[],
        type: 0,
        needGoogleCode: undefined,
        needIdentificationId: undefined,
        hash: ''
    },

    effects: {
        *findTransactionHistory({ payload }, { put, call, select }) {
            yield put({
                type: 'save',
                payload: {
                    parames:{ ...payload }
                },
            });
            const { code, result } = yield call(POST, api.user.findTransactionHistory, { ...payload });
            if (code == 0) {
                yield put({
                    type: 'save',
                    payload: {
                        transactionHistory:result
                    },
                });
            }
        },
        *updatePassword({ payload }, { put, call, select }) {
            // let value = "email";
            let encrypt = new JSEncrypt();
            // if (payload.userID.indexOf("@") === -1) {
            //     value = "telephone";
            // }
            // let _payload = {
            //     [value]: payload.userID,
            //     password: payload.password,
            //     verifyCode: payload.verifyCode
            // }
            let publickKeyResponse = yield select(({ login }) => login.publickKeyResponse); //查询条件
            encrypt.setPublicKey(publickKeyResponse);
            if(payload.confirmPassword) { delete payload.confirmPassword; }
            if(payload.password) { payload.password = encrypt.encrypt(payload.password); }
            const hash = yield select(({ accountInfo}) => accountInfo.hash);
            payload = Object.assign(payload, {hashCode: hash});
            const { code, result, needGoogleCode, needIdentificationId } = yield call(POST, api.user.updatePassword, { ...payload });
            let type = yield select(({ accountInfo}) => accountInfo.type);
            if (code === 0) {
                if( type == 0 && result.needGoogleCode==undefined && result.needIdentificationId == undefined) {
                    yield put({
                        type: 'save',
                        payload: {
                            type: 2,
                            hash: result.hash
                        }
                    })
                } else if( type == 0 && (result.needGoogleCode || result.needIdentificationId) ) {
                    yield put({
                        type: 'save',
                        payload: {
                            type: 1,
                            needGoogleCode: result.needGoogleCode,
                            needIdentificationId: result.needIdentificationId,
                            hash: result.hash
                        }
                    })
                } else if( type == 1 ) {
                    yield put({
                        type: 'save',
                        payload: {
                            type: 2,
                            hash: result.hash
                        }
                    })
                } else if(type == 2) {
                    message.success("修改成功，请重新登录", 3);
                    yield put({
                        type: 'changeLoginStatus',
                        payload: {
                            currentAuthority: 'guest',
                        },
                    });
                    yield put({
                        type: 'save',
                        payload: {
                            type: 0,
                            hash: ''
                        }
                    })
                    reloadAuthorized();
                    yield put(
                        routerRedux.push({
                            pathname: '/user/login',
                        })
                    );
                }
                // if (result === 0) {
                //     message.success($('修改密码成功,请用新密码进行登录。'));
                //     yield put({
                //         type: 'changeLoginStatus',
                //         payload: {
                //             currentAuthority: 'guest',
                //         },
                //     });
                //     reloadAuthorized();
                //     yield put(
                //         routerRedux.push({
                //             pathname: '/user/login',
                //         })
                //     );
                // } else if (result === 1011) {
                //     message.error($('用户不存在。'));
                // } else if (result === 1001) {
                //     message.error($('验证码输入错误, 请重新提交。'));
                // }
            } else {
                message.error("修改错误,请检查后重新提交");
            }
        },
        *resetType({ payload }, { put}) {
            // debugger
            yield put({
                type: 'save',
                payload: {
                    type: 0,
                    hash: ''
                },
            });    
        },
        *update({ payload }, { put, call, select }) {
            let telephoneCheck = payload.telephoneCheck;
            if (telephoneCheck) {
                delete payload.telephoneCheck;
            }
            if (payload.accountPassword) {
                delete payload.passwordComf;
                let encrypt = new JSEncrypt();
                let publickKeyResponse = yield select(({ login }) => login.publickKeyResponse); //查询条件
                encrypt.setPublicKey(publickKeyResponse);
                payload.accountPassword = encrypt.encrypt(payload.accountPassword);
            }
            const { code, result } = yield call(POST, api.user.update, { ...payload });
            if (code == 0) {
                if (result.code == 0) {
                    let dataSource = yield select(({ accountInfo }) => accountInfo.dataSource); //查询条件
                    let addVisible = yield select(({ accountInfo }) => accountInfo.addVisible); //查询条件
                    let addVisibleCaptal = yield select(({ accountInfo }) => accountInfo.addVisibleCaptal); //查询条件
                    if(addVisibleCaptal){
                        message.success($('资金密码设置成功'));
                    }else{
                        message.success($('用户信息提交成功'));

                    }
                    if (telephoneCheck) {
                        yield put({
                            type: 'save',
                            payload: {
                                addVisibleTel: false,
                                addVisibleCaptal: false
                            },
                        })
                    }
                    if (addVisible || addVisibleCaptal) {
                        yield put({
                            type: 'save',
                            payload: {
                                addVisible: false,
                                addVisibleCaptal: false
                            },
                        })
                    }
                    yield put({
                        type: 'save',
                        payload: {
                            applyStatus: result.applyStatus,
                            dataSource: { ...dataSource, ...result }
                        },
                    });
                } else if (result.code == "1001") {
                    message.error($('验证码输入错误, 请重新提交。'));
                } else if (result.code == "1003") {
                    message.error($('黑名单限制, 请联系管理员。'));
                } else if (result.code == "1021") {
                    message.error($('google 验证码错误。'));
                } else if (result.code == "1011") {
                    message.error($('用户不存在, 请重新提交。'));
                } else if (result.code == "1022") {
                    message.error($('该邮邮箱已经绑定, 请使用其他邮箱绑定。'));
                } else if (result.code == "1023") {
                    message.error($('该手机号已绑定, 请使用其他手机号绑定。'));
                } else {
                    message.error($('验证失败 ,请重新提交。'));
                }
            } else {
                message.error($('身份信息更新失败, 请检查网络。'));
            }
        },
        *cancelGoogleCheck(_, { put, call, select }) {
            const { code, result } = yield call(POST, api.user.cancelGoogleCheck);
            if (code == 0) {
                if (result.code == "0") {
                    if(result.googleStatus == "0"){
                        message.success($('谷歌验证关闭成功'));
                    }else{
                        message.success($('谷歌验证开启成功'));
                    }
                    let dataSource = yield select(({ accountInfo }) => accountInfo.dataSource); //查询条件
                    yield put({
                        type: 'save',
                        payload: {
                            dataSource: { ...dataSource, ...result }
                        },
                    });
                } else if (result.code == "1031") {
                    message.error($('谷歌验证取消失败, 至少开启一种验证方式。'));
                } else if (result.code == "1011") {
                    message.error($('用户不存在, 请重新提交。'));
                }
                else {
                    message.error($('谷歌验证取消失败, 请检查网络。'));
                }
            }
        },
        *updateTelephone({ payload }, { put, call, select }) {
            const { code, result } = yield call(POST, api.user.updateTelephone, { ...payload });
            if (code == 0) {
                if (result.code == "0") {
                    if(result.telephone){
                        message.success($('手机验证开启成功'));
                    }else{
                        message.success($('手机验证关闭成功'));
                    }
                    let dataSource = yield select(({ accountInfo }) => accountInfo.dataSource); //查询条件
                    yield put({
                        type: 'save',
                        payload: {
                            dataSource: { ...dataSource, ...result }
                        },
                    });
                } else if (result.code == "1001") {
                    message.error($('验证码输入错误, 请重新提交。'));
                } else if (result.code == "1032") {
                    message.error($('手机验证取消失败, 至少开启一种验证方式。'));
                } else if (result.code == "1011") {
                    message.error($('用户不存在, 请重新提交。'));
                } else if (result.code == "1023") {
                    message.error($('该手机号已绑定, 请使用其他手机号绑定。'));
                } else {
                    message.error($('手机验证取消失败, 请检查网络。'));
                }
            }
        },
        *updateEmail({ payload }, { put, call, select }) {
            const { code, result } = yield call(POST, api.user.updateEmail, { ...payload });
            if (code == 0) {
                if (result.code == "0") {
                    message.success($('邮箱修改成功'));
                    let dataSource = yield select(({ accountInfo }) => accountInfo.dataSource); //查询条件
                    yield put({
                        type: 'save',
                        payload: {
                            dataSource: { ...dataSource, ...result },
                            addVisibleEmail: false
                        },
                    });
                } else if (result.code == "1001") {
                    message.error($('验证码输入错误, 请重新提交。'));
                } else if (result.code == "1011") {
                    message.error($('用户不存在, 请重新提交。'));
                } else if (result.code == "1022") {
                    message.error($('该邮箱已绑定, 请使用其他邮箱绑定。'));
                } else {
                    message.error($('邮箱修改失败, 请检查网络。'));
                }
            }
        },
        *cancelWithdrawal({ payload }, { put, call, select }) {
            const { code, result } = yield call(POST, api.user.cancelWithdrawal, { ...payload });
            let parames = yield select(({ margin }) => margin.parames); //查询条件
            if (code == 0) {
                if (result.code == "0") {
                    yield put({
                        type: "margin/findTransactionHistory",
                        payload:parames
                    })
                } else if (result.code == "1051") {
                    message.error($('提现记录状态异常, 提现撤销失败。'));
                } else if (result.code == "1052") {
                    message.error($('未找到提现记录, 提现撤销失败。'));
                } else {
                    message.error($('提现取消失败, 请检查网络。'));
                }
            }
        },
        *requestWithdrawal({ payload }, { put, call, select }) {
            let encrypt = new JSEncrypt();
            let publickKeyResponse = yield select(({ login }) => login.publickKeyResponse); //查询条件
            encrypt.setPublicKey(publickKeyResponse);
            if(payload.accountPassword){
                payload.accountPassword = encrypt.encrypt(payload.accountPassword);
            }
            const { code, result } = yield call(POSTAPI, api.user.requestWithdrawal, objKeySort({ ...payload }));
            if (code == 0) {
                if (result.code == "0") {
                    message.success($('提现成功'));
                } else if (result.code == "1041") {
                    message.error($('系统冻结提现, 请联系客服。'));
                } else if (result.code == "1042") {
                    message.error($('未找到对应币种信息, 请联系客服。'));
                } else if (result.code == "1043") {
                    message.error($('小于该币种最小提现额度设置, 提现失败。'));
                } else if (result.code == "1044") {
                    message.error($('小于该币种最小提现手续费设置, 提现失败。'));
                } else if (result.code == "1045") {
                    message.error($('用户资金密码错误, 提现失败。'));
                } else if (result.code == "1046") {
                    message.error($('用户资金密码未设置, 提现失败。'));
                } else if (result.code == "1047") {
                    message.error($('目标地址错误, 提现失败。'));
                } else if (result.code == "1048") {
                    message.error($('未找到API Key信息。'));
                } else if (result.code == "1049") {
                    message.error($('提现拒绝, 请进行身份验证。'));
                } else if (result.code == "2002") {
                    message.error($('请求参数格式错误。'));
                } else if (result.code == "2003") {
                    message.error($('非法的加密信息。'));
                }
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
        *searchStatement({ payload }, { put, call, select }) {
            const statementData = yield call(GETAPI, api.user.searchStatement, { ...payload });
            if (statementData.length >= 0) {
                yield put({
                    type: 'save',
                    payload: {
                        statementData
                    },
                });
            }else{
                message.error($('交易历史获取失败, 请检查网络。'));
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
        *findUserOperationLog({ payload }, { put, call, select }) {
            const { code, result } = yield call(POST, api.user.findUserOperationLog, { ...payload });
            if (code == 0) {
                if (result) {
                    yield put({
                        type: 'save',
                        payload: {
                            activeLogData: result,
                        },
                    });
                } else {
                    message.error($('获取日志信息失败, 请检查网络。'));
                }
            }
        },
        *findLatelyWithdraw(_, { put, call, select }) {
            const { code, result } = yield call(GET, api.user.findLatelyWithdraw);
            if (code == 0) {
                if (result) {
                    yield put({
                        type: 'save',
                        payload: {
                            latelyWithdraw: result,
                        },
                    });
                } else {
                    message.error($('充提数据获取失败, 请检查网络。'));
                }
            }
        },
        *findDepositAddress(_, { put, call, select }) {
            const { code, result } = yield call(GET, api.user.findDepositAddress);
            if (code == 0) {
                if (result) {
                    yield put({
                        type: 'save',
                        payload: {
                            depositAddress: result,
                        },
                    });
                } else {
                    message.error($('提现二维码获取失败, 请检查网络。'));
                }
            }
        },
        *findCurrencyInfo(_, { put, call, select }) {
            const { code, result } = yield call(GET, api.user.findCurrencyInfo);
            if (code == 0) {
                if (result) {
                    yield put({
                        type: 'save',
                        payload: {
                            currencyData: result,
                        },
                    });
                } else {
                    message.error($('币种数据获取失败, 请检查网络。'));
                }
            }
        },
        *findInvitationTop(_, { put, call, select }) {
            const { code, result } = yield call(GET, api.user.findInvitationTop);
            if (code == 0) {
                if (result) {
                    yield put({
                        type: 'save',
                        payload: {
                            myAdviceData: result,
                        },
                    });
                } else {
                    message.error($('邀请信息获取失败, 请检查网络。'));
                }
            }
        },
        *findUserInvitation({ payload }, { put, call, select }) {
            const { code, result } = yield call(POST, api.user.findUserInvitation, { ...payload });
            if (code == 0) {
                if (result) {
                    yield put({
                        type: 'save',
                        payload: {
                            myAdviceDataList: result,
                        },
                    });
                } else {
                    message.error($('邀请信息获取失败, 请检查网络。'));
                }
            }
        },
        *announcement(_, { put, call, select }) {
            const result = yield call(GET, api.public.announcement);
            if (!result.errorCode) {
                yield put({
                    type: 'save',
                    payload: {
                        announcementData: result,
                    },
                });
            } else {
                message.error($('获取用户公告失败。'));
            }
        },
        *apiKeyGet(_, { put, call, select }) {
            // const { code, result } = { code: 0, result: 0 };
            const { code, result } = yield call(GET, api.user.apiKey);
            if (code == 0) {
                if (result.length > 0) {
                    yield put({
                        type: 'save',
                        payload: {
                            apiData: result,
                        },
                    });
                }
                // else {
                //     message.error($('身份信息获取失败, 请检查网络.'));
                // }
            }
        },
        *apiKeyPost({ payload }, { put, call, select }) {
            // const { code, result } = { code: 0, result: 0 };
            let encrypt = new JSEncrypt();
            // encrypt.setPublicKey(encrypt.getPublicKey());
            let publickKey = encrypt.getPublicKey().replace("-----BEGIN PUBLIC KEY-----", "");
            publickKey = publickKey.replace("-----END PUBLIC KEY-----", "");
            publickKey = publickKey.replace(/\s+/g, "");
            payload.publicKey = publickKey;
            const { code, result } = yield call(POST, api.user.apiKey, { ...payload });
            if (code == 0) {
                if (result.code == 0) {
                    result.secretKey = encrypt.decrypt(result.secretKey);
                    yield put({
                        type: "accountInfo/apiKeyGet"
                    })
                    yield put({
                        type: 'save',
                        payload: {
                            addVisibleApi: false,
                            addVisibleApiShow: true,
                            currentApiData: result
                        },
                    });
                    let text = $("请好好存放你的密钥并在准备好的时候启用，确保你存放的地方是安全的！在你离开本页后将不会再看到此密钥。");
                    notificationSuccess($("成功创建API密钥"), "check-square", "orderList-notification-success", "#316e44", text);
                }
                else {
                    notificationError($("API密钥创建失败"), "API密钥创建失败", "warming");
                }
            }else{
                notificationError($("API密钥创建失败"), "API密钥创建失败", "warming");
            }
        },
        *apiKeyDisable({ payload }, { put, call, select }) {//停用
            const { code, result } = yield call(POST, api.user.apiKeyDisable, { ...payload });
            if (code == 0) {
                if (result.code == 0) {
                    let apiData = yield select(({ accountInfo }) => accountInfo.apiData); //查询条件
                    apiData = apiData.map((item) => {
                        if (item.keyId === payload.keyId) {
                            item.isActive = "0"
                        }
                        return item;
                    })
                    yield put({
                        type: 'save',
                        payload: {
                            apiData
                        },
                    });
                    let text = $("API密钥成功被停用。");
                    notificationSuccess($("已停用API密钥"), "check-square", "orderList-notification-success", "#316e44", text);
                } else {
                    notificationError($("API密钥停用失败"), "API密钥停用失败", "warming");
                }
            } else {
                notificationError($("API密钥停用失败"), "API密钥停用失败", "warming");
            }
        },
        *apiKeyEnable({ payload }, { put, call, select }) {//启用
            const { code, result } = yield call(POST, api.user.apiKeyEnable, { ...payload });
            if (code == 0) {
                if (result.code == 0) {
                    let apiData = yield select(({ accountInfo }) => accountInfo.apiData); //查询条件
                    apiData = apiData.map((item) => {
                        if (item.keyId === payload.keyId) {
                            item.isActive = "1";
                        }
                        return item;
                    })
                    yield put({
                        type: 'save',
                        payload: {
                            apiData
                        },
                    });
                    let text = "API密钥成功启用。";
                    notificationSuccess($("已启用API密钥"), "check-square", "orderList-notification-success", "#316e44", text);
                } else {
                    notificationError($("API密钥启用失败"), "API密钥启用失败", "warming");
                }
            } else {
                notificationError($("API密钥启用失败"), "API密钥启用失败", "warming");
            }
        },
        *apiKeyDelete({ payload }, { put, call, select }) {
            // const { code, result } = { code: 0, result: 0 };
            const { code, result } = yield call(DELETE, api.user.apiKey, { ...payload });
            if (code == 0) {
                if (result.code == 0) {
                    let apiData = yield select(({ accountInfo }) => accountInfo.apiData); //查询条件
                    apiData = apiData.filter(item => item.keyId !== payload.keyId)
                    yield put({
                        type: 'save',
                        payload: {
                            apiData
                        },
                    });
                    let text = "API密钥成功被删除。";
                    notificationSuccess($("已删除API密钥"), "check-square", "orderList-notification-success", "#316e44", text);
                } else {
                    notificationError($("API密钥删除失败"), "API密钥删除失败", "warming");
                }
            } else {
                notificationError($("API密钥删除失败"), "API密钥删除失败", "warming");
            }
        },
    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state,
                ...payload
            };
        },

    },

    subscriptions: {
        setup({ history, dispatch }) {
            return history.listen(({ pathname, search }) => {
                if (pathname.indexOf("account") !== -1) {
                    let arr = pathname.split("/");
                    if (pathname === "/account") {
                        dispatch({
                            type: "save",
                            payload: {
                                selectedKeys: ["account-capital"],
                                openKeys: ["account"]
                            }
                        })
                        dispatch(routerRedux.replace("/account/account-capital"))
                    } else {
                        let openKeys = arr[2].split("-");
                        dispatch({
                            type: "save",
                            payload: {
                                selectedKeys: [arr[2]],
                                openKeys: [openKeys[0]]
                            }
                        })
                    }
                }
            });
        },
    },
};
