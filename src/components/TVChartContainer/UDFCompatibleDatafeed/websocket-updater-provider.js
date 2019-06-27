import * as tslib_1 from "tslib";
import { logMessage, postTopMessage, } from './helpers';
var WebsocketUpdaterProvider = /** @class */ (function () {
    function WebsocketUpdaterProvider() {
        this._subscribers = {};
        this._subscribers = {};
    }
    WebsocketUpdaterProvider.prototype.subscribeBars = function (symbolInfo, resolution, newDataCallback, listenerGuid, onResetCacheNeededCallback) {
        if (this._subscribers.hasOwnProperty(listenerGuid)) {
            logMessage("WebsocketUpdaterProvider: already has subscriber with id=" + listenerGuid);
            return;
        }
        var resolutionMs = getResolutionSeconds(resolution, 1) * 1000;
        var symbolName = symbolInfo.name;
        var windowListener;
        var subscriber = {
            binner: new Binner(symbolName, resolutionMs, function (e, t) {
                return newDataCallback(e);
            }),
            windowListener: windowListener,
        };
        this._subscribers[listenerGuid] = subscriber;
        postTopMessage({
            event: "addStream",
            symbol: symbolName
        });
        var listener = function (e) {
            var origin = e.origin || (e.originalEvent ? e.originalEvent.origin : "");
            if (origin === window.location.origin) {
                var n = e.data;
                if ("reloadBins" === n.cmd) {
                    onResetCacheNeededCallback();
                }
                if (n.symbol === symbolName && "gotBars" === n.event) {
                    subscriber.binner.setCurrentBin(n.lastBar);
                }
                else {
                    n.symbol === symbolName && "addTrades" === n.cmd && subscriber.binner.onTrades(n.data);
                }
            }
            else {
                console.error("Invalid origin, ignoring message: %s", origin);
            }
        };
        window.addEventListener("message", listener, false);
        subscriber.windowListener = listener;
        subscriber.binner.finishBinTimeout();
        logMessage("WebsocketUpdaterProvider: subscribed for #" + listenerGuid + " - {" + symbolInfo.name + ", " + resolution + "}");
    };
    WebsocketUpdaterProvider.prototype.unsubscribeBars = function (listenerGuid) {
        logMessage("WebsocketUpdaterProvider: unsubscribed for #" + listenerGuid);
        var t = this._subscribers[listenerGuid];
        var symbol = t.binner.getSymbol();
        t.binner.destroy();
        postTopMessage({
            event: "endStream",
            symbol: symbol,
        });
        window.removeEventListener("message", t && t.windowListener, false);
        delete this._subscribers[listenerGuid];
    };
    return WebsocketUpdaterProvider;
}());
export { WebsocketUpdaterProvider };
var Binner = /** @class */ (function () {
    function Binner(symbol, periodMs, callback, namespace) {
        if (namespace === void 0) { namespace = ""; }
        var _this = this;
        this.nextBarBuffer = [];
        this.currentBin = null;
        this.wsGrace = 2000;
        this.finishBinTimerId = null;
        this.symbol = symbol;
        this.periodMs = periodMs;
        this.callback = callback;
        this.namespace = namespace;
        this.finishBinTimeout = function () {
            try {
                if (!_this.finishBinTimerId) {
                    var wsTime = _this.periodMs - Date.now() % _this.periodMs + _this.wsGrace;
                    _this.finishBinTimerId = setTimeout(function () {
                        _this.finishBinTimerId = null;
                        _this.finishBinTimeout();
                        var currentBin = _this.currentBin;
                        if (currentBin && currentBin.close != null) {
                            var newCurrentBin = getNewCurrentBin(_this.periodMs, currentBin);
                            if (newCurrentBin.time !== currentBin.time) {
                                _this.currentBin = newCurrentBin;
                                _this.onTrades(_this.nextBarBuffer);
                                _this.nextBarBuffer = [];
                                _this.callback(newCurrentBin, _this.symbol, _this.namespace);
                            }
                        }
                    }, wsTime);
                }
            } catch (error) {
                
            }
        };
    }
    Binner.prototype.onTrades = function (data) {
        if (data != null && data.length !== 0) {
            if (this.currentBin === null) {
                this.currentBin = getNewCurrentBin(this.periodMs);
            }
            for (var t = 0; t < data.length; ++t) {
                var trade = data[t];
                if (isValidTime(this.currentBin, trade, this.periodMs)) {
                    calcCurrentBin(this.currentBin, trade);
                }
                else {
                    if (new Date(trade.timestamp) > this.currentBin.time) {
                        this.nextBarBuffer.push(trade);
                    }
                    else {
                        logMessage("Trade ignored, out of range:" + trade + " , Now: " + (new Date).toISOString() + ", Period:" + this.periodMs + "}");
                    }
                }
            }
            this.callback(this.currentBin, this.symbol, this.namespace);
            this.finishBinTimeout();
        }
    };
    Binner.prototype.setCurrentBin = function (bin) {
        this.currentBin = tslib_1.__assign({}, bin);
        var currentBinTime = new Date(this.currentBin.time).getTime();
        if (currentBinTime < Date.now() - this.periodMs) {
            var time1 = new Date(Math.floor(Date.now() / this.periodMs) * this.periodMs);
            logMessage("Received bar from getBars() was old;" + new Date(bin.time) + "making a new one for" + this.symbol + ", " + time1);
            logMessage(this.currentBin);
            this.currentBin = getNewCurrentBin(this.periodMs, bin);
            this.callback(this.currentBin, this.symbol, this.namespace);
        }
    };
    Binner.prototype.getSymbol = function () {
        return this.symbol;
    };
    Binner.prototype.destroy = function () {
        if (this.finishBinTimerId !== null) {
            clearTimeout(this.finishBinTimerId);
            this.finishBinTimerId = null;
        }
        this.callback = null;
    };
    return Binner;
}());
export { Binner };
function getNewCurrentBin(periodMs, currentBin) {
    if (currentBin === void 0) { currentBin = null; }
    var close = currentBin ? currentBin.close : null;
    var time = getTime(periodMs);
    return {
        volume: 0,
        trades: 0,
        open: close,
        close: close,
        high: close,
        low: close,
        time: time,
        timestamp: new Date(time + periodMs).toISOString()
    };
}
function getTime(periodMs) {
    var now = Date.now();
    return Math.floor(now / periodMs) * periodMs;
}
function isValidTime(currentBin, trade, periodMs) {
    var time = currentBin.time;
    var r = time + periodMs;
    var o = new Date(trade.timestamp).valueOf();
    return o >= time && o < r;
}
function calcCurrentBin(currentBin, trade) {
    var size = trade.size, price = trade.price;
    if ("." === trade.symbol[0]) {
        return function (e, t) {
            e.open = e.high = e.low = e.close = t;
        }(currentBin, price);
    }
    currentBin.volume += size;
    currentBin.trades += 1;
    if (currentBin.trades === 1) {
        currentBin.open = price;
        currentBin.high = price;
        currentBin.low = price;
        currentBin.close = price;
    }
    else {
        currentBin.high = Math.max(price, currentBin.high || 0);
        currentBin.low ? currentBin.low = Math.min(currentBin.low, price) : currentBin.low = price;
        currentBin.close = price;
    }
}
function getResolutionSeconds(resolution, defaultDay) {
    if (defaultDay === void 0) { defaultDay = 1; }
    var daySeconds = 24 * 60 * 60;
    var day = defaultDay;
    if (resolution === "D" || resolution === "1D") {
        day = defaultDay;
    }
    else if (resolution === "M") {
        day = 31 * defaultDay;
    }
    else if (resolution === "W") {
        day = 7 * defaultDay;
    }
    else {
        day = defaultDay * resolution / 1440;
    }
    return day * daySeconds;
}
