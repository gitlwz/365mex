/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import { Icon, Spin, Utils, Tooltip, language } from 'quant-ui';
import { connect } from 'dva';
import moment from "moment";
import { tooltipShow, getCurrencyType, translationParameters, getTickLength, showLastTickDirection } from '@/utils/utils'
const currency = Utils.currency;
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flag: false
        };
        this.orderTick = 0;
    }
    componentWillMount = () => {
    }
    onMouseOver = () => {
        this.setState({

            flag: true
        })
    }
    onMouseOut = () => {
        this.setState({
            flag: false
        })
    }
    showLight = (deleveragePercentile) => {
        let showLight = [<div key="leverageLight_0" className="leverageLight inactive statusGreen"></div>,
        <div key="leverageLight_1" className="leverageLight inactive statusGreen"></div>,
        <div key="leverageLight_2" className="leverageLight inactive statusGreen"></div>,
        <div key="leverageLight_3" className="leverageLight inactive statusGreen"></div>,
        <div key="leverageLight_4" className="leverageLight inactive statusGreen"></div>];
        if (deleveragePercentile == 1) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.8) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.6) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
            showLight[2] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.4) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
            showLight[2] = <div className="leverageLight active statusGreen"></div>;
            showLight[3] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.2) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
            showLight[2] = <div className="leverageLight active statusGreen"></div>;
            showLight[3] = <div className="leverageLight active statusGreen"></div>;
            showLight[4] = <div className="leverageLight active statusGreen"></div>;
        }
        return showLight;
    }
    checkDownOrUp = (value, indicativeValue, positionHold) => {
        let className = "";
        try {
            if(positionHold.currentQty > 0 || positionHold.currentQty < 0){
                if(indicativeValue > 0){
                    className = "arrow-up";//绿色
                }else if(indicativeValue < 0){
                    className = "arrow-down";//红色
                }
            }else{
                if(value > 0){
                    className = "arrow-up";//绿色
                }else if(value < 0){
                    className = "arrow-down";//红色
                }
            }
            
        } catch (error) {
            
        }
        return className;
    }
    render() {
        const { instrumentData, dataSource, symbolCurrent, positionHavaListData } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        if (!positionHold) {
            positionHold = {};
        }
        let timestamp = new Date(instrumentData.timestamp);
        let fundingTimestamp = new Date(instrumentData.fundingTimestamp);
        let hours = "";
        let minute = "";
        let showMinute = false;
        if (timestamp) {
            // hours = Math.ceil((((fundingTimestamp - timestamp) / 1000) - (parseInt(((fundingTimestamp - timestamp) / 1000) / (24 * 60 * 60))) * 24 * 60 * 60) / (60 * 60));
            hours =Math.floor(moment(instrumentData.fundingTimestamp).diff(moment(),'minute') / 60);
            minute = moment(instrumentData.fundingTimestamp).diff(moment(),'minute') % 60;
        }
        if (!hours) {
            if(hours === 0){
                showMinute = true;
                hours = hours + 1;
                // hours = minute;
            }else{
                hours = '--';
            }
        }
        let calculateS = Math.pow(10, getCurrencyType().tick);
        let instrument = instrumentData || {};
        // let lastPrice = instrument.lastPrice || "";
        // let icon = showLastTickDirection(instrumentData.lastTickDirection);
        let indicativeValue = ((instrument.indicativeFundingRate) * Math.abs(positionHold.markValue + positionHold.unrealisedPnl)) || 0;
        let fundingRateValue = (instrument.fundingRate * Math.abs(positionHold.markValue)) || 0;
        if(positionHold.currentQty > 0){//多仓
            indicativeValue = indicativeValue * -1;
            fundingRateValue = fundingRateValue * -1;
        }
        let className = '';
        let classNameCost = '';
        if(this.state.flag){
            className = this.checkDownOrUp(instrument.indicativeFundingRate, indicativeValue, positionHold);
            if(indicativeValue > 0){
                classNameCost = 'arrow-up'
            }else if(indicativeValue < 0){
                classNameCost = 'arrow-down'
            }
        }else{
            className = this.checkDownOrUp(instrument.fundingRate, indicativeValue, positionHold);
            if(fundingRateValue > 0){
                classNameCost = 'arrow-up'
            }else if(fundingRateValue < 0){
                classNameCost = 'arrow-down'
            }
        }
        return (
            <Spin wrapperClassName="instrumentDetal_spin" spinning={false}>
                <div className="instrumentDetal">
                    <div>
                        {/* <div className={"headPrice " + icon}>
                            {lastPrice ? lastPrice.toFixed(getTickLength(instrument.tickSize)) : "--"}<Icon type={icon} theme="outlined" />
                        </div>
                        <div className="secondHeadPrice">
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('指数价格: 标的资产的价格') + '<br />' + $('这是.365XBT的价格，点此查看历史价格。'))}>
                                <span className='indicativeSettlePrice'>
                                    <i style={{ marginRight: 1 }} className={'all-icon-img earth'}></i>
                                    <span className="secondHeadPrice_span">{parseFloat(instrument.indicativeSettlePrice || 0).toFixed(3).slice(0, -1) || '--'}</span>
                                </span>/
                            </Tooltip>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("标记价格：这是现在的标记价格，点此了解更多。"))}>
                                <span className='indicativeSettlePrice'>
                                    <i style={{ marginRight: 1 }}  className={'all-icon-img earthMark'}></i>
                                    {parseFloat(instrument.markPrice || 0).toFixed(3).slice(0, -1) || '--'}
                                </span>
                            </Tooltip>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("这一指标显示你在自动减仓队列中的位置。如果所有的指示灯都亮起，在发生强平事件后，你的仓位可能被减小。点击查看更多详细信息。"))}>
                                <div className="positionDeleverageIndicatorWrapper">
                                    <a>
                                        <div className="positionDeleverageIndicator">
                                            {this.showLight(positionHold.deleveragePercentile)}
                                        </div>
                                    </a>
                                </div>
                            </Tooltip>
                        </div> */}
                        <div className="content" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
                            <div className="lineItem">
                                <span className="tooltipWrapper">
                                    <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow($("价格资料来源"), $('价格来源'))}>
                                        <span className="key">{$('价格来源')}</span>
                                        <span className="value">{$('365MEX指数')}</span>
                                    </Tooltip>
                                </span>
                            </div>
                            <div className="lineItem">
                                <span className="tooltipWrapper">
                                    <span className="key">{$('365MEX指数的价格')}</span>
                                    <span className="value">{parseFloat(instrument.indicativeSettlePrice || 0).toFixed(3).slice(0, -1) || '--'}</span>
                                </span>
                            </div>
                            <div className="lineItem">
                                <span className="tooltipWrapper">
                                    <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow($("前24小时总合约交易价值。"), $("24小时营业额"))}>
                                        <span className="key">{this.state.flag ? $("24小时营业额") : $("24小时交易量")}</span>
                                        <span className="value">
                                            {this.state.flag ?
                                                currency(parseInt(((instrument.turnover24h || 0) * getCurrencyType().value / 100000000) * calculateS) / calculateS, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key :
                                                currency(instrument.foreignNotional24h, { separator: ',', precision: 0 }).format() + " " + (instrument.quoteCurrency || 'USD')}
                                        </span>
                                    </Tooltip>
                                </span>
                            </div>
                            <div className="lineItem">
                                <span className="tooltipWrapper">
                                    <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow($("未平仓合约的总价值。"), $("未平仓合约价值"))}>
                                        <span className="key">{this.state.flag ? $("未平仓合约价值") : $("未平仓合约数量")}</span>
                                        <span className="value">{
                                            this.state.flag ?
                                                currency(parseInt(((instrument.openValue || 0) * getCurrencyType().value / 100000000) * calculateS) / calculateS, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key :
                                                currency(instrument.openInterest, { separator: ',', precision: 0 }).format() + " " + (instrument.quoteCurrency || 'USD')}</span>
                                    </Tooltip>
                                </span>
                            </div>
                            <div className="lineItem">
                                <span className="tooltipWrapper">
                                    <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow($("这里显示的数字是预测的下一个资金时段的资金费率。这是多仓需要付给空仓的费率。如果该数值是负数，代表空仓要付给多仓。"), $("预测费率"))}>
                                        <span className="key">{this.state.flag ? $("预测费率") : $("资金费率")}</span>
                                        <span className="value">
                                            <span className={className} >{this.state.flag ?
                                                ((instrument.indicativeFundingRate * 100).toFixed(4) || '0.0000') :
                                                instrument.fundingRate ? (instrument.fundingRate * 100).toFixed(4) : '0.0000'} % </span>
                                            <span>{translationParameters([this.state.flag ? hours + 8 : hours], $('小时内'))}</span>
                                        </span>
                                    </Tooltip>
                                </span>
                            </div>
                            {positionHold.avgEntryPrice ?
                                <div className="lineItem">
                                    <span className="tooltipWrapper">
                                        <span className="key">{this.state.flag ? $("预测费用") : $("资金费用")}</span>
                                        <span className="value">
                                            <span className={classNameCost} >{this.state.flag ?
                                                ((currency(parseInt((indicativeValue * getCurrencyType().value / 100000000) * calculateS) / calculateS, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key) || '0.00') :
                                                (instrument.fundingRate ? (currency(parseInt((fundingRateValue * getCurrencyType().value / 100000000) * calculateS) / calculateS, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key) : '0.00')
                                            } </span>
                                        </span>
                                    </span>
                                </div> : ""}
                            <div className="lineItem">
                                <span className="tooltipWrapper">
                                    <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow($("当前一份合约的价值。"), $("合约价值"))}>
                                        <span className="key">{$('合约价值')}</span>
                                        <span className="value">{(instrument.lotSize ? instrument.lotSize.toFixed(2) : "-- " )+ (instrument.quoteCurrency || 'USD')}</span>
                                    </Tooltip>
                                </span>
                            </div>
                            <div className="lineItem">
                                <span className="tooltipWrapper">
                                    <a className="key">{$('更多资料')}...</a>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Spin>
        )
    }
}

export default connect(({ instrument, loading, margin, orderList }) => {
    const { instrumentData, symbolCurrent } = instrument;
    const { positionHavaListData } = orderList;
    const { dataSource, currencyType } = margin;
    return {
        instrumentData,
        dataSource,
        currencyType,
        symbolCurrent,
        positionHavaListData,
        loading: !!loading.effects["instrument/getInstrumentBySymbol"]
    }
})(
    Index
)