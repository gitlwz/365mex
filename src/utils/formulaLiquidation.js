import { toLowPrice, toUpPrice } from "./utils";
function signum(e) {
    return e > 0 ? 1 : e < 0 ? -1 : 0
}
/**
 * 计算比特币价值
 * @param {number} multiplier 合约乘数
 * @param {number} qty 数量
 * @param {number} price 价格
 */
function getXBtValue(multiplier, qty, price) {
    let XBtPerValue = Math.round(multiplier >= 0 ? multiplier * price : multiplier / price);
    return Math.round(qty * XBtPerValue);
}
/**
 * 计算新的维持保证金率
 * @param {object} instrument 合约对象
 * @param {object} position 仓位对象
 * @param {number} orderQty 数量
 * @param {number} price 价格
 */
function getNewMaintMarginReq(instrument, position, orderQty, price) {
    const defaultRiskLimit = 20000000000;
    const defaultRiskStep = 10000000000;
    const { riskStep, riskLimit, maintMargin } = instrument;
    let {
        riskLimit: positionRiskLimit = defaultRiskLimit,
        riskValue = 0,
    } = position;


    let min = riskLimit || defaultRiskLimit;
    let step = riskStep || defaultRiskStep;

    let marks = {};
    for (let i = 0; i < 10; i++) {
        let value = min + step * i;
        marks[value] = value / 100000000;
    }

    let currentRisk = min;
    let values = Object.keys(marks);
    for (let i = 1; i < values.length; i++) {
        if (riskValue <= currentRisk) {
            break;
        }
        let currentValue = values[i];
        if (riskValue <= currentValue) {
            currentRisk = currentValue;
            break;
        }
    }
    let num = (currentRisk - riskLimit) / riskStep;
    let newMaintMarginReq = maintMargin * 1 + num * maintMargin;

    if (positionRiskLimit > currentRisk) {
        return 0;
    }

    return newMaintMarginReq;
}
/**
 * 获取预期强平参数
 * @param {object} instrument 合约对象
 * @param {object} position 仓位对象
 * @param {object} margin 保证金对象
 * @param {number} orderQty 数量
 * @param {number} price 价格
 * @param {number} leverage 杠杆
 */
function getNewLiquidationOptions(instrument, position, margin, orderQty, price, leverage) {
    let { multiplier, markPrice, takerFee } = instrument;
    let { walletBalance } = margin;
    let { currentQty = 0, crossMargin, posCost = 0, posCross = 0, posLoss = 0, currentCost = 0, commission = 0 } = position;
    let newCurrentQty = currentQty + orderQty; // 预计持仓数量
    let newPosCost = 0;  // 预计开仓成本价值
    let newPosCross = 0;
    let newPosLoss = 0;
    let newMaintMarginReq = getNewMaintMarginReq(instrument, position, orderQty, price);  // 维持保证金率
    let newMarginBalance = 0; // 预计钱包余额
    let newRealisedPnl = 0; // 预计平仓盈亏
    let newPremiumPnl = 0;  // 预计溢价亏损
    let newPosComm = 0; // 预计成交手续费


    if (signum(orderQty) === signum(currentQty) || currentQty === 0) {
        newPosCost = posCost + getXBtValue(multiplier, orderQty, price);
    } else if (signum(currentQty + orderQty) === signum(currentQty)) {
        newPosCost = posCost / currentQty * (currentQty + orderQty);
    } else if (signum(currentQty + orderQty) === -1 * signum(currentQty)) {
        newPosCost = getXBtValue(multiplier, orderQty, price) / orderQty * (currentQty + orderQty);
    }

    if (crossMargin) {
        // 全仓
        if (signum(orderQty) === signum(currentQty) || currentQty === 0) {
            newPremiumPnl = Math.min(0, (1 / markPrice - 1 / price) * orderQty * multiplier);
            newRealisedPnl = 0;
        } else if (signum(currentQty + orderQty) === signum(currentQty)) {
            newPremiumPnl = 0;
            newRealisedPnl = posCost / currentQty * orderQty - getXBtValue(multiplier, orderQty, price);
        } else if (signum(currentQty + orderQty) === -1 * signum(currentQty)) {
            newPremiumPnl = Math.min(0, (1 / markPrice - 1 / price) * (currentQty + orderQty) * multiplier);
            newRealisedPnl = getXBtValue(multiplier, orderQty, price) / orderQty * currentQty - posCost;
        }
        newPosComm = Math.abs(getXBtValue(multiplier, orderQty, price)) * commission;
        newMarginBalance = walletBalance + newRealisedPnl + newPremiumPnl - newPosComm;
    } else {
        // 逐仓
        if (signum(orderQty) === signum(currentQty) || currentQty === 0) {
            newPosCross = posCross;
            newPosLoss = posLoss;
        } else if (signum(orderQty) === -1 * signum(currentQty) && signum(currentQty + orderQty) === signum(currentQty)) {
            newPosCross = posCross - posCross / Math.abs(currentQty) * Math.min(Math.abs(orderQty), Math.abs(currentQty));
            newPosLoss = posLoss - posLoss / Math.abs(currentQty) * Math.min(Math.abs(orderQty), Math.abs(currentQty));
        }
    }

    return {
        newCurrentQty,
        newPosCost,
        newPosCross,
        newPosLoss,
        newMaintMarginReq,
        newMarginBalance,
    }
}

/**
 * 获取预期强平价格
 * @param {object} instrument 合约对象
 * @param {object} position 仓位对象
 * @param {object} margin 保证金对象
 * @param {number} orderQty 数量，计算卖强平时取负数，计算买强平时取正数
 * @param {number} price 价格
 * @param {number} leverage 杠杆
 */
export function getNewLiquidation(instrument, position, margin, orderQty, price, leverage) {
    let options = getNewLiquidationOptions(instrument, position, margin, orderQty, price, leverage);
    let { newCurrentQty, newPosCost, newPosCross, newPosLoss, newMaintMarginReq, newMarginBalance } = options;
    let { multiplier, fundingRate, takerFee } = instrument;
    let { crossMargin, commission } = position;
    let { initMargin } = margin;
    let isBuy = newCurrentQty > 0 ? true : false;
    let result = 0;
    if (!crossMargin) {
        result = isBuy ?
            // 多仓（逐仓）：预计强平价格=（合约乘数*预计持仓数量）/（预计开仓成本价值-abs(预计开仓成本价值)/杠杆-预计开仓成本价值*维持保证金率-预计posCross+预计posLoss-预计开仓成本价值*Max（0, 当前时段资金费率)）
            (multiplier * newCurrentQty) / (newPosCost - Math.abs(newPosCost) / leverage - newPosCost * newMaintMarginReq - newPosCross + newPosLoss - newPosCost * Math.max(0, fundingRate)) :
            // 空仓（逐仓）：预计强平价格=（合约乘数*预计持仓数量）/（预计开仓成本价值-abs(预计开仓成本价值)/杠杆+预计开仓成本价值*维持保证金率-预计posCross+预计posLoss-预计开仓成本价值*Min（0，当前时段资金费率)）
            (multiplier * newCurrentQty) / (newPosCost - Math.abs(newPosCost) / leverage + newPosCost * newMaintMarginReq - newPosCross + newPosLoss - newPosCost * Math.min(0, fundingRate))
    } else {
        result = isBuy ?
            // 多仓（全仓）：预计强平价格=（合约乘数*预计持仓数量）/（预计开仓成本价值-（预计钱包余额-当前委托保证金）/(1+taker手续费率)-预计开仓成本价值*维持保证金率 - 预计开仓成本价值*Max（0，当前时段资金费率）+abs(预计开仓成本价值)*(1+1/杠杆)*taker手续费率)
            (multiplier * newCurrentQty) / (newPosCost - (newMarginBalance - initMargin) / (1 + commission) - newPosCost * newMaintMarginReq - newPosCost * Math.max(0, fundingRate) + Math.abs(newPosCost) * (1 + 1 / leverage) * commission) :
            // 空仓（全仓）：预计强平价格=（合约乘数*预计持仓数量）/(预计开仓成本价值-（预计钱包余额-当前委托保证金）/(1+taker手续费率)+预计开仓成本价值*维持保证金率 - 预计开仓成本价值*Min（0，当前时段资金费率）+abs(预计开仓成本价值)*(1+1/杠杆)* taker手续费率)
            (multiplier * newCurrentQty) / (newPosCost - (newMarginBalance - initMargin) / (1 + commission) + newPosCost * newMaintMarginReq - newPosCost * Math.min(0, fundingRate) + Math.abs(newPosCost) * (1 + 1 / leverage) * commission)
    }
    if (result <= 0 || result === Infinity || result === -Infinity) {
        return 100000000;
    }
    if (isBuy) {
        result = toUpPrice(result);
    } else {
        result = toLowPrice(result);
    }
    return result;
}