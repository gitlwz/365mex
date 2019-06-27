function getBuyMarginRequirement(margin, instrument, position, orderQty, price) {
    let { takerFee, markPrice, multiplier } = instrument;
    let { initMargin = 0 } = margin;
    let { initMargin: posInitMargin = 0 } = position;
    let { leverage, commission, openOrderBuyCost = 0, openOrderBuyQty = 0, openOrderSellQty = 0, openOrderSellCost = 0, currentQty = 0 } = position;
    let newBuyCost = Math.round(1 / price * multiplier) * orderQty;
    let newSellCost = 0;
    let newSellQty = 0
    let newOrderCost = Math.max(
        (Math.abs(openOrderSellCost) + Math.abs(newSellCost)) / (Math.abs(openOrderSellQty) + Math.abs(newSellQty)) || 0,
        (Math.abs(openOrderBuyCost) + Math.abs(newBuyCost)) / (Math.abs(openOrderBuyQty) + Math.abs(orderQty))
    ) * Math.max(
        Math.max((Math.abs(openOrderBuyQty) + Math.abs(orderQty)) - Math.abs(Math.min(0, currentQty)), 0),
        Math.max((Math.abs(openOrderSellQty) + Math.abs(newSellQty)) - Math.abs(Math.max(0, currentQty)), 0)
    );
    // console.log(`openOrderBuyQty=${openOrderBuyQty},openOrderBuyCost=${openOrderBuyCost},initMargin=${initMargin},posInitMargin=${posInitMargin}`);
    commission = commission || takerFee || 0;
    // 成本保证金=Max(预计总委托价值/杠杆+(预计总委托价值*2+预计总委托价值/杠杆)*taker手续费率-当前委托保证金-min(0，（1/委托价格- 1/标记价格）*abs(合约乘数*委托数量))，0)
    let result = Math.max(0,
        newOrderCost / leverage +
        (newOrderCost * 2 + newOrderCost / leverage) * commission - posInitMargin -
        Math.min(0, (1 / price - 1 / markPrice) * Math.abs(multiplier * orderQty))
    );
    try {
        result = Math.ceil(result);
    } catch (error) {
        
    }
    return result;
}

function getSellMarginRequirement(margin, instrument, position, orderQty, price) {
    let { takerFee, multiplier, markPrice } = instrument;
    let { initMargin = 0 } = margin;
    let { initMargin: posInitMargin = 0 } = position;
    let { leverage, commission, openOrderBuyCost = 0, openOrderBuyQty = 0, openOrderSellQty = 0, openOrderSellCost = 0, currentQty = 0 } = position;
    let newSellCost = Math.round(1 / price * multiplier) * orderQty;
    let newBuyCost = 0;
    let newBuyQty = 0;
    let newOrderCost = Math.max(
        (Math.abs(openOrderSellCost) + Math.abs(newSellCost)) / (Math.abs(openOrderSellQty) + Math.abs(orderQty)),
        (Math.abs(openOrderBuyCost) + Math.abs(newBuyCost)) / (Math.abs(openOrderBuyQty) + Math.abs(newBuyQty)) || 0
    ) * Math.max(
        Math.max((Math.abs(openOrderBuyQty) + Math.abs(newBuyQty)) - Math.abs(Math.min(0, currentQty)), 0),
        Math.max((Math.abs(openOrderSellQty) + Math.abs(orderQty)) - Math.abs(Math.max(0, currentQty)), 0)
    );
    // console.log(`openOrderSellQty=${openOrderSellQty},openOrderSellCost=${openOrderSellCost},initMargin=${initMargin},posInitMargin=${posInitMargin}`);
    commission = commission || takerFee || 0;
    let result = 0;
    // 成本保证金=Max（预计总委托价值/杠杆+(预计总委托价值*2+预计总委托价值/杠杆)* taker手续费率-当前委托保证金- min(0，（1/标记价格- 1/委托价格）*abs（合约乘数*委托数量）)，0）
    result = Math.max(
        newOrderCost / leverage + (newOrderCost * 2 + newOrderCost / leverage) * commission - posInitMargin -
        Math.min(0, (1 / markPrice - 1 / price) * Math.abs(multiplier * orderQty)),
        0
    );
    try {
        result = Math.ceil(result);
    } catch (error) {
        
    }
    return result;
}

/**
 * 计算成本
 * @param {Instrument} margin 保证金对象
 * @param {Instrument} instrument 合约对象
 * @param {Position} position 仓位对象
 * @param {number} orderQty 仓位数量，计算卖成本时取负数，计算买成本时取正数
 * @param {number} price 限价取开仓价格，计算市价卖成本时取合约买一价格，计算市价买成本时取合约卖一价格
 */
export function getMarginRequirement(margin, instrument, position, orderQty, price) {
    let result = 0;
    price *= 1;
    if (orderQty > 0) {
        result = getBuyMarginRequirement(margin, instrument, position, orderQty, price);
    } else if (orderQty < 0) {
        result = getSellMarginRequirement(margin, instrument, position, orderQty, price);
    }
    return result;
}