import { language } from 'quant-ui';
let { getLanguageData } = language;
let $ = getLanguageData;
export function getOrdType(type) {
    switch (type) {
        case 'Limit':
            return $('限价');
        case 'Market':
            return $('市价');
        case 'StopLimit':
            return $('限价止损');
        case 'Stop':
            return $('市价止损');
        case 'MarketIfTouched':
            return $('市价止盈');
        case 'LimitIfTouched':
            return $('限价止盈');
        default:
            return $('未知类型')
    }
}
export function inMarketOrStop(type) {
    switch (type) {
        case 'StopLimit':
        case 'Stop':
        case 'MarketIfTouched':
        case 'LimitIfTouched':
            return true;
        default:
            return false
    }
}
export function inMarket(type) {
    switch (type) {
        case 'Stop':
        case 'MarketIfTouched':
        case 'Market':
            return true;
        default:
            return false
    }
}
export function inShowClear(type) {
    switch (type) {
        case 'Filled':
        case 'Canceled':
        case 'Rejected':
            return true;
        default:
            return false
    }
}
export function getTradeStatus(type) {
    switch (type) {
        case 'New':
            return $('新委托');
        case 'PartiallyFilled':
            return $('部分成交');
        case 'Filled':
            return $('已成交');
        case 'Canceled':
            return $('已取消');
        case 'Rejected':
            return $('已拒绝');
        case 'Triggered':
            return $('已触发');
        case 'Untriggered':
            return $('未触发');
        default:
            return $('未知类型')
    }
}
export function getDirectionStatus(type) {
    switch (type) {
        case 'Buy':
            return $('买入');
        case 'Sell':
            return $('卖出');
        default:
            return $('未知类型')
    }
}
export function getTradeType(type) {
    switch (type) {
        case 'Funding':
            return $('资金费用');
        case 'Trade':
            return $('交易');
        case 'Settlement':
            return $('结算');
        case 'New':
            return $('未成交委托');
        case 'Canceled':
            return $('撤单');
        default:
            return $('未知类型')
    }
}
