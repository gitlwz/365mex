import { routerRedux } from 'dva/router';
import { setAuthority, setUserUserlogin, setUserUserInfo, removeUserUserlogin } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
import { setApiKey, setApiSecret, getAllTradeLocalSetting } from '../utils/utils';
import { message } from 'antd';
import { POST, GET } from '../utils/request';
import api from '../services/api.js';
import { JSEncrypt } from 'jsencrypt';
import { language } from 'quant-ui';
let { getLanguageData } = language;
let $ = getLanguageData;
let remember = !window.localStorage.getItem("qdp-remember") ? true : JSON.parse(window.localStorage.getItem("qdp-remember"))
const allTradeLocalSetting = getAllTradeLocalSetting();
const encryptSend = (encrypt, publickKey, publickKeyResponse, payload) => {
    let obj = { ...payload }
    encrypt.setPublicKey(publickKeyResponse);
    obj.password = encrypt.encrypt(obj.password);
    // obj.publicKey = encrypt.encryptLong(publickKey);
    obj.publicKey = publickKey;
    return obj;
}
export default {
    namespace: 'login',
    state: {
        remember: remember,
        addVisible: false,
        publickKey: "",//前端公钥
        privateKey: "",//前端秘钥
        publickKeyResponse: "",//后端公钥
        showPlusMult: allTradeLocalSetting.showPlusMult || false,//显示+/-按钮
        moveRight: allTradeLocalSetting.moveRight || "",//移动侧边栏
        hideSlider: allTradeLocalSetting.hideSlider || false,//隐藏侧边栏
        showReConecting: false,
        unTradeUserStatus: false,
        fullOrSmall:false,
        showAlert:false,
        orderListWidth:false,//委托列表宽度是否显示为最小化
    },

    effects: {
        *login({ payload }, { call, put, select }) {
            let _payload = {};
            let publickKeyResponse = yield select(({ login }) => login.publickKeyResponse); //查询条件
            if (publickKeyResponse === "" || !publickKeyResponse) {
                const { code, result } = yield call(POST, api.user.getPublicKey);
                if (code === 0) {
                    yield put({
                        type: 'save',
                        payload: {
                            publickKeyResponse: result,
                        },
                    });
                }
                publickKeyResponse = result; //查询条件
            }
            let publickKey = yield select(({ login }) => login.publickKey); //查询条件
            let privateKey = yield select(({ login }) => login.privateKey); //查询条件
            let encrypt = new JSEncrypt();
            _payload = encryptSend(encrypt, publickKey, publickKeyResponse, payload);
            const { code, result } = yield call(POST, api.user.login, { ..._payload });
            // const { code, result } = { code: 0, result: { code: 0 } };
            if (code == 0) {
                if (result.code == 0) {
                    setUserUserInfo(payload.email || payload.telephone);
                    message.success($('登录成功'));
                    encrypt.setPrivateKey(privateKey);
                    let secret = encrypt.decrypt(result.secret);
                    setApiKey(result.apiKey);
                    setApiSecret(secret);
                    const response = {
                        status: 'ok',
                        currentAuthority: 'admin',
                    };
                    yield put({
                        type: 'changeLoginStatus',
                        payload: response,
                    });
                    yield put({
                        type: 'accountInfo/save',
                        payload: result.applyStatus,
                    });
                    if (response.status === 'ok') {
                        let remember = yield select(({ login }) => login.remember)
                        if (!!remember) {
                            setUserUserlogin(payload)
                        } else {
                            removeUserUserlogin();
                        }
                        reloadAuthorized();
                        // 登陆成功跳转到首页
                        const urlParams = new URL(window.location.href);
                        window.location.href = urlParams.origin + "/transaction/XBTUSD";
                        // yield put(
                        //     routerRedux.push({
                        //         pathname: '/transaction/XBTUSD',
                        //     })
                        // );
                    }
                } else if (result.code == 1011) {//账户错误
                    message.error($('用户不存在，请重新输入。'));
                } else if (result.code == 1012) {//密码错误
                    message.error($('用户密码错误，请重新输入。'));
                } else if (result.code == 1013) {//密码错误
                    message.error($('获取不到默认APIKey，请联系客服。'));
                } else if (result.code == 1014) {//密码错误
                    message.error($('账号被冻结，请联系客服。'));
                }
            } else {
                message.error($('服务器检查失败, 请检查网络。'));
            }
        },
        *logoutSelf(_, { put, call, select }) {
            const urlParams = new URL(window.location.href);
            yield put({
                type: 'changeLoginStatus',
                payload: {
                    currentAuthority: 'guest',
                },
            });
            reloadAuthorized();
            yield put(
                routerRedux.push({
                    pathname: '/user/login',
                })
            );
            // window.location.reload()
            window.localStorage.setItem("qtCoin_LoginID", null);
        },
        *logout(_, { put, call, select }) {
            const urlParams = new URL(window.location.href);
            let currentAuthority = yield select(({ login }) => login.currentAuthority); //查询条件
            if (currentAuthority === 'guest') {
                return;
            }
            const { code, result } = yield call(POST, api.user.loginOut);
            if (code === 0) {
                if (result === 0) {
                    yield put({
                        type: 'changeLoginStatus',
                        payload: {
                            currentAuthority: 'guest',
                        },
                    });
                    reloadAuthorized();
                    yield put(
                        routerRedux.push({
                            pathname: '/user/login',
                        })
                    );
                    // window.location.href = urlParams.origin + "/user/login"
                    // setTimeout(()=>{window.location.reload();},0)
                    // window.location.reload()
                    window.localStorage.setItem("qtCoin_LoginID", null);
                } else {
                    message.error($('用户名登出失败，请检查网络。'));
                }
            } else {
                yield put({
                    type: 'changeLoginStatus',
                    payload: {
                        currentAuthority: 'guest',
                    },
                });
                reloadAuthorized();
                yield put(
                    routerRedux.push({
                        pathname: '/user/login',
                    })
                );
                // window.location.href = urlParams.origin + "/user/login"
                window.location.reload()
                // yield put(
                //     routerRedux.push({
                //         pathname: '/user/login',
                //     })
                // );
                window.localStorage.setItem("qtCoin_LoginID", null);
            }
        },
        *getPublicKey(_, { put, call, select }) {
            let publickKeyResponse = yield select(({ login }) => login.publickKeyResponse); //查询条件
            if (publickKeyResponse !== "" && publickKeyResponse) {
                return;
            }
            let encrypt = new JSEncrypt();
            let publickKey = encrypt.getPublicKey().replace("-----BEGIN PUBLIC KEY-----", "");
            publickKey = publickKey.replace("-----END PUBLIC KEY-----", "");
            publickKey = publickKey.replace(/\s+/g, "");
            yield put({
                type: 'save',
                payload: {
                    publickKey: publickKey,
                    privateKey: encrypt.getPrivateKey(),
                },
            });
            const { code, result } = yield call(POST, api.user.getPublicKey);
            if (code === 0) {
                yield put({
                    type: 'save',
                    payload: {
                        publickKeyResponse: result,
                    },
                });
            }
            else {
                message.error($('请检查网络。'));
            }
        },
        // *getUserSysApiKey(_, { put, call }) {
        //     let authority = localStorage.getItem('antd-pro-authority');
        //     if (authority === "guest") {
        //         return;
        //     }
        //     let encrypt = new JSEncrypt();
        //     let publickKey = encrypt.getPublicKey().replace("-----BEGIN PUBLIC KEY-----", "");
        //     publickKey = publickKey.replace("-----END PUBLIC KEY-----", "");
        //     publickKey = publickKey.replace(/\s+/g, "");
        //     yield put({
        //         type: 'save',
        //         payload: {
        //             publickKey: publickKey,
        //             privateKey: encrypt.getPrivateKey(),
        //         },
        //     });
        //     const { code, result } = yield call(POST, api.user.getUserSysApiKey, publickKey);
        //     if (code == 0) {
        //         if (result.code == "0") {
        //             encrypt.setPrivateKey(encrypt.getPrivateKey());
        //             let secret = encrypt.decrypt(result.secret);
        //             setApiKey(result.apiKey)
        //             setApiSecret(secret)
        //             yield put({
        //                 type: 'getPublicKey'
        //             });
        //         } else if (result.code == "1013") {
        //             message.error($('获取不到默认APIKey。'));
        //         }
        //     } else {
        //         let authority = localStorage.getItem('antd-pro-authority');
        //         if (authority === "admin") {
        //             message.error($('会话已过期，请重新登录。'));
        //             yield put({
        //                 type: 'changeLoginStatus',
        //                 payload: {
        //                     currentAuthority: 'guest',
        //                 },
        //             });
        //             reloadAuthorized();
        //             yield put(
        //                 routerRedux.push({
        //                     pathname: '/user/login',
        //                 })
        //             );
        //         }
        //     }
        // },
        *getUserSysApiKey(_, { put, call }) {
            let authority = localStorage.getItem('antd-pro-authority');
            if (authority === "guest") {
                return;
            }
            let encrypt = new JSEncrypt();
            let publickKey = encrypt.getPublicKey().replace("-----BEGIN PUBLIC KEY-----", "");
            publickKey = publickKey.replace("-----END PUBLIC KEY-----", "");
            publickKey = publickKey.replace(/\s+/g, "");
            yield put({
                type: 'save',
                payload: {
                    publickKey: publickKey,
                    privateKey: encrypt.getPrivateKey(),
                },
            });
            const { code, result } = yield call(POST, api.user.getUserSysApiKey, publickKey);
            if (code == 0) {
                if (result.code == "0") {
                    encrypt.setPrivateKey(encrypt.getPrivateKey());
                    let secret = encrypt.decrypt(result.secret);
                    setApiKey(result.apiKey)
                    setApiSecret(secret)
                    yield put({
                        type: 'getPublicKey'
                    });
                } else if (result.code == "1013") {
                    message.error($('获取不到默认APIKey。'));
                }
            } else {
                let authority = localStorage.getItem('antd-pro-authority');
                if (authority === "admin") {
                    message.error($('会话已过期，请重新登录。'));
                    yield put({
                        type: 'changeLoginStatus',
                        payload: {
                            currentAuthority: 'guest',
                        },
                    });
                    reloadAuthorized();
                    yield put(
                        routerRedux.push({
                            pathname: '/user/login',
                        })
                    );
                }
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
        changeLoginStatus(state, { payload }) {
            setAuthority(payload.currentAuthority);
            return {
                ...state,
                type: payload.type,
            };
        },
        changeCheckbox(state, { payload }) {
            window.localStorage.setItem("qdp-remember", JSON.stringify(payload.remember))
            return {
                ...state,
                ...payload
            };
        }
    },
};
