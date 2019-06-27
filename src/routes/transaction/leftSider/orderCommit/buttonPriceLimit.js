import React, { Component } from 'react'
import { connect } from 'dva';
import { Button, Row, Col, Tooltip, Ellipsis, Utils, language } from "quant-ui";
import { tooltipShow, getCurrencyType, getTickLength, translationParameters } from '@/utils/utils';
import ShowIcon from './showIcon';
import AvailableMargin from './availableMargin.js';
import { Formula } from '@/utils/formula';
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
const FormulaFuc = new Formula();//成本计算公式
class ButtonPriceLimit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            price: 0,
            orderQty: 1,
            stopPx: 0,
            buyWidth: 0,
            sellWidth: 0,
            positionHold:{}
        }
        this.orderValue = 0;
        this.maxNumFlag = false;
        this.orderTick = 0;
    }
    shouldComponentUpdate = (nextP, nextS) => {
        try {
            if (nextP.dataSource.availableMargin !== this.props.dataSource.availableMargin) {
                return true;
            }
            if (this.state.positionHold.initMargin !== nextS.positionHold.initMargin) {
                return true;
            }
            if (this.state.positionHold.openOrderBuyCost !== nextS.positionHold.openOrderBuyCost) {
                return true;
            }
            if (this.state.positionHold.openOrderBuyQty !== nextS.positionHold.openOrderBuyQty) {
                return true;
            }
            if (this.state.positionHold.openOrderSellQty !== nextS.positionHold.openOrderSellQty) {
                return true;
            }
            if (this.state.positionHold.openOrderSellCost !== nextS.positionHold.openOrderSellCost) {
                return true;
            }
            if (this.state.positionHold.currentQty !== nextS.positionHold.currentQty) {
                return true;
            }
        } catch (error) {
        }
        if (nextP.textBuy !== this.props.textBuy) {
            return true;
        }
        if (nextP.displayQtyFlag !== this.props.displayQtyFlag) {
            return true;
        }
        if (nextP.currencyType !== this.props.currencyType) {
            return true;
        }
        if (nextP.trailingStop !== this.props.trailingStop) {
            return true;
        }
        if (nextP.touchType !== this.props.touchType) {
            return true;
        }
        if (nextS.orderQty !== this.state.orderQty) {
            return true;
        }
        if (nextS.price !== this.state.price) {
            return true;
        }
        if (nextS.leverage !== this.state.leverage) {
            return true;
        }
        if (nextS.stopPx !== this.state.stopPx) {
            return true;
        }
        if (nextP.marketStop !== this.props.marketStop) {
            return true;
        }
        if (nextP.stopSellFlag !== this.props.stopSellFlag) {
            return true;
        }
        if (nextP.indicativeSettlePrice !== this.props.indicativeSettlePrice) {
            return true;
        }
        if (nextP.markPrice !== this.props.markPrice) {
            return true;
        }
        if (nextP.lastPrice !== this.props.lastPrice) {
            return true;
        }
        if (nextP.stopSellFlag !== this.props.stopSellFlag) {
            return true;
        }
        if (nextP.stopBuyFlag !== this.props.stopBuyFlag) {
            return true;
        }
        if (nextP.orderType !== this.props.orderType) {
            return true;
        }
        if (nextP.displayQty !== this.props.displayQty) {
            return true;
        }
        if (nextP.setRiskSuccess !== this.props.setRiskSuccess) {
            return true;
        }
        return false;
    }
    componentWillReceiveProps = (nextProps) => {
        const { sellData, buyData, price, orderQty, stopPx, positionHavaListData, symbolCurrent } = nextProps;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        let buyWidth = 0;
        let leverage = positionHold?positionHold.leverage : 0;
        let sellWidth = 0;
        if (!!price) {
            if (sellData.length > 0 && price >= sellData[sellData.length - 1].price) {
                let sellAll = sellData.find((item) => item.price <= price);
                if (!sellAll) {
                    sellAll = sellData[0];
                }
                buyWidth = (sellAll.all / orderQty) * 100;
                if (buyWidth > 100) {
                    buyWidth = 100;
                    sellWidth = 0;
                }
            } else if (buyData.length > 0 && price <= buyData[0].price) {
                let buyAll = buyData.find((item) => item.price <= price);
                if (!buyAll) {
                    buyAll = buyData[buyData.length - 1];
                }
                sellWidth = (buyAll.all / orderQty) * 100;
                if (sellWidth > 100) {
                    sellWidth = 100;
                    buyWidth = 0;
                }
            }
        }else{
            buyWidth = 100;
            sellWidth = 100;
        }
        this.setState({
            orderQty: orderQty,
            price: price,
            stopPx: stopPx,
            buyWidth,
            sellWidth,
            leverage,
            positionHold
        })
    }
    stopBuyFlag = () => {

    }
    orderValueCul = () => {
        let price = this.state.price;
        if (this.props.marketStop === "market") {
            const { lastPrice } = this.props;
            price = lastPrice;
        }
        // eslint-disable-next-line no-unused-vars
        const { currencyType } = this.props;
        let multiplier = getCurrencyType().value;
        // eslint-disable-next-line eqeqeq
        if (price != 0) {
            let priceT = Math.round((1 * 1 / price) * 100000000);
            let orderValue = (this.state.orderQty * priceT * getCurrencyType().value / 100000000);
            this.orderValue = orderValue;
            this.orderTick = getCurrencyType().tick;
        }
    }
    toFixedUo = (value) => {
        if (value && value !== "") {
            let arr = value.toString().split(".");
            if (arr.length === 2) {
                let num = arr[1] / 100;
                if (num > 0.5) {
                    return (Number(arr[0]) + 0.5);
                } else {
                    return Number(arr[0]);
                }
            } else {
                return value;
            }
        }
        return 0;
    }
    getMarginRequirement = (buy, sell, margin) => {
        const { instrumentData, positionHavaListData, symbolCurrent } = this.props;
        let price = this.state.price;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        if (instrumentData.symbol && positionHold) {
            if (buy) {
                if (this.props.orderType === "marketStopLose" || this.props.orderType === "marketStopTarget") {
                    price = instrumentData.askPrice;
                }
            } else {
                if (this.props.orderType === "marketStopLose" || this.props.orderType === "marketStopTarget") {
                    price = instrumentData.bidPrice;
                }
            }
            return FormulaFuc.getMarginRequirement(instrumentData, positionHold, buy ? this.state.orderQty * 1 : -this.state.orderQty * 1, price, margin);
        } else {
            return 0;
        }
    }
    getLiquidationPrice = () => {
        const { instrumentData, positionHavaListData, symbolCurrent, dataSource, } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        let liqPrice = this.state.price;
        let orderQty = this.state.orderQty;
        let arr = [];
        if (instrumentData.symbol && positionHold && dataSource) {
            arr.push(FormulaFuc.getLiquidationPrice(instrumentData, positionHold, dataSource, orderQty * 1, liqPrice * 1, positionHold.leverage)|| '---');
            arr.push(FormulaFuc.getLiquidationPrice(instrumentData, positionHold, dataSource, -orderQty * 1, liqPrice * 1, positionHold.leverage) || '---');
        }
        return arr;
    }
    render() {
        const { textBuy, tickSize, dataSource } = this.props;
        let stopSellFlag = true;
        let stopBuyFlag = true;
        let big = "≥";
        let small = "≤";
        let textSecond = $('若完全成交, ') + ", ";
        let textSecondOther = $('若完全成交, ') + ", ";
        let text = "<br /><br />" + $('按钮下的白色条如果出现的话, 代表委托多少部分有机会在提交到市场后立即成交。');
        let forceCloseB = "<br /><br />" + translationParameters([3899], $('你在操作后的预计强平价格是'));
        let forceCloseS = "<br /><br />" + translationParameters([3899], $('你在操作后的预计强平价格是'));
        let firstTitle = this.state.price;
        let secondTitle = $('限价');
        let countPrice = 0;
        let liqArr = [];
        if (this.props.orderType === 'orderLimitPrice') {
            liqArr = this.getLiquidationPrice();
            if (liqArr.length === 0) {
                liqArr = ['', ''];
            }
            forceCloseB = "<br /><br />" + translationParameters([liqArr[0]], $('你在操作后的预计强平价格是'));
            forceCloseS = "<br /><br />" + translationParameters([liqArr[1]], $('你在操作后的预计强平价格是'));
        }
        if (this.props.orderType === "marketStopLose") {
            firstTitle = $('市价');
            secondTitle = $('市价止损');
            forceCloseB = "";
            forceCloseS = "";
            textSecond = translationParameters([$('最近成交价'), $('高于'), this.state.stopPx], $('它会在或等于时触发。'));
            textSecondOther = translationParameters([$('最近成交价'), $('低于'), this.state.stopPx], $('它会在或等于时触发。'));
            text = "";
        } else if (this.props.orderType === "marketStopTarget") {
            firstTitle = $('市价')
            secondTitle = $('市价止盈')
            forceCloseB = "";
            forceCloseS = "";
            textSecond = translationParameters([$('最近成交价'), $('低于'), this.state.stopPx], $('它会在或等于时触发。'));
            textSecondOther = translationParameters([$('最近成交价'), $('高于'), this.state.stopPx], $('它会在或等于时触发。'));
            text = "";
        }
        if (textBuy.indexOf("止盈") !== -1) {
            big = "≤";
            small = "≥";
        }
        if (this.props.trailingStop) {
            firstTitle = $('市价');
            secondTitle = $('追踪止损');
            forceCloseB = "";
            forceCloseS = "";
            if (this.props.touchType === "标记") {
                countPrice = (this.toFixedUo(this.props.markPrice) + this.state.stopPx).toFixed(1);
                textSecond = " 它会在标记价格" + (big === "≥" ? "高于" : "低于") + "或等于 " + countPrice + " 时触发。若完全成交, ";
            } else if (this.props.touchType === "最新成交") {
                countPrice = (this.toFixedUo(this.props.lastPrice) + this.state.stopPx).toFixed(1);
                textSecond = " 它会在最新成交价" + (big === "≥" ? "高于" : "低于") + "或等于 " + countPrice + " 时触发。若完全成交, ";
            } else {
                countPrice = (this.toFixedUo(this.props.indicativeSettlePrice) + this.state.stopPx).toFixed(1);
                textSecond = " 它会在指数价格" + (big === "≥" ? "高于" : "低于") + "或等于 " + countPrice + " 时触发。若完全成交, ";
            }
            text = "";
            if (this.state.stopPx > 0) {
                stopBuyFlag = false;
                stopSellFlag = true;
            } else if (this.state.stopPx < 0) {
                stopBuyFlag = true;
                stopSellFlag = false;
            }
        }
        else {
            const { lastPrice, marketStop } = this.props;
            countPrice = lastPrice;
            let stopPx = this.state.stopPx;
            let priceTag = "";
            let aboveOr = "";
            let aboveOrS = "";
            if (this.props.orderType !== "orderLimitPrice") {
                if (big === "≥") {
                    aboveOr = $('高于');
                    aboveOrS = $('低于');
                } else {
                    aboveOr = $('低于');
                    aboveOrS = $('高于');
                }
                if (this.props.touchType === "标记") {
                    priceTag = $('标记价格');
                    countPrice = this.props.markPrice;
                } else if (this.props.touchType === "最新成交") {
                    countPrice = this.props.lastPrice;
                    priceTag = $('最新成交价');
                } else {
                    countPrice = this.props.indicativeSettlePrice;
                    priceTag = $('指数价格');
                }
                textSecond = translationParameters([priceTag, aboveOr, this.state.stopPx], $('它会在或等于时触发。')) + $('若完全成交, ');
                textSecondOther = translationParameters([priceTag, aboveOrS, this.state.stopPx], $('它会在或等于时触发。')) + $('若完全成交, ');
            }
            if (marketStop === "limitStopLoss") {
                secondTitle = $('限价止损')
                forceCloseB = "";
                forceCloseS = "";
                text = "";
            } else if (marketStop === "limitStopTrai") {
                secondTitle = $('限价止盈')
                forceCloseB = "";
                forceCloseS = "";
                text = "";
                stopPx = countPrice;
                countPrice = this.state.stopPx;
            }
            else if (this.props.stopSellFlag && this.props.stopBuyFlag) {//marketStopTarget
                stopPx = countPrice;
                countPrice = this.state.stopPx;
            }
            if (stopPx > countPrice) {
                stopBuyFlag = false;
                stopSellFlag = true;
            } else if (stopPx < countPrice) {
                stopBuyFlag = true;
                stopSellFlag = false;
            }
        }
        this.orderValueCul();
        if (this.state.orderQty > 10000000 || this.state.price > 1000000 || (this.props.displayQtyFlag && (this.state.orderQty * 1 < this.props.displayQty * 1))) {
            this.maxNumFlag = true;
        } else {
            this.maxNumFlag = false;
        }

        let marginReqBuy = this.getMarginRequirement(true, false, dataSource) || 0;
        let marginReqSell = this.getMarginRequirement(false, true, dataSource) || 0;
        let calculate = Math.pow(10,getCurrencyType().tick);
        return (
            <div>
                <div className="buttonMid">
                    <Row>
                        <Col span={12} >
                            <Button style={{ height: this.props.height }} disabled={this.state.price == "0" || this.state.orderQty == '0' || this.state.stopPx == '0' || (this.props.stopSellFlag ? stopBuyFlag : this.props.flag) || this.maxNumFlag}
                                // loading={loading} 
                                className="green" onClick={(e) => this.props.orderButtonClick("Buy")} block>
                                <span>{$(this.props.textBuy)}</span>
                                <div className="borderTop">
                                    <div style={{ paddingTop: 2 }}>
                                        {this.state.orderQty + " @ "}
                                        {this.props.marketStop === "market" ? $('市价') : this.state.price ? (this.state.price * 1).toFixed(getTickLength(tickSize)) : ""}
                                        <ShowIcon forceClose={forceCloseB} secondText={textSecond} orderQty={this.state.orderQty} firstTitle={firstTitle} secondTitle={secondTitle} flag="askPrice" text={text} />
                                    </div>
                                    {this.props.marketStop ?
                                        <div>{$('触发')}： {big + " " + (this.props.trailingStop ? countPrice : (this.state.stopPx * 1).toFixed(getTickLength(tickSize)))}</div>
                                        : ""}
                                </div>
                            </Button>
                            <div style={{ width: this.state.buyWidth + "%" }} className="fillPcnt"></div>
                        </Col>
                        <Col span={11} offset={1}>
                            <Button style={{ height: this.props.height }} disabled={this.state.price == "0" || this.state.orderQty == '0' || this.state.stopPx == '0' || (this.props.stopSellFlag ? stopSellFlag : this.props.flag) || this.maxNumFlag}
                                // loading={loading}
                                className="red" onClick={(e) => this.props.orderButtonClick("Sell")} block>
                                <span>{$(this.props.textSell)}</span>
                                <div className="borderTop">
                                    <div style={{ paddingTop: 2 }}>
                                        {this.state.orderQty + " @ "}
                                        {this.props.marketStop === "market" ? $('市价') : this.state.price ? (this.state.price * 1).toFixed(getTickLength(tickSize)) : ""}
                                        <ShowIcon forceClose={forceCloseS} secondText={textSecondOther} orderQty={this.state.orderQty} firstTitle={firstTitle} secondTitle={secondTitle} flag="bidPrice" text={text} />
                                    </div>
                                    {this.props.marketStop ?
                                        <div>{$('触发')}： {small + " " + (this.props.trailingStop ? countPrice : (this.state.stopPx * 1).toFixed(getTickLength(tickSize)))}</div>
                                        : ""}
                                </div>
                            </Button>
                            <div style={{ width: this.state.sellWidth + "%" }} className="fillPcnt"></div>
                        </Col>
                    </Row>
                </div>
                <div className="totalData">
                    <Row className="totalDataRow" style={{ height: 38 }}>
                        <Col span={12}>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('成交本委托所需的保证金。它考虑你选择的杠杆和现有仓位。减仓并不需要保证金。'))}>
                                <span style={{ cursor: "help" }}>{$('成本')}:</span>
                            </Tooltip>
                            <span className='totalDataRowNumber'>
                                <span style={{ float: 'right' }}>
                                    <Ellipsis tooltip length={10}>{
                                        currency(parseInt((marginReqBuy * getCurrencyType().value / 100000000) *  calculate) / calculate, { separator: ',', precision: this.orderTick }).format() + " " + getCurrencyType().key}
                                    </Ellipsis>
                                </span>
                            </span>

                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('成交本委托所需的保证金。它考虑你选择的杠杆和现有仓位。减仓并不需要保证金。'))}>
                                <span style={{ cursor: "help", float: 'left', marginLeft: 5 }}>{$('成本')}: </span>
                            </Tooltip>
                            <span className='totalDataRowNumber'>
                                <span style={{ float: 'right' }}>
                                    <Ellipsis tooltip length={10}>{
                                        currency(parseInt((marginReqSell * getCurrencyType().value / 100000000) *  calculate) / calculate, { separator: ',', precision: this.orderTick }).format() + " " + getCurrencyType().key}
                                    </Ellipsis>
                                </span>
                            </span>
                        </Col>
                    </Row>
                    <Row className="totalDataRowSecond">
                        <span>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('此委托的总名义价值'))}>
                                <span style={{ cursor: "help" }}>{$('委托价值')}：</span>
                            </Tooltip>
                        </span>
                        <span className='totalDataRowNumber' style={{ float: "right" }}>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('此委托的总名义价值'))}>
                                <span style={{ cursor: "help" }} className="specialSpan">{
                                    currency(parseInt(this.orderValue *  calculate) / calculate, { separator: ',', precision: this.orderTick }).format() + " " + getCurrencyType().key}</span>
                            </Tooltip>
                        </span>
                    </Row>
                    <AvailableMargin />
                </div>
            </div>
        )
    }
}

export default connect(({ recentTrade, margin, instrument, orderList }) => {
    const { currencyType, dataSource } = margin;
    const { positionHavaListData, setRiskSuccess } = orderList;
    const { lastPrice, indicativeSettlePrice, markPrice, tickSize, instrumentData, symbolCurrent } = instrument;
    const { sellData, buyData } = recentTrade;
    return {
        lastPrice,
        dataSource,
        currencyType,
        setRiskSuccess,
        indicativeSettlePrice,
        markPrice,
        sellData,
        buyData,
        tickSize,
        instrumentData,
        positionHavaListData,
        symbolCurrent
    }
})(
    ButtonPriceLimit
)

