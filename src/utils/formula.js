import memoize from "lodash/memoize";
import toPairs from "lodash/toPairs";
import keys from "lodash/keys";
import isFinite from "lodash/isFinite";
import sortedIndexBy from "lodash/sortedIndexBy";
import { getNewLiquidation } from "./formulaLiquidation";
import { getMarginRequirement } from "./formulaMargin";

let l = /((\d+) XBt)/;
let f = {
    XBt: {
        multiplier: 1,
        tickLog: 0,
        longName: "Satoshi"
    },
    "μXBT": {
        multiplier: 100,
        tickLog: 1,
        longName: "micro-Bitcoin"
    },
    mXBT: {
        multiplier: 1e5,
        tickLog: 3,
        longName: "milli-Bitcoin"
    },
    XBT: {
        multiplier: 1e8,
        tickLog: 4,
        longName: "Bitcoin"
    }
};
let s = {
    PRIMARY_CURRENCY: "XBt",
}
let p = /e-(\d+)$/i;

/**
 * decimalPlaces
 * @param {*} e 
 */
function h(e) {
    "string" != typeof e && (e = String(e));
    for (var t = e.length; t > 0; t--) {
        var n = e[t];
        if ("." === n || "," === n)
            return e.length - t - 1
    }
    if (Number(e) < 1) {
        var r = e.match(p);
        if (r && r[1])
            return Number(r[1])
    }
    return 0
}

function m(t, n, r) {
    if (("number" != typeof t || Number.isNaN(t)) && (t = 0), !Number.isFinite(t))
        return String(t);
    var i = b(Math.abs(t), n)
        , a = B(t)
        , o = a * i
        , s = t;
    if (0 === r)
        s = t - o;
    else if (3 === r || 1 === r && Math.abs(i - n / 2) < S(n)) {
        s = t - o + (0 === o ? 0 : a * n)
    } else if (1 === r) {
        s = t - o + (i > n / 2 ? 1 : 0) * n
    }
    return s.toFixed(h(n))
}
/**
* toFixedDown
* @param {*} e 
* @param {*} t 
*/
function g(e, t) {
    return m(e, t, 0)
}
/**
 * toFixedUp
 * @param {*} e 
 * @param {*} t 
 */
function v(e, t) {
    return m(e, t, 3)
}
/**
 * roundToNearest
 * @param {*} e 
 * @param {*} t 
 */
function y(e, t) {
    return m(e, t, 1)
}

/**
 * floatSafeRemainder
 * @param {*} e 
 * @param {*} t 
 */
function b(e, t) {
    var n = e % t
        , r = S(t);
    return (n < r || n + r > t) && (n = 0),
        n
}
function S(e) {
    return e / 1e4
}
/**
 * fixFloatError
 * @param {*} e 
 * @param {*} t 
 */
function M(e, t) {
    return parseFloat(y(e, t))
}
/**
 * tickSizeToTickLog
 * @param {*} e 
 */
function w(e) {
    return Math.abs(Math.ceil(Math.log10(e)))
}
/**
 * tickLogToTickSize
 * @param {*} e 
 */
function k(e) {
    return 1 / Math.pow(10, e)
}

var T = memoize(function (e) {
    return e > 20 && (e = 20),
        new Intl.NumberFormat(void 0, {
            minimumFractionDigits: e,
            maximumFractionDigits: 20
        })
});
/**
 * withCommas
 */
function C() {
    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
    return T(h(e)).format(e)
}
/**
 * convertCurrency
 * @param {*} e 
 * @param {*} t 
 * @param {*} n 
 * @param {*} r 
 * @param {*} i 
 */
function x(e, t, n, r, i) {
    "number" != typeof r && (r = f[t].tickLog);
    var a = f[n || s.PRIMARY_CURRENCY].multiplier
        , o = f[t].multiplier
        , l = o < a ? e * (a / o) : e / (o / a)
        , u = k(r);
    return i ? v(l, u) : g(l, u)
}
/**
 * currencyString
 * @param {*} e 
 * @param {*} t 
 */
function _(e, t) {
    var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : s.PRIMARY_CURRENCY
        , r = arguments.length > 3 ? arguments[3] : void 0;
    return "".concat(C(x(e, t, n, r)), " ").concat(t)
}
/**
 * currencyStringFromString
 * @param {*} e 
 */
function E(e) {
    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : s.PRIMARY_CURRENCY
        , n = e.match(l);
    return n && 3 === n.length && (e = e.replace(n[1], _(Number(n[2]), t))),
        e
}
/**
 * currencyPreservingCurrencyString
 * @param {*} e 
 * @param {*} t 
 */
function P(e, t) {
    var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : s.PRIMARY_CURRENCY
        , r = f[t].multiplier / f[n].multiplier
        , i = g(e / r, 1 / r);
    return "".concat(C(i), " ").concat(t)
}
/**
 * highPrecisionCurrencyString
 * @param {*} e 
 * @param {*} t 
 */
function N(e, t) {
    var n, r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : s.PRIMARY_CURRENCY, i = parseFloat(x(e, "XBt", r)),
        a = toPairs(f).slice(0, keys(f).indexOf(t) + 1).reverse();
    for (n = 0; n < a.length; n++) {
        var l = a[n][1]
            , c = l.multiplier / Math.pow(10, l.tickLog);
        if (Math.abs(i) >= c)
            break
    }
    return _(i, a[n] ? a[n][0] : s.PRIMARY_CURRENCY, s.PRIMARY_CURRENCY)
}
/**
 * XBT
 * @param {*} e 
 */
function O(e) {
    return _(e, "XBT", "XBt", 0)
}
/**
 * posNegClass
 * @param {*} e 
 */
function A(e) {
    return "string" == typeof e && (e = parseFloat(e.replace(/,/g, ""))),
        e ? e > 0 ? "pos" : "neg" : ""
}
/**
 * 计算比特币价值，单位为聪，当乘数大于0时，三个参数相乘；当参数小于0时，取价格的倒数，再相乘
 * @param {number} e 合约乘数: -100000000
 * @param {number} t 数量
 * @param {number} n 价格
 */
function F(e, t, n) {
    var r = e
        , i = t
        , a = n
        , o = Math.round(r >= 0 ? r * a : r / a);
    return Math.round(i * o)
}
/**
 * net 
 * 买成本时，数量的计算规则为：如果做空数量多，则成本数量为0，否则为做多数量-做空数量（计算时包含仓位）；
 * 卖成本时，数量的计算规则为：如果仓位为空仓，则成本数量为做空数量（不包含仓位），否则为做空数量-多仓的仓位数
 * 买溢价时，数量的计算规则为：如果仓位为多仓，则溢价数量为做多数量（不包含仓位），否则为做多数量-空仓的仓位数
 * 卖溢价时，数量的计算规则为：如果仓位为空仓，则溢价数量为做空数量（不包含仓位），否则为做空数量-多仓的仓位数
 * @param {currentQty} currentQty
 * @param {newOpenQty} newOpenQty 
 */
function I(currentQty, newOpenQty) {
    var n = currentQty
        , r = newOpenQty;
    return Math.min(0, Math.max(0, n) + Math.min(0, r))
        + Math.max(0, Math.min(0, n) + Math.max(0, r))
}
/**
 * absmax 取绝对值大的值
 * @param {*} e 
 * @param {*} t 
 */
function L(e, t) {
    return Math.abs(e || 0) >= Math.abs(t || 0) ? e : t
}
/**
 * signum
 * @param {*} e 
 */
function B(e) {
    return e > 0 ? 1 : e < 0 ? -1 : 0
}
/**
 * p 计算美元价值
 * @param {*} e multiplier
 * @param {*} t 数量
 * @param {*} n 比特币价值
 */
function R(e, t, n) {
    var r = e
        , i = t
        , a = n
        , o = B(i)
        , s = o * Math.ceil(o * a / i);
    if (r >= 0)
        return s / r;
    var l = 0 === s ? B(i / a) : s;
    return Number(y(r / l, 1e-4))
}
/**
 * r 如果数量相反: r * min(1, abs(orderQty/currentQty)) + t * min(1, abs(currentQty/orderQty)) 否则为0
 * @param {orderQty} e orderQty
 * @param {比特币价值，单位为聪} t 
 * @param {currentQty} n currentQty
 * @param {一个价值,还不知道具体是什么意思} r posCross
 */
function D(e, t, n, r) {
    var i = e
        , a = t
        , o = n
        , s = r;
    return B(i) === -B(o) ? Math.round(s * Math.min(1, -i / o)) + Math.round(a * Math.min(1, -o / i)) : 0
    // 如果数量相反: r * min(1, orderQty/currentQty) + t * min(1, currentQty/orderQty)
}

var j = .75; // MAX_FUNDING_DELTA
/**
 * maintMarginFromRiskLimit
 * @param {*} e 
 * @param {*} t 
 * @param {*} n 
 * @param {*} r 
 */
function G(e, t, n, r) {
    return t * (1 + Math.max(0, Math.ceil((e - n) / r)))
}
/**
 * getGrossValue 总价值
 * @param {instrument} e 
 * @param {price} t 
 * @param {orderQty} n 
 * @param {buyLeg} r 
 * @param {sellLeg} i 
 */
function U(e, t, n, r, i) {
    return "number" != typeof t ? (console.error("Attempted to get gross value of an order without a price."),
        0) : e.isMultiLeg ? r && i ? U(i, r.markPrice + t, n, void 0) : 0 : F(e.multiplier, n, t) || 0
}
/**
 * 取初始保证金 getInitMargin，如果仓位的initMarginReq有值，使用仓位的initMarginReq（1/杠杆），否则取合约的初始保证金（0.01）
 * @param {JSON} e instrument
 * @param {JSON} t position
 * @returns {number} 初始保证金
 */
function H(e, t) {
    return t && Number.isFinite(t.initMarginReq) ? t.initMarginReq : e.initMargin
}
/**
 * getMaintMargin，如果仓位的maintMarginReq有值，使用仓位的维持保证金，否则取合约的维持保证金
 * @param {*} e 
 * @param {*} t 
 */
function K(e, t) {
    return t && Number.isFinite(t.maintMarginReq) ? t.maintMarginReq : e.maintMargin
}
/**
 * getTakerFee 取费率，先取仓位的commission，如果取不到取option中相应symbol的takerFee，否则取0
 * @param {position} e 
 * @param {option} t 
 * @param {symbol} n 
 */
function V(e, t, n) {
    var r = t[n] || {};
    return e.commission || r.takerFee || 0
}
/**
 * getNewOpenSellCost: 开仓卖价值，使用传入价格计算比特币价值，再加上仓位的openOrderSellCost
 * @param {instrument} e 
 * @param {position} t 
 * @param {orderQty} n 
 * @param {price} r 
 */
function W(e, t, n, r) {
    var i = e.multiplier
        , a = F(i, Math.max(0, -n), r)  // 根据限价价格|买一价|卖一价，计算出的比特币价值
        , o = F(i, Math.max(0, -n), Math.max(r, e.bidPrice || -1 / 0)); // 根据买一价，计算出的比特币价值
    return t.openOrderSellCost + L(a, o)    // 取绝对值大的
}
/**
 * getNewOpenSellQty: 开仓卖数量，如果传入的数量为正，只取仓位的openOrderSellQty，否则，再加上传入数量的绝对值
 * @param {position} e 
 * @param {orderQty} t 
 */
function z(e, t) {
    return e.openOrderSellQty + Math.max(0, -t)
}
/**
 * getNewOpenBuyCost: 开仓买价值，使用传入价格和合约卖一价中价格小的计算比特币价值，再加上仓位的openOrderBuyCost
 * @param {instrument} e instrument
 * @param {position} t position
 * @param {orderQty} n orderQty
 * @param {price} r price
 */
function q(e, t, n, r) {
    var i = e.multiplier
        , a = F(i, Math.max(0, n), r)   // 根据限价价格|买一价|卖一价，计算出的比特币价值
        , o = F(i, Math.max(0, n), Math.min(r, e.askPrice || 1 / 0));   // 根据卖一价，计算出的比特币价值
    return t.openOrderBuyCost + L(a, o) // 取绝对值大的
}
/**
 * getNewOpenBuyQty: 开仓买数量，如果传入的数量为负，只取仓位的openOrderBuyQty，否则，再加上传入数量
 * @param {position} e 
 * @param {orderQty} t 
 */
function Y(e, t) {
    return e.openOrderBuyQty + Math.max(0, t)
}
/**
 * getNewGrossOpenCost 新开仓总成本
 * @param {instrument} e instrument
 * @param {position} t position
 * @param {orderQty} n orderQty
 * @param {price} r price
 */
function X(e, t, n, r) {
    var i = t.currentQty
        , a = Y(t, n)       // 开仓买数量
        , o = q(e, t, n, r) // 开仓买价值
        , s = z(t, n)       // 开仓卖数量
        , l = W(e, t, n, r);    // 开仓卖价值
    return Math.abs(o / a * I(i - s, a) || 0) + Math.abs(L(o / a, l / s) * I(-i, s) || 0)   // 开仓买价值 / 开仓买数量 * 买成本数量 + 取绝对值大的(开仓买价值/开仓买数量, 开仓卖价值/开仓卖数量) * 卖成本数量
}
/**
 * getNewGrossOpenCostCapped 新开仓总成本上限
 * @param {instrument} e 
 * @param {position} t 
 * @param {orderQty} n 
 * @param {price} r 
 */
function Z(e, t, n, r) {
    var i = e.multiplier
        , a = t.currentQty
        , o = Y(t, n)
        , s = q(e, t, n, r)
        , l = z(t, n)
        , u = W(e, t, n, r)
        , c = I(a - l, o)
        , d = I(-a, l);
    return false ?
        Math.abs(s / o * c - F(i, c, e.limitDownPrice) || 0) + Math.abs(L(F(i, d, e.limitUpPrice) - u / l * d, s / o * d - F(i, d, e.limitDownPrice)) || 0) :
        Math.abs(s / o * c || 0) + Math.abs(L(s / o, u / l) * d || 0)
}
/**
 * getNewOpenBuyPremium 新开仓买溢价
 * @param {instrument} e 
 * @param {position} t 
 * @param {orderQty} n 
 * @param {price} r 
 */
function Q(e, t, n, r) {
    var i = e.multiplier
        , a = F(i, Math.max(0, n), r)   // 根据限价价格|买一价|卖一价，计算出的比特币价值
        , o = F(i, Math.max(0, n), e.markPrice || r)    // 根据合约的markPrice计算出的比特币价值
        , s = a - Math.abs(a * Math.max(0, H(e, t) - (e.maintMargin + Math.abs(e.fundingRate || 0))));  // 市价或限价的比特币价值 - 市价或限价的比特币价值*(initMarginReq - 合约的maintMargin + 合约的fundingRate绝对值)
    return t.openOrderBuyPremium + Math.max(0, s - o)   // 公式计算出的比特币价值 - 标记价格的比特币价值
}
/**
 * getNewOpenSellPremium 新开仓卖溢价
 * @param {instrument} e 
 * @param {position} t 
 * @param {orderQty} n 
 * @param {price} r 
 */
function J(e, t, n, r) {
    var i = e.multiplier // -100000000 
        , a = F(i, Math.min(0, n), r) // 根据限价价格|买一价|卖一价，计算出的比特币价值
        , o = F(i, Math.min(0, n), e.markPrice || r) // 根据合约的markPrice计算出的比特币价值
        , s = a - Math.abs(a * Math.max(0, H(e, t) - (e.maintMargin + Math.abs(e.fundingRate || 0)))); // 市价或限价的比特币价值 - 市价或限价的比特币价值*(initMarginReq - 合约的maintMargin + 合约的fundingRate绝对值)
    return t.openOrderSellPremium + Math.max(0, s - o)  // 公式计算出的比特币价值 - 标记价格的比特币价值
}
/**
 * getNewGrossOpenPremium 新开仓总溢价
 * @param {instrument} e 
 * @param {position} t 
 * @param {orderQty} n 
 * @param {price} r 
 */
function $(e, t, n, r) {
    if ("LastPrice" === e.markMethod)
        return t.grossOpenPremium;
    var i = t.currentQty
        , a = Y(t, n)   // 开仓买数量
        , o = Q(e, t, n, r) // 新开仓买溢价
        , s = z(t, n)   // 开仓卖数量
        , l = J(e, t, n, r);    // 新开仓卖溢价
    return Math.abs(o * I(i, a) / a || 0) + Math.abs(l * I(-i, s) / s || 0) // 新开仓买溢价*溢价数量/开仓买数量 + 新开仓卖溢价*溢价数量/开仓卖数量
}
/**
 * isMaker
 * @param {*} e 
 * @param {*} t 
 * @param {*} n 
 */
function ee(e, t, n) {
    return "Buy" === e ? t < n : t > n
}
/**
 * getFeeValue
 * @param {*} e 
 * @param {*} t 
 * @param {*} n 
 * @param {*} r 
 * @param {*} i 
 */
function te(e, t, n, r, i) {
    return (ee(t, r, i) ? e.makerFee : e.takerFee) * n
}
/**
 * getMaintMarginValue
 * @param {*} e 
 * @param {*} t 
 * @param {*} n 
 * @param {*} r 
 * @param {*} i 
 * @param {*} a 
 * @param {*} o 
 */
function ne(e, t, n, r, i, a, o) {
    var s = K(e, t)
        , l = e.multiplier
        , u = e.bidPrice
        , c = e.askPrice
        , d = Math.abs(F(l, i, o))
        , f = "Buy" === r ? "Sell" : "Buy";
    return s + te(n, f, d, o, "Buy" === f ? o + (c - a) : o + (u - a))
}
/**
 * getMarginRequirement
 * @param {instrument} e instrument
 * @param {position} t position
 * @param {orderQty} n orderQty
 * @param {price} r price
 * @param {sellLeg} i sellLeg
 * @param {buyLeg} a buyLeg
 */
function re(e, t, n, r, i, a) {
    if ("number" != typeof n)
        return console.error("Margin requirement calc must have a qty."),
            0;
    // if (e.isMultiLeg)
    //     return ie(e, t, n, r, i, a);
    var o = H(e, t) // 如果仓位的initMarginReq有值，使用仓位的initMarginReq（1/杠杆），否则取合约的初始保证金（0.01）
        , s = V(t, {}, e.symbol) // t.commission || 0 手续费
        , l = t.initMargin || 0 // 取仓位的初始保证金
        , u = Math.max(0, X(e, t, n, r)) || 0   // 新开仓总成本
        , c = Math.max(0, $(e, t, n, r)) || 0   // 新开仓总溢价
        , d = Math.max(0, Z(e, t, n, r)) || 0   // 新开仓总成本上限（跟新开仓总成本公式相同）
        , f = Math.round(c + d * o + s * (u + u + d * o));  // 新开仓总溢价 + 新开仓总成本上限*(仓位的initMarginReq或合约的initMargin) + 手续费*(新开仓总成本+新开仓总成本+新开仓总成本上限*initMarginReq)
    return Math.max(0, f - l) || 0  //  计算出的成本价值 - 仓位的initMargin
}
/**
 * getMarginRequirementMultiLeg
 * @param {instrument} e 
 * @param {position} t 
 * @param {orderQty} n 
 * @param {price} r 
 * @param {sellLeg} i 
 * @param {buyLeg} a 
 */
function ie(e, t, n, r, i, a) {
    return i && a ? re(a, t, n, i.markPrice + r, void 0, void 0) + re(i, t, -n, i.markPrice, void 0, void 0) : 0
}
/**
 * getBankruptcyComponentPrices: 破产价格相关内容
 * @param {instrument} e instrument
 * @param {position} t position
 * @param {margin} n margin
 * @param {orderQty} r orderQty
 * @param {bidPrice | askPrice} i bidPrice | askPrice
 * @param {杠杆} a 杠杆
 */
function ae(e, t, n, r, i, a) {
    var o = e.multiplier        // 合约乘数
        , s = e.markPrice       // 合约的标记价格
        , l = t.currentCost     // ??
        , u = t.currentQty      // 当前仓位数量
        , c = t.commission      // taker|maker手续费
        , d = t.posCross        // 仓位交叉价值?? 0
        , f = t.realisedCost    // ??
        , p = t.realisedPnl     // 当天的已实现盈亏
        , h = t.unrealisedPnl   // 当天的未实现盈亏
        , m = t.currentQty + r  // 预期仓位
        , g = F(o, m, s)    // 按markPrice计算预期仓位的比特币价值
        , v = H(e, t);  //  取初始保证金
    null != a && (v = 1 / a);
    var y = F(o, r, i)  // 根据买一价或卖一价计算的比特币价值
        , b = l + y     // currentCost + 要下单的比特币价值
        , S = d - D(r, 0, u, d);    // 0
    null != a && (S += Math.max(0, -h));    // 0 + 未实现盈亏
    var M = D(r, y, u, l - f)   // 
        , w = b - (f + M)   // currentCost + 要下单的比特币价值 - realisedCost - 
        , k = w
        , T = Math.abs(k) * v
        , C = Math.round((Math.abs(k) + Math.max(0, S + T)) * c)
        , x = g - w;
    return {
        newInitMarginReq: v,
        newCurrentQty: m,
        newMarkValue: g,
        newPosCross: S,
        newPosInit: T,
        newUnrealisedPnl: x,
        newPosComm: C,
        newPosCost: k,
        newRealisedPnl: p - M - Math.round(Math.abs(y) * c),
        newMaintMargin: Math.max(0, S + T + C + x)
    }
}
/**
 * getBankruptPrice: 破产价格
 * @param {*} e 
 * @param {*} t 
 * @param {还不知道n是什么意思} n 
 * @param {*} r 
 * @param {*} i 
 */
function oe(e, t, n, r, i) {
    if (t.currentQty + r === 0)
        return null;
    var a = ae.apply(void 0, arguments)
        , o = a.newCurrentQty
        , s = a.newMarkValue
        , l = a.newPosCross
        , u = a.newPosInit
        , c = a.newUnrealisedPnl
        , d = a.newRealisedPnl
        , f = (a._newPosComm,
            a.newMaintMargin)
        , p = B(s)
        , h = e.multiplier
        , m = t.commission
        , y = t.realisedPnl
        , b = t.unrealisedPnl
        , S = t.maintMargin
        , M = l + u + c;
    if (t.crossMargin) {
        var w = n.marginBalance - b + c - y + d - n.initMargin - (n.maintMargin - S + f);
        M += Math.max(0, Math.floor(w / (1 + m)))
    }
    var k = R(h, o, p * Math.max(0, p * (s - M)));
    return Number((o > 0 ? v : g)(k, e.tickSize))
}
/**
 * getLiquidationPrice: 强平价格
 * @param {instrument} e instrument
 * @param {position} t position
 * @param {margin} n margin
 * @param {orderQty} r orderQty
 * @param {bidPrice | askPrice} i bidPrice | askPrice
 * @param {杠杆} a 杠杆
 */
function se(e, t, n, r, i, a) {
    // 取当前仓位数量与传入数量的和，计算预期的仓位数
    if (t.currentQty + r === 0)
        return null;
    var o, s = ae.apply(void 0, arguments),     // s是根据数量，价格计算出的预期值
        l = s.newInitMarginReq,
        u = s.newCurrentQty,
        c = s.newMarkValue,
        d = s.newPosCross,
        f = s.newPosInit,
        p = s.newUnrealisedPnl,
        h = s.newRealisedPnl,
        m = s.newPosComm,
        y = s.newPosCost,
        b = s.newMaintMargin,
        S = B(c),   // 判断正负,正: 1, 负: -1, 否则为0
        M = e.fundingRate,
        w = e.multiplier,
        k = e.riskLimit,
        T = e.riskStep,
        C = t.commission,
        x = t.markValue,
        _ = t.realisedPnl,
        E = t.maintMargin;
    o = null != a ? l : H(e, t);
    var P, N = K(e, t), // maintMarginReq || maintMargin
        O = d + f + m + p;  // newPosCross + newPosInit + newPosComm + newUnrealisedPnl
    // 风险限额大于初始时
    if (N > e.maintMargin) {
        var A = t.riskValue - Math.abs(x) + Math.abs(c);    // riskValue - markValue + newMarkValue
        // P = s.newPosComm + s.newPosCost * min(initMarginReq, min(maintMarginReq, e.maintMargin*(1+(e.riskValue - t.markValue + newMarkValue - e.riskLimit)/e.riskStep))) + fundingRate * newCurrentQty
        P = m + Math.abs(y) * Math.min(o, Math.min(N, e.maintMargin * (1 + Math.ceil((A - k) / T))) + Math.max(0, M * B(u)))
    } else
        // P = s.newPosComm + s.newPosCost * min(initMarginReq, maintMarginReq + e.fundingRate * B(s.newCurrentQty))
        P = m + Math.abs(y) * Math.min(o, N + Math.max(0, M * B(u)));
    if (O -= P,
        t.crossMargin) {
        // 如果为逐仓
        // n.marginBalance - t.unrealisedPnl + s.newUnrealisedPnl - t.realisedPnl + s.newRealisedPnl - n.initMargin - (n.maintMargin - t.maintMargin + s.newMaintMargin)
        var F = n.marginBalance - t.unrealisedPnl + p - _ + h - n.initMargin - (n.maintMargin - E + b);
        O += Math.max(0, Math.floor(F / (1 + C)))   // F / (1 + t.commission)
    }
    // 风险限额大于初始时: P = newPosComm + newPosCost * min(initMarginReq, min(maintMarginReq, e.maintMargin*(1+(e.riskValue - t.markValue + newMarkValue - e.riskLimit)/e.riskStep))) + fundingRate * B(newCurrentQty)))
    // 风险限额等于初始时: P = newPosComm + newPosCost * min(initMarginReq, maintMarginReq + e.fundingRate * B(newCurrentQty))
    // O = newPosCross + newPosInit + newPosComm + newUnrealisedPnl
    // F = n.marginBalance - t.unrealisedPnl + s.newUnrealisedPnl - t.realisedPnl + s.newRealisedPnl - n.initMargin - (n.maintMargin - t.maintMargin + s.newMaintMargin)
    //全仓: O = O - P
    //逐仓: O = O - P + max(0,  Math.floor(F / (1 + t.commission)))
    //最后强平结果：s.newMarkValue - O
    var I = R(w, u, S * Math.max(0, S * (c - O)));  // R(e.multiplier, s.newCurrentQty, s.newMarkValue - O)
    return Number((u > 0 ? v : g)(I, e.tickSize))
}
/**
 * calcAvgEntryPrice: 这是根据仓位的avgEntryPrice计算出来的，还不知道是什么意思
 * @param {*} e 
 * @param {*} t 
 * @param {*} n 
 */
function le(e, t, n) {
    var r = e.currentQty || 0
        , i = Math.abs(t);
    // eslint-disable-next-line no-unused-expressions        
    Math.abs(r + t) < Math.abs(r) && (r += t, i = 0), r = Math.abs(r);
    var a = ((e.avgEntryPrice || 0) * r + i * n) / (r + i);
    return isFinite(a) ? a : 0
}
export function getCrossoverIndex(e = []) {
    return sortedIndexBy(e, {
        side: "Buy"
    }, function (item) {
        return "Buy" === item.side ? 1 : 0
    })
}
function getBids(models, e) {
    var t = getCrossoverIndex(models)
        , n = "number" == typeof e ? Math.min(t + e, models.length) : models.length;
    return models.slice(t, n);
}
function getAsks(models, e) {
    var t = getCrossoverIndex(models)
        , n = "number" == typeof e ? Math.max(t - e, 0) : 0;
    return models.slice(n, t).reverse();
}
/**
 * 
 * @param {Instrument} e 
 * @param {OrderBook} t 
 * @param {symbol} n 
 * @param {price} r 
 * @param {orderQty} i 
 * @param {isBuy} a 
 * @param {isSell} o 
 */
function calculateFillPrice(e, t, n, r, i, a, o) {
    if (0 === t.length)
        return {
            cumQty: null,
            avgPx: null
        };
    var s = t[0];
    if (s && s.symbol !== n) {
        return console.log("Attempted to calculate the fill price of an order via the book, but that symbol was not active."),
            {
                cumQty: 0,
                avgPx: r
            }
    }
    for (var l = 0, u = 0, c = Math.abs(i), d = a ? getAsks(t) : getBids(t), f = 0; f < d.length; f++) {
        var p = d[f];
        if (c <= 0 || a && r < p.price || o && r > p.price)
            break;
        var h = Math.min(p.size, c);
        // eslint-disable-next-line no-unused-expressions
        l += h,
            u += F(e.multiplier, h, p.price),
            c -= h
    }
    return {
        cumQty: l,
        avgPx: l ? R(e.multiplier, l, u) : r
    }
}
/**
 * 
 * @param {Position} position 仓位对象
 * @param {Instrument} instrument 合约对象
 */
function getIndicativePnlAtPrice(position, instrument, e) {
    var t = position.markValue
        , n = position.currentQty
        , r = instrument;
    if (!r)
        return {
            pnl: 0,
            pnlPcnt: 0,
            roePcnt: 0
        };
    var i = r.multiplier
        , a = F(i, n, e) - t
        , o = a / Math.abs(t);
    return {
        pnl: a,
        pnlPcnt: o,
        roePcnt: o * position.leverage
    }
}
/**
 * 
 * @param {number} e 比特币价格
 * @param {string} activeCurrency 当前的比特币单位
 */
function currency(e, activeCurrency) {
    return Number.isFinite(e) ? _(e, activeCurrency) : "-.--"
}
function percentageHundredths(e) {
    return Number.isFinite(e) ? "".concat((100 * e).toFixed(2), "%") : ""
}
function effectiveLeverage(position, instrument, margin) {
    var e = instrument;
    if (e && !position.crossMargin) {
        if (0 === position.currentQty)
            return position.leverage || (1 / e.initMargin);
        var t = position.maintMarginReq + (Math.abs(e.fundingRate) || 0);
        return (position.posMaint - position.posComm) * (1 / t) / (position.unrealisedPnl + position.posMargin - position.posComm) || 0
    }
    return margin.marginLeverage
}
function isBuy(order) {
    return order.side ? "Buy" === order.side : order.orderQty > 0
    // 下面的暂时注释掉
    // || order.isClose && order.getPosition().currentQty < 0
}
function _getOrderGrossValue(instrument, order, qty) {
    let price = order.price || (isBuy(order) ? instrument.askPrice : instrument.bidPrice) || instrument.markPrice || 0;
    return Math.abs(U(instrument, price, qty))
}
export class Formula {
    /**
     * 计算成本
     * @param {Instrument} instrument 合约对象
     * @param {Position} position 仓位对象
     * @param {number} orderQty 仓位数量，计算卖成本时取负数，计算买成本时取正数
     * @param {number} price 限价取开仓价格，计算市价卖成本时取合约买一价格，计算市价买成本时取合约卖一价格
     * @param {object} margin 保证金对象
     * @param {string} sellLeg 合约的一个卖标志，可不传，默认为null
     * @param {string} buyLeg 合约的一个买标志，可不传，默认为null
     */
    getMarginRequirement(instrument, position, orderQty, price, margin, sellLeg = null, buyLeg = null) {
        // let value = re(instrument, position, orderQty, price, sellLeg, buyLeg);
        let value = getMarginRequirement(margin, instrument, position, orderQty * 1, price * 1);
        if (value === Infinity || value === -Infinity) {
            return 0;
        }
        return value;
    }
    /**
     * 计算强平价格
     * @param {Instrument} instrument 合约对象
     * @param {Position} position 仓位对象
     * @param {Margin} margin 保证金对象
     * @param {number} orderQty 仓位数量，计算卖强平时取负数，计算买强平时取正数
     * @param {number} price 限价取开仓价格，计算市价卖强平时取合约买一价格，计算市价买强平时取合约卖一价格
     * @param {number} lever 杠杆, 如果取不到可以不传
     */
    getLiquidationPrice(instrument, position, margin, orderQty, price, lever) {
        // return se(instrument, position, margin, orderQty, price, lever)
        return getNewLiquidation(instrument, position, margin, orderQty * 1, price * 1, lever * 1)
    }
    /**
     * 计算市价平仓预测盈亏
     * @param {Position} position 仓位对象
     * @param {Instrument} instrument 合约对象
     * @param {OrderBookL2} orderBook OrderBookL2对象
     * @param {string} symbol 合约名称
     * @param {string} activeCurrency 当前合约单位
     * @return {object} {pnl, pnlPcnt, roePcnt}
     */
    getIndicativePnl(position, instrument, orderBook, symbol, activeCurrency) {
        let e = position.currentQty;
        let orderQty = -1 * e;
        let price = e * (-1 / 0);
        let isBuy = orderQty > 0;
        let isSell = orderQty < 0;
        let fillPrice = calculateFillPrice(instrument, orderBook, symbol, price, orderQty, isBuy, isSell).avgPx;
        let indicative = getIndicativePnlAtPrice(position, instrument, fillPrice);
        let pnl = currency(indicative.pnl, activeCurrency);
        let pcnt = percentageHundredths(indicative.roePcnt, activeCurrency);
        return {
            pnl,
            pcnt
        }
    }
    /**
     * 计算增加/减少保证金弹窗中的杠杆
     * @param {Position} position 
     * @param {Instrument} instrument 
     * @param {Margin} margin 
     */
    getEffectiveLeverage(position, instrument, margin) {
        return effectiveLeverage(position, instrument, margin);
    }
    /**
     * 计算委托价格平均值
     * @param {Array} orderList 委托列表
     * @param {Array} instrument 合约对象
     */
    getAvgPrice(orderList, instrument) {
        let totalGrossValue = orderList.reduce((total, order) => {
            return total + _getOrderGrossValue(instrument, order, order.orderQty)
        }, 0);
        return orderList.map(function (order) {
            return [order.price, _getOrderGrossValue(instrument, order, order.orderQty)]
        }).reduce(function (e, t) {
            return e + t[0] * (t[1] / totalGrossValue)
        }, 0)
    }
    /**
     * 计算完全成交平均值
     * @param {Array} orderList 委托列表
     * @param {Array} instrument 合约对象
     */
    getAvgFilled(orderList, instrument) {
        let totalGrossValue = orderList.reduce((total, order) => {
            return total + _getOrderGrossValue(instrument, order, order.cumQty)
        }, 0);
        return orderList.map(function (order) {
            return [order.avgPx, _getOrderGrossValue(instrument, order, order.cumQty)]
        }).reduce(function (e, t) {
            return e + t[0] * (t[1] / totalGrossValue)
        }, 0)
    }
}
