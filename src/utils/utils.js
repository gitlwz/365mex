/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:06:22 
 * @Last Modified by: 刘文柱
 * @Last Modified time: 2018-10-18 10:08:22
 */
import moment from 'moment';
import React, { Component } from 'react'
import { parse, stringify } from 'qs';
import { notification, Icon, language } from 'quant-ui';
import { message } from 'antd';
import { Formula } from '@/utils/formula';
import { inMarketOrStop, getTradeStatus, inShowClear } from '@/utils/dictionary';
import { JSEncrypt } from 'jsencrypt';
import { POST } from './request.js';
import api from '../services/api.js';
import './utils.less';
let { getLanguageData } = language;
let $ = getLanguageData;
notification.config({
    placement: "bottomRightval",
});
const FormulaFuc = new Formula();//成本计算公式
let crypto = require('crypto');
let API_KEY = "";
let API_SECRET = "";
let PublickKey = "";
let PrivateKey = "";
let notificationKey = "firstNotificationKey";
// let API_KEY = "vOLgxEOiHL8CStkriDELqrTg";
// let API_SECRET = "j81PKZ56QzhPZ59WbzKHEZ7c7mNNBC36x84l7mzrU3keXD3u";
// let API_KEY = "kMwBmB2svhheg0_U61rVaqoY";
// let API_SECRET = "5XHdyjdY_ux25_aM6PAw6xcL7fBbmujopDG2JJXhF2HIoHmj";
let currencyType = [{
    key: "XBt",
    label: "XBt (Satoshi)",
    value: 100000000,
    tick: 0,
    tickTwo: 0
}, {
    key: "μXBT",
    label: "μXBT (micro-Bitcoin)",
    value: 1000000,
    tick: 1,
    tickTwo: 2
}, {
    key: "mXBT",
    label: "mXBT (milli-Bitcoin)",
    value: 1000,
    tick: 3,
    tickTwo: 5
}, {
    key: "XBT",
    label: "XBT (Bitcoin)",
    value: 1,
    tick: 4,
    tickTwo: 8
}];
export function getCurrencyType() {
    let item = currencyType.find(item => item.key === window.localStorage.getItem("currencyType"));
    return item || {
        key: "XBt",
        label: "XBt (Satoshi)",
        value: 100000000,
        tick: 0,
        tickTwo: 0
    };
}

export function toLowPrice(value) {
    try {
        let arr = value.toString().split(".");
        if (arr.length === 2) {
            let num = "0." + arr[1];
            if (num > 0.5) {
                if (Number(arr[0]) > 0) {
                    return (Number(arr[0]) + 0.5);
                } else {
                    return (Number(arr[0]) - 0.5);
                }
            } else if (num < 0.5) {
                return Number(arr[0]);
            } else {
                return value;
            }
        } else {
            return value;
        }
    } catch (error) {
        return value;
    }
}
export function toUpPrice(value) {
    try {
        let arr = value.toString().split(".");
    if (arr.length === 2) {
        let num = "0." + arr[1];
        if (num > 0.5) {
            return (Number(arr[0]) + 1);
        } else {
            return (Number(arr[0]) + 0.5);
        }
    } else {
        return value;
    }
    } catch (error) {
        return value;
    }
}

export function fixedZero(val) {
    return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;

    if (type === 'today') {
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        return [moment(now), moment(now.getTime() + (oneDay - 1000))];
    }

    if (type === 'week') {
        let day = now.getDay();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);

        if (day === 0) {
            day = 6;
        } else {
            day -= 1;
        }

        const beginTime = now.getTime() - day * oneDay;

        return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
    }

    if (type === 'month') {
        const year = now.getFullYear();
        const month = now.getMonth();
        const nextDate = moment(now).add(1, 'months');
        const nextYear = nextDate.year();
        const nextMonth = nextDate.month();

        return [
            moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
            moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
        ];
    }

    if (type === 'year') {
        const year = now.getFullYear();

        return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
    }
}

export function getPlainNode(nodeList, parentPath = '') {
    const arr = [];
    nodeList.forEach(node => {
        const item = node;
        item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
        item.exact = true;
        if (item.children && !item.component) {
            arr.push(...getPlainNode(item.children, item.path));
        } else {
            if (item.children && item.component) {
                item.exact = false;
            }
            arr.push(item);
        }
    });
    return arr;
}

function accMul(arg1, arg2) {
    let m = 0;
    const s1 = arg1.toString();
    const s2 = arg2.toString();
    m += s1.split('.').length > 1 ? s1.split('.')[1].length : 0;
    m += s2.split('.').length > 1 ? s2.split('.')[1].length : 0;
    return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / 10 ** m;
}

export function digitUppercase(n) {
    const fraction = ['角', '分'];
    const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟', '万']];
    let num = Math.abs(n);
    let s = '';
    fraction.forEach((item, index) => {
        s += (digit[Math.floor(accMul(num, 10 * 10 ** index)) % 10] + item).replace(/零./, '');
    });
    s = s || '整';
    num = Math.floor(num);
    for (let i = 0; i < unit[0].length && num > 0; i += 1) {
        let p = '';
        for (let j = 0; j < unit[1].length && num > 0; j += 1) {
            p = digit[num % 10] + unit[1][j] + p;
            num = Math.floor(num / 10);
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }

    return s
        .replace(/(零.)*零元/, '元')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
    if (str1 === str2) {
        console.warn('Two path are equal!'); // eslint-disable-line
    }
    const arr1 = str1.split('/');
    const arr2 = str2.split('/');
    if (arr2.every((item, index) => item === arr1[index])) {
        return 1;
    } else if (arr1.every((item, index) => item === arr2[index])) {
        return 2;
    }
    return 3;
}

function getRenderArr(routes) {
    let renderArr = [];
    renderArr.push(routes[0]);
    for (let i = 1; i < routes.length; i += 1) {
        // 去重
        renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
        // 是否包含
        const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
        if (isAdd) {
            renderArr.push(routes[i]);
        }
    }
    return renderArr;
}

function changeNotificationKey() {
    switch (notificationKey) {
        case "firstNotificationKey":
            notificationKey = "secondNotificationKey";
            break;
        case "secondNotificationKey":
            notificationKey = "thirdNotificationKey";
            break;
        case "thirdNotificationKey":
            notificationKey = "fourNotificationKey";
            break;
        case "fourNotificationKey":
            notificationKey = "firstNotificationKey";
            break;
        default:
            notificationKey = "firstNotificationKey";
            break;
    }
    try {
        notification.close(notificationKey)
    } catch (error) {

    }
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
    let routes = Object.keys(routerData).filter(
        routePath => routePath.indexOf(path) === 0 && routePath !== path
    );
    // Replace path to '' eg. path='user' /user/name => name
    routes = routes.map(item => item.replace(path, ''));
    // Get the route to be rendered to remove the deep rendering
    const renderArr = getRenderArr(routes);
    // Conversion and stitching parameters
    const renderRoutes = renderArr.map(item => {
        const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
        return {
            exact,
            ...routerData[`${path}${item}`],
            key: `${path}${item}`,
            path: `${path}${item}`,
        };
    });
    return renderRoutes;
}

export function getPageQuery() {
    return parse(window.location.href.split('?')[1]);
}
export function getTickLength(tickSize) {
    let tickSizeT = tickSize || 0.5;
    let num = tickSizeT.toString().split(".");
    if (num.length == 2) {
        return num[1].length;
    } else {
        return 0;
    }

}

export function getQueryPath(path = '', query = {}) {
    const search = stringify(query);
    if (search.length) {
        return `${path}?${search}`;
    }
    return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
    return reg.test(path);
}

export async function getApiKey() {
    if (API_KEY) {
        return API_KEY;
    }
    let encrypt = new JSEncrypt();
    let publickKey = encrypt.getPublicKey().replace("-----BEGIN PUBLIC KEY-----", "");
    publickKey = publickKey.replace("-----END PUBLIC KEY-----", "");
    publickKey = publickKey.replace(/\s+/g, "");
    setPublickKey(publickKey);
    setPrivateKey(encrypt.getPrivateKey());
    const { code, result } = await POST(api.user.getUserSysApiKey, getPublickKey(), false);
    if (code == 0) {
        if (result.code == "0") {
            // encrypt.setPrivateKey(getPrivateKey());
            let secret = encrypt.decrypt(result.secret);
            setApiKey(result.apiKey)
            setApiSecret(secret)
        } else if (result.code == "1013") {
            message.error($('获取不到默认APIKey。'));
        }
    }
    return API_KEY;
}
export function getApiSecret() {
    return API_SECRET;
}
export function setApiKey(apiKey) {
    API_KEY = apiKey;
}
export function setApiSecret(apiSecret) {
    API_SECRET = apiSecret
}
export function getPublickKey() {
    return PublickKey;
}
export function getPrivateKey() {
    return PrivateKey;
}
export function setPublickKey(publickKey) {
    PublickKey = publickKey;
}
export function setPrivateKey(privateKey) {
    PrivateKey = privateKey;
}
export function notificationShow(obj, title, icon, className, color, text) {
    notification.open({
        key: notificationKey,
        duration: 10,
        message: <div style={{ width: "100%", color: color }}>
            <div style={{ fontWeight: 600, float: "left" }}>
                <Icon type={icon} theme="filled" />
                <span style={{ marginLeft: 5 }}>{title}:</span>
            </div>
            <div className="notification">
                {moment(obj.timestamp).format("a HH:mm:ss")}
            </div>
        </div>,
        description: <div>
            {text}<br />
            {obj.orderID?("orderID:" + obj.orderID):''}
        </div>,
        className: className
    });
    changeNotificationKey()
}
export function notificationError(title, text, icon, orderID) {
    notification.open({
        key: notificationKey,
        duration: 10,
        message: <div style={{ width: "100%", color: "#E34E4D", background: "#faded6" }}>
            <div style={{ fontWeight: 600, float: "left" }}>
                <Icon type={icon} />
                <span style={{ marginLeft: 5 }}>{title}</span>
            </div>
            <div className="notification">
                {moment(new Date().getTime()).format("a HH:mm:ss")}
            </div>
        </div>,
        description: <div style={{ fontSize: 12 }}>
            {text}<br />
            {orderID?("orderID:" + orderID):''}
        </div>,
        className: "orderList-notification-error",
    });
    changeNotificationKey()
}

export function notificationSuccess(title, icon, className, color, text, orderID) {
    notification.open({
        key: notificationKey,
        duration: 10,
        message: <div style={{ width: "100%", color: '#24B36B' }}>
            <div style={{ fontWeight: 600, float: "left" }}>
                <Icon type={icon} theme="filled" />
                <span style={{ marginLeft: 5 }}>{title}: </span>
            </div>
            <div className="notification">
                {moment(new Date().getTime()).format("a HH:mm:ss")}
            </div>
        </div>,
        description: <div style={{ fontSize: 12 }}>
            {text}<br />
            {orderID?("orderID:" + orderID):''}
        </div>,
        className: className,
    });
    changeNotificationKey()
}

export function apiSecret(VERB, expires, path, data) {
    var string = VERB + path + expires + data;
    var signature = crypto.createHmac('sha256', API_SECRET).update(string).digest('hex');
    return signature;
}

export function getAuthKeyExpires({
    VERB = 'GET',
    ENDPOINT = '/api/v1/signature',
    expires = Math.round(new Date().getTime() / 1000) + 120 } = {}) {
    let signature = crypto.createHmac('sha256', API_SECRET).update(VERB + ENDPOINT + expires).digest('hex');
    return { API_KEY, expires, signature };
}
export function tooltipShow(value, title, fontSize) {
    if (title) {
        return <div style={{ fontSize: 14 }}>
            <div className="fontWeightTitle">{title}</div>
            <div style={{ fontSize: 12 }}>{value}</div>
        </div>;
    } else if (title === false) {
        return value;
    } else {
        return <div dangerouslySetInnerHTML={{ __html: value }} style={{ fontSize: fontSize ? fontSize : 12 }}>
        </div>
    }
}
//多语言参数翻译
export function translationParameters(params = [], message = "") {
    return message.replace(/\{(\d+)\}/g, function (m, i) {
        return params[i]
    })
}
export function getLanguageKey(key) {
    switch (key) {
        case "zh_CN":
            return "cn";
        case "en_US":
            return "en";
        default:
            return "cn";
    }
}
export function showLastTickDirection(lastTickDirection) {
    let icon = 'arrow-up';
    switch (lastTickDirection) {
        case 'ZeroPlusTick':
            icon = 'caret-up';
            break;
        case 'ZeroMinusTick':
            icon = 'caret-down';
            break;
        case 'PlusTick':
            icon = 'arrow-up';
            break;
        case 'MinusTick':
            icon = 'arrow-down';
            break;
        default:
            icon = '';
            break;
    }
    return icon;
}
export function checkJsonString(str) {
    try {
        if (str == '{}' || typeof str == 'string') {
            return false
        }
        if (typeof str == 'object') {
            str = JSON.stringify(str)
        }
        if (typeof JSON.parse(str) == "object") {
            return true;
        }
    } catch (e) {
        // console.log(e);
    }
    return false;
}

export function isJsonString(str) {
    try {
        if (str == '{}') {
            return false
        }
        if (typeof str == 'object') {
            str = JSON.stringify(str)
        }
        if (typeof JSON.parse(str) == "object") {
            return true;
        }
    } catch (e) {
        // console.log(e);
    }
    return false;
}
export function sortByString(strA, strB) {
    var stringA = strA.toUpperCase();
    var stringB = strB.toUpperCase();
    if (stringA < stringB) {
        return -1;
    }
    if (stringA > stringB) {
        return 1;
    }
    return 0;
}
export function sortHideFunction(a, b, sortUpOrLow, changeKey, instrumentData) {
    let value = 0;
    if (sortUpOrLow === 'ascend') {
        value = 1;
    } else if (sortUpOrLow === "descend") {
        value = -1
    } else {
        value = 0;
    }
    switch (changeKey) {
        case 'ordStatus':
            let statusA = getTradeStatus(a.ordStatus);
            let statusB = getTradeStatus(b.ordStatus);
            if (inMarketOrStop(a.ordType) && !inShowClear(a.ordStatus)) {
                if (a.triggered === "" || !a.triggered) {
                    statusA = $('未触发')
                } else if (a.triggered === 'StopOrderTriggered') {
                    statusA = $('已触发')
                }
            }
            if (inMarketOrStop(b.ordType) && !inShowClear(b.ordStatus)) {
                if (b.triggered === "" || !b.triggered) {
                    statusB = $('未触发')
                } else if (a.triggered === 'StopOrderTriggered') {
                    statusB = $('已触发')
                }
            }
            return sortByString(statusA, statusB) * value;
        case 'ordType':
        case 'orderID':
            return sortByString(a[changeKey], b[changeKey]) * value;
        case 'homeNotional':
            let pricea = a.price || a.stopPx;
            let priceb = b.price || b.stopPx;
            return ((1 / pricea) * a.orderQty - (1 / priceb) * b.orderQty) * value
        case 'stopPriceLength':
            let price1 = 0;
            let price2 = 0;
            if (instrumentData) {
                price1 = instrumentData.lastPrice - a.stopPx;
                price2 = instrumentData.lastPrice - b.stopPx;
            }
            return (price1 - price2) * value;
        case 'orderQty':
            return (Math.abs(a[changeKey]) - Math.abs(b[changeKey])) * value
        default:
            return (a[changeKey] - b[changeKey]) * value
    }
}
export function getMarginRequirement(instrumentData, positionHold, payload, buy, orderQty, margin) {//计算成本
    let price = payload.price;
    if (instrumentData.symbol && positionHold) {
        if (buy) {
            if (payload.ordType === "Stop" || payload.ordType === "MarketIfTouched" || payload.ordType === "Market") {
                price = instrumentData.askPrice;
            }
        } else {
            if (payload.ordType === "Stop" || payload.ordType === "MarketIfTouched" || payload.ordType === "Market") {
                price = instrumentData.bidPrice;
            }
        }
        return FormulaFuc.getMarginRequirement(instrumentData, positionHold, buy ? orderQty * 1 : -orderQty * 1, price * 1, margin);
    } else {
        return 0;
    }
}
export function getLiquidationPrice(instrumentData, positionHold, dataSource, _commitData, flag, orderQtyPos) {//计算强平 flag true 为Sell
    let liqPrice = _commitData.price;
    let orderQty = _commitData.orderQty || orderQtyPos;
    if (instrumentData.symbol && positionHold) {
        if (flag) {
            orderQty = -orderQty * 1;
            if (_commitData.ordType === "Market" || _commitData.ordType === "stop" || _commitData.ordType === "MarketIfTouched") {
                liqPrice = instrumentData.bidPrice;
            }
        } else {
            if (_commitData.ordType === "Market" || _commitData.ordType === "stop" || _commitData.ordType === "MarketIfTouched") {
                liqPrice = instrumentData.askPrice;
            }
        }
        return FormulaFuc.getLiquidationPrice(instrumentData, positionHold, dataSource, orderQty * 1, liqPrice * 1, positionHold.leverage);
    }
}
export function getColumsLength(Colums) {
    let ColumsLength = [];
    let all = 0;

    for (let value of Colums) {
        let len = 0;
        for (var i = 0; i < value.length; i++) {
            var c = value.charCodeAt(i);
            //单字节加1 
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                len += 7.8;
            }
            else {
                len += 13.3;
            }
        }
        all += len;
        ColumsLength.push(len);
    }
    for (let index in ColumsLength) {
        ColumsLength[index] = (ColumsLength[index] / all);
    }
    return ColumsLength;
}
export function findeMaxLength(orderListData) {

}
export function setAllTradeLocalSetting(key, value) {
    let obj = getAllTradeLocalSetting();
    obj[key] = value;
    window.localStorage.setItem("allTradeLocalSetting", JSON.stringify(obj));
}
export function getAllTradeLocalSetting(allTradeLocalSetting) {
    let value = window.localStorage.getItem("allTradeLocalSetting");
    if (value) {
        return JSON.parse(value);
    } else {
        return {};
    }
}
export function isNaNData(value) {
    if (isNaN(value)) {
        return 0;
    } else {
        return value;
    }
}


