/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:08:30 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2018-10-18 10:21:13
 */
import fetch from 'dva/fetch';
import { notification, message, language } from 'quant-ui';
// import { routerRedux } from 'dva/router';
import throttle from "lodash/throttle";
import store from '../index';
import { apiSecret, getApiKey } from './utils';
import { stringify } from 'qs';
const expires = parseInt(new Date().getTime() / 1000) + 120;
let $ = language.getLanguageData;
// let XAuthToken = "";
const codeMessage = {
    200: $('服务器成功返回请求的数据。'),
    201: $('新建或修改数据成功。'),
    202: $('一个请求已经进入后台排队（异步任务）。'),
    204: $('删除数据成功。'),
    400: $('发出的请求有错误，服务器没有进行新建或修改数据的操作。'),
    401: $('会话已过期，请重新登录。'),
    403: $('用户得到授权，但是访问是被禁止的。'),
    404: $('发出的请求针对的是不存在的记录，服务器没有进行操作。'),
    406: $('请求的格式不可得。'),
    410: $('请求的资源被永久删除，且不会再得到的。'),
    422: $('当创建一个对象时，发生一个验证错误。'),
    500: $('服务器发生错误，请检查服务器。'),
    502: $('网关错误。'),
    503: $('服务不可用，服务器暂时过载或维护。'),
    504: $('网关超时。'),
};

function parseJSON(response) {
    return response.json();
}
function checkStatus(response, showMessage) {
    if (response.headers.get('x-auth-token')) {
        window.localStorage.setItem("XAuthToken", response.headers.get('x-auth-token'))
    }
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const errortext = codeMessage[response.status] || response.statusText;
    showMessage && notification.error({
        message: `${$("请求错误")} ${response.status}: ${response.url}`,
        description: errortext,
    });
    const error = new Error(errortext);
    error.name = response.status;
    error.response = response;
    throw error;
}
const throttleShow = throttle(() =>{
    message.error($('会话已过期，请重新登录。'));
},10000);
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function request(url, newOptions, showMessage = false) {
    // console.log(`request url=${url} options=${JSON.stringify(newOptions)}`);
    return fetch(url, newOptions)
        .then((response) => checkStatus(response, showMessage))
        .then(parseJSON)
        .then(data => {
            if (!!data) {
                let resData = data;
                return resData;
            }
        })
        .catch(async e => {
            const status = e.name;
            const { dispatch } = store;
            // if (status === 500) {
            //     notification.error({
            //         message: `${$("请求错误")} ${status}`,
            //         description: codeMessage[status],
            //     });
            //     // dispatch(routerRedux.push('/exception/403'));
            //     return {
            //         errorCode: status,
            //     };
            // }
            if (status === 401 && url.indexOf('user/logout') === -1 && url.indexOf('user/register') === -1) {
                throttleShow();
                // dispatch(routerRedux.push('/user/login'));
                dispatch({
                    type: 'login/logoutSelf',
                });
                return {
                    errorCode: status,
                };
            }
            let text = '';
            let error = '';
            try {
                text = await e.response.text();
                error = JSON.parse(text).error.message;
            } catch (error) {
                // if (url.indexOf('user/getPublicKey') === -1) {
                //     message.error($('会话已过期，请重新登录。'));
                //     dispatch(routerRedux.push('/user/login'));
                //     dispatch({
                //         type: 'login/logoutSelf',
                //     });
                // }
                return {
                    errorCode: e.name,
                };
            }
            // if (status <= 504 && status >= 500) {
            //     dispatch(routerRedux.push('/user/login'));
            //     dispatch({
            //         type: 'login/logoutSelf',
            //     });
            //     window.location.reload()
            //     return {
            //         errorCode: status,
            //     };
            // }
            // if (status >= 404 && status < 422 && showMessage) {
            //     // dispatch(routerRedux.push('/exception/404'));
            //     return {
            //         errorCode: status,
            //     };
            // }
            // showMessage&&notification.error({
            //     message: e.message,
            // });
            return {
                errorCode: status,
                errorMsg: error
            }
        });
}

function GET(url, params, showMessage) {
    let requestHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'mode': "cors",
        'x-auth-token': window.localStorage.getItem("XAuthToken") || ""
    }
    let _params = !!params ? url + "?" + stringify(params) : url;
    return request(_params, {
        method: "GET",
        headers: requestHeader,
        credentials: 'include'
    }, showMessage)
}

/**
 * 观看代码人看到此处请不要吐槽前端开发，完全是被后台逼的
 */
/**
 * 
 * @param {string} url 请求地址
 * @param {any} params 请求参数
 * @param {Boolean} showMessage 是否显示错误提示，默认为false 
 */
// function POST(url, params, showMessage) {
//     let _params = { 'params': JSON.stringify(params) }
//     return request(url, {
//         method: "POST",
//         headers: requestHeader,
//         body: stringify(_params),
//         credentials: 'include',
//         'Accept': 'text/plain;',
//         'Content-Type': 'application/json',
//         'mode': "cors",
//     }, showMessage)
// }
function POST(url, params, showMessage) {
    let requestHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'mode': "cors",
        'x-auth-token': window.localStorage.getItem("XAuthToken") || ""
    }
    return request(url, {
        method: "POST",
        headers: requestHeader,
        body: JSON.stringify(params),
        credentials: 'include',
    }, showMessage)
}
function DELETE(url, params, showMessage) {
    let requestHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'mode': "cors",
        'x-auth-token': window.localStorage.getItem("XAuthToken") || ""
    }
    return request(url, {
        method: "DELETE",
        headers: requestHeader,
        body: JSON.stringify(params),
        credentials: 'include',
    }, showMessage)
}
/**
 * 
 * @param {string} url 请求地址
 * @param {any} params 请求参数
 * @param {Boolean} showMessage 是否显示错误提示，默认为false 
 */
async function POSTAPI(url, params, showMessage) {
    let apikey = await getApiKey();
    let verb = 'POST';
    // let _url = url.split("com");
    let _params = JSON.stringify(params);
    // console.log(`POSTAPI: apikey=${apikey}, url=${url}`);
    let signature = apiSecret(verb, expires, url, _params);
    // let signature = apiSecret(verb, expires, _url[1], _params);
    return request(url, {
        method: verb,
        headers: {
            'Accept': 'application/json;',
            'Content-Type': 'application/json',
            'mode': "cors",
            'api-expires': expires,
            'api-key': apikey,
            'api-signature': signature,
            'X-Requested-With': 'XMLHttpRequest',
            'x-auth-token': window.localStorage.getItem("XAuthToken") || ""
        },
        body: _params,
        credentials: 'include',
    }, showMessage)
}
/**
 * 
 * @param {string} url 请求地址
 * @param {any} params 请求参数
 * @param {Boolean} showMessage 是否显示错误提示，默认为false 
 */
async function PUTAPI(url, params, showMessage) {
    let apikey = await getApiKey();
    let verb = 'PUT';
    // let _url = url.split("com");
    let _params = JSON.stringify(params);
    let signature = apiSecret(verb, expires, url, _params);
    // let signature = apiSecret(verb, expires, _url[1], _params);
    return request(url, {
        method: verb,
        headers: {
            'Accept': 'application/json;',
            'Content-Type': 'application/json',
            'mode': "cors",
            'api-expires': expires,
            'api-key': apikey,
            'api-signature': signature,
            'X-Requested-With': 'XMLHttpRequest',
            'x-auth-token': window.localStorage.getItem("XAuthToken") || ""
        },
        body: _params,
        credentials: 'include',
    }, showMessage)
}
/**
 * 
 * @param {string} url 请求地址
 * @param {any} params 请求参数
 * @param {Boolean} showMessage 是否显示错误提示，默认为false 
 */
async function GETAPI(url, params, showMessage) {
    let apikey = await getApiKey();
    // console.log(`GETAPI: apikey=${apikey}, url=${url}`);
    let verb = 'GET';
    // let _url = url.split("com");
    if (params && params.columns) {
        params.columns = JSON.stringify(params.columns);
    }
    let _params = (!!params) ? "?" + stringify(params) : "";
    let signature = apiSecret(verb, expires, url + _params, '');
    // let signature = apiSecret(verb, expires, _url[1] + _params, '');
    return request(url + _params, {
        method: verb,
        headers: {
            'Accept': 'application/json;',
            'Content-Type': 'application/json',
            'mode': "cors",
            'api-expires': expires,
            'api-key': apikey,
            'api-signature': signature,
            'X-Requested-With': 'XMLHttpRequest',
            'x-auth-token': window.localStorage.getItem("XAuthToken") || ""
        },
        credentials: 'include',
    }, showMessage)
}
/**
 * 
 * @param {string} url 请求地址
 * @param {any} params 请求参数
 * @param {Boolean} showMessage 是否显示错误提示，默认为false 
 */
async function DELETEAPI(url, params, showMessage) {
    let apikey = await getApiKey();
    let verb = 'DELETE';
    let _params = JSON.stringify(params);
    // let _url = url.split("com");
    let signature = apiSecret(verb, expires, url, _params);
    // let signature = apiSecret(verb, expires, _url[1], _params);
    return request(url, {
        method: verb,
        headers: {
            'Accept': 'application/json;',
            'Content-Type': 'application/json',
            'mode': "cors",
            'api-expires': expires,
            'api-key': apikey,
            'api-signature': signature,
            'X-Requested-With': 'XMLHttpRequest',
            'x-auth-token': window.localStorage.getItem("XAuthToken") || ""
        },
        body: _params,
        credentials: 'include',
    }, showMessage)
}
function UploadMethod(url, params, showMessage) {
    return request(url, {
        method: "POST",
        body: params,
        credentials: "include"
    }, showMessage).then(resData => {
        let data = resData.data;
        if (!!data) {
            if (data.errorCode > 100) {
                message.error(data.errorMsg)
            } else {
                message.success(data.errorMsg)
            }
            return data
        }
        return resData
    })
}
function Download(url, fileName, type, entity, params) {
    var argsCount = arguments.length;
    if (argsCount < 4) {
        throw new Error('call export with wrong params.');
    }

    // var params = params;

    var requestParams = {
        args: JSON.stringify(params),
        fileName: fileName,
        type: type,
        entity: JSON.stringify(entity)
    }

    var frameName = "downloadFrame_" + Math.floor(Math.random() * 1000);
    var iframe = document.createElement("iframe");
    iframe.name = frameName;
    iframe.style.display = "none";

    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "params";
    input.value = JSON.stringify(requestParams);

    var form = document.createElement("form");
    form.target = frameName;
    form.method = "POST";
    form.action = url;
    form.style.display = "none";

    form.appendChild(input);
    iframe.appendChild(form);

    document.body.appendChild(iframe);
    form.submit();
}
export { GET };
export { POST };
export { DELETE };
export { Download };
export { POSTAPI };
export { GETAPI };
export { PUTAPI };
export { DELETEAPI };
export { UploadMethod };

