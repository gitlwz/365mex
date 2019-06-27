import React, { Component } from 'react'
import { connect } from 'dva';
import { Tooltip, Row, Col, language, Icon, Utils, Ellipsis } from 'quant-ui';
import SliderBar from '../slider';
import AddModal from './addModal';
import SliderShow from './sliderShow';
import { getCurrencyType, tooltipShow, toLowPrice } from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 1,
            showInput: false,
            showValue: true
        }
        this.flag = true;
    }
    componentWillMount = () => {

    }
    componentWillReceiveProps = (nextProps) => {
        if (this.flag) {
            const { positionHavaListData, symbolCurrent } = nextProps;
            let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
            if (positionHold) {
                this.flag = false;
                this.setState({
                    value: positionHold.leverage * 12
                })
            }
        }
    }
    onClick = () => {
        this.setState({
            showInput: !this.state.showInput
        })
    }
    onClickRisk = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/save",
            payload: {
                addVisible: true
            }
        })
    }
    changeShow = () => {
        this.setState({
            showValue: !this.state.showValue
        })
    }
    render() {
        const { lastPrice, positionHavaListData, symbolCurrent, riskLimit, currencyType } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        let priceDelta = 0;
        // let min = riskLimit || 20000000000;
        let currentRisk = !!riskLimit ? riskLimit : 20000000000;
        // let Step = riskStep || 10000000000;
        // let num = (currentRisk - min) / Step;
        if (!positionHold) {
            positionHold = {};
        } else {
            currentRisk = positionHold.riskLimit;
        }
        // num = (currentRisk - min) / Step;
        // let maxLe = 1 / (maintMargin * 1 + num * maintMargin);
        // text = text + maxLe + " x";
        // if (positionHold.liquidationPrice) {
        //     text = text + "<br />强平价格: " + positionHold.liquidationPrice;
        // }
        let unrealisedRoePcnt = positionHold.unrealisedRoePcnt || 0;
        let unrealisedPnl = positionHold.unrealisedPnl || 0;
        let classNameNum = "";
        let classNamePrice = "";
        if (this.state.showValue) {
            if (unrealisedRoePcnt < 0) {
                classNameNum = " fontPosL";
            } else if (unrealisedRoePcnt > 0) {
                classNameNum = " fontPosH";
            }
        } else {
            if (unrealisedPnl < 0) {
                classNameNum = " fontPosL";
            } else if (unrealisedPnl > 0) {
                classNameNum = " fontPosH";
            }
        }
        if (positionHold.currentQty < 0) {
            classNamePrice = " fontPosL";
        } else if (positionHold.currentQty > 0) {
            classNamePrice = " fontPosH";
        }
        if (!this.state.showValue) {
            const { instrumentData } = this.props;
            priceDelta = positionHold.avgEntryPrice - instrumentData.markPrice;
        }
        // homeNotional 价值 unrealisedGrossPnl 回报率
        let leverage = positionHold.crossMargin ? 0 : positionHold.leverage;
        // if(leverage || leverage == 0){
        //     textLeft = "开仓价格: " + positionHold.avgEntryPrice + "<br />" + textLeft;
        //     if(leverage == 0){
        //         textLeft = "起始杠杆: 全仓<br />" + textLeft;
        //     }else{
        //         textLeft = "起始杠杆: " + leverage + " x<br />" + textLeft;
        //     }
        // }
        let calculate = Math.pow(10, getCurrencyType().tick);
        return (
            <div className="positionHold">
                <div className="radio">
                    <Row>
                        <Col span={11}>
                            <div style={{ textAlign: "center" }}>
                                <div style={this.state.showValue ? {} : { fontSize: 12 }} className={"numberStyle" + classNamePrice}>{(this.state.showValue ? positionHold.currentQty :
                                    <Ellipsis tooltip length={14}>
                                        {currency(parseInt((Math.abs(positionHold.markValue || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
                                    </Ellipsis>
                                ) || 0}</div>
                                <div style={{ marginBottom: 6 }}>{this.state.showValue ? $("合约") : $("价值")}</div>
                                {positionHold.currentQty && positionHold.currentQty != '0' ? <div>
                                    <div className="numberStyle">{(positionHold.avgEntryPrice) || 0}</div>
                                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("目前多/空仓的平均买入/卖出价。"))}>
                                        <div><span className='underLine_showT'>{$('开仓价格')}</span></div>
                                    </Tooltip>
                                </div> : ""}
                            </div>
                        </Col>
                        <Col span={2} style={{ marginTop: 30 }}>
                            {positionHold.avgEntryPrice || positionHold.avgEntryPrice == '0' ? <Icon onClick={this.changeShow} style={{ fontSize: 16, cursor: "pointer" }} type="swap" /> : ""}
                        </Col>
                        <Col span={11}>
                            <div style={{ textAlign: "center" }}>
                                <div style={this.state.showValue ? {} : { fontSize: 12 }} className={"numberStyle" + classNameNum}>{this.state.showValue ? ((unrealisedRoePcnt * 100).toFixed(2) + "%") :
                                    <Ellipsis tooltip length={14}>
                                        {currency(parseInt(((positionHold.unrealisedPnl || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
                                    </Ellipsis>
                                }</div>
                                {this.state.showValue ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("这是你的回报率百分比。"))}>
                                    <div style={{ marginBottom: 6 }}><span className='underLine_showT'>{$('回报率')}</span></div>
                                </Tooltip> :
                                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("该合约的未实现盈亏"))}>
                                        <div style={{ marginBottom: 6 }}><span className='underLine_showT'>{$('未实现盈亏')}</span></div>
                                    </Tooltip>}

                                {positionHold.currentQty && positionHold.currentQty != '0' ? <div>
                                    <div className="numberStyle">{this.state.showValue ? (positionHold.liquidationPrice || 0) : (toLowPrice(priceDelta).toFixed(1) || 0)}</div>
                                    {this.state.showValue ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("如果该合约的标记价格低于该价格（多仓）或高于该价格（空仓），你将会被强制平仓。"))}>
                                        <div><span className='underLine_showT'>{$("强平价格")}</span></div>
                                    </Tooltip> : <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("开仓价格和最新价格的价差。"))}>
                                            <div><span className='underLine_showT'>{$("价差")}</span></div>
                                        </Tooltip>}
                                </div> : ""}

                            </div>
                        </Col>
                    </Row>
                    <SliderShow length={100} leftLength={-50} />
                    {/* <div className="positionLeverage">
                        <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(textLeft)}>
                            <span className="initialLeverageIcon">
                                <Icon style={{ display: (200 * ((leverage || 0) / maxLe)) <= 16 ? "none" : "" }} type="safety-certificate" theme="filled" />
                            </span>
                        </Tooltip>
                        <div className="indicatorGraph">
                            <div style={{ left: (200 * ((leverage || 0) / maxLe)) || 0 + "%" }} className="lineIndicator">
                                <span className="valueLabel">
                                    {leverage === undefined ? "0.00" :
                                        (positionHold.crossMargin && dataSource.marginLeverage ? dataSource.marginLeverage.toFixed(2) : leverage.toFixed(2)) + " x"}
                                </span>
                            </div>
                        </div>
                        <span style={{ display: (200 * ((leverage || 0) / maxLe)) > 16 ? "none" : "" }} className="indicatorLabel">杠杆</span>
                        <span className="maintLeverageIcon">
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(text)}>
                                <Icon type="warning" theme="filled" />
                            </Tooltip>
                        </span>
                    </div> */}
                    <Row>
                        <Col span={this.state.showInput ? 24 : 22}>
                            <SliderBar currentRisk={currentRisk / 10000000000} onClick={this.onClick} showInput={this.state.showInput} value={leverage} />
                        </Col>
                        {this.state.showInput ? '' : <Col span={2}>
                            <i style={{ marginRight: 1, cursor: "pointer" }} onClick={this.onClick} className={'all-icon-img write'}></i>
                            {/* <Icon style={{ cursor: "pointer" }} onClick={this.onClick} type="form" theme="outlined" /> */}
                        </Col>}
                    </Row>
                    <Row>
                        <Col span={22}>
                            <div className="positionRow">
                                <span className='lableColor'>{$('风险限额')}</span>
                                <span style={{ float: "right" }}>{currency(parseInt(((positionHold.riskValue || 0) / 100000000) * 10000) / 10000, { separator: ',', precision: 4 }).format()} / {(positionHold.riskLimit || riskLimit || 0) / 100000000}{" " + "XBT" || positionHold.underlying}</span>
                            </div>
                        </Col>
                        <Col span={2}>
                            <i style={{ marginRight: 1, cursor: "pointer" }} onClick={this.onClickRisk} className={'all-icon-img write'}></i>
                            {/* <Icon style={{ cursor: "pointer" }} onClick={this.onClickRisk} type="form" theme="outlined" /> */}
                        </Col>
                    </Row>
                </div>
                <AddModal />
            </div >
        )
    }
}

export default connect(({ orderList, instrument, margin }) => {
    const { positionHavaListData } = orderList;
    const { currencyType } = margin;
    const { symbolCurrent, riskLimit, instrumentData, tickSize, riskStep, maintMargin, lastPrice } = instrument;
    return {
        positionHavaListData,
        symbolCurrent,
        riskLimit,
        currencyType,
        // dataSource,
        instrumentData,
        tickSize,
        // riskStep,
        // maintMargin,
        lastPrice
    }
})(
    Index
)
