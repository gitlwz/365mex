import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Ellipsis, Tooltip, Utils, language } from 'quant-ui';
import { getCurrencyType, tooltipShow } from '@/utils/utils';
import { Formula } from '@/utils/formula';
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
let calculate = Math.pow(10,getCurrencyType().tick);
const FormulaFuc = new Formula();//成本计算公式
export class MarketOrderValue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderQty: 0,
            showMarket:null
        }
        this.orderValue = 0;
        this.orderTick = 0;
    }
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            orderQty: nextProps.orderQty,
            showMarket:nextProps.showMarket
        })
    }
    tooltipShow = (value, title) => {
        if (title) {
            return <span style={{ fontSize: 12 }}>
                {value}
            </span>;
        } else {
            return <span style={{ fontSize: 12 }}>
                {value}
            </span>
        }
    }
    orderValueCul = () => {
        // eslint-disable-next-line no-unused-vars
        const { lastPrice, currencyType } = this.props;
        let multiplier = getCurrencyType().value;
        if (lastPrice) {
            let orderValue = Math.round((1 * 1 / lastPrice) * Math.abs(multiplier)) * this.state.orderQty;
            this.orderValue = orderValue;
            this.orderTick = getCurrencyType().tick;
        }
    }
    getMarginRequirement = (buy, sell, margin) => {
        const { instrumentData, positionHavaListData, symbolCurrent } = this.props;
        let price = this.state.price;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        if (instrumentData.symbol && positionHold) {
            if (buy) {
                price = instrumentData.askPrice;
            } else {
                price = instrumentData.bidPrice;
            }
            return FormulaFuc.getMarginRequirement(instrumentData, positionHold, buy ? this.state.orderQty * 1 : -this.state.orderQty * 1, price, margin);
        } else {
            return 0;
        }
    }
    render() {
        const { dataSource } = this.props;
        let _dataSource = dataSource || {};
        this.orderValueCul();
        let marginReqBuy = this.getMarginRequirement(true, false, dataSource);
        let marginReqSell = this.getMarginRequirement(false, true, dataSource);
        return (
            <div className="totalData">
                <Row className="totalDataRow" style={{height:38}}>
                    <Col span={12}>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('成交本委托所需的保证金。它考虑你选择的杠杆和现有仓位。减仓并不需要保证金。'))}>
                            <span style={{ cursor: "help" }}>{$('成本')}:</span>
                        </Tooltip>
                        <span className='totalDataRowNumber'>
                            <span style={{ float: 'right' }}>
                                <Ellipsis tooltip length={11}>{
                                    currency(parseInt((marginReqBuy  * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: this.orderTick }).format() + " " + getCurrencyType().key}
                                </Ellipsis>
                            </span>
                        </span>
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('成交本委托所需的保证金。它考虑你选择的杠杆和现有仓位。减仓并不需要保证金。'))}>
                            <span  style={{ cursor: "help",float: 'left', marginLeft: 5  }}>{$('成本')}:</span>
                        </Tooltip>
                        <span className='totalDataRowNumber'>
                            <span style={{ float: 'right' }}>
                                <Ellipsis tooltip length={11}>{
                                    currency(parseInt((marginReqSell  * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: this.orderTick }).format() + " " + getCurrencyType().key}
                                </Ellipsis>
                            </span>
                        </span>
                    </Col>
                </Row>
                <Row className="totalDataRowSecond">
                    <span>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={this.tooltipShow($("此委托的总名义价值"))}>
                            <span style={{ cursor: 'help' }}>{$('委托价值')}：</span>
                        </Tooltip>
                    </span>
                    <span className='totalDataRowNumber' style={{ float: "right" }}>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={this.tooltipShow($("此委托的总名义价值"))}>
                            <span style={{ cursor: 'help' }} className="specialSpan">{_dataSource.currency === undefined ? "0.0000 XBT" :
                                currency(parseInt(this.orderValue *  calculate)  / calculate, { separator: ',', precision: this.orderTick }).format() + " " + getCurrencyType().key}</span>
                        </Tooltip>
                    </span>
                </Row>
                <Row className="totalDataRowSecond">
                    <span span={12}>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={this.tooltipShow($("你建立委托的可用余额，点此查看钱包详情。"))}>
                            <span style={{ cursor: 'help' }}>{$('可用余额')}：</span>
                        </Tooltip>
                    </span>
                    <span className='totalDataRowNumber' style={{ float: "right" }} span={12}>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={this.tooltipShow($("你建立委托的可用余额，点此查看钱包详情。"))}>
                            <span style={{ cursor: 'help' }} className="specialSpan">{currency(parseInt(((_dataSource.availableMargin || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: this.orderTick }).format() + " " + getCurrencyType().key}
                            </span>
                        </Tooltip>
                    </span>
                </Row>
            </div>
        )
    }
}
export default connect(({ loading, margin, instrument, orderList }) => {
    const { dataSource, currencyType } = margin;
    const { lastPrice, multiplier, instrumentData, symbolCurrent } = instrument;
    const { positionHavaListData } = orderList;
    return {
        dataSource,
        multiplier,
        lastPrice,
        currencyType,
        positionHavaListData,
        instrumentData,
        symbolCurrent,
    }
})(
    MarketOrderValue
)
