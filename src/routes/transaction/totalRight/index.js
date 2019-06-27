import React, { Component } from 'react'
import { connect } from 'dva';
import { Utils, Tooltip, language } from 'quant-ui';
import { tooltipShow } from '@/utils/utils';
import { getCurrencyType } from '@/utils/utils'
import order from '../../account/trade/order/index.js';
const currency = Utils.currency;
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    // searchAccount = () => {
    //     const { dispatch } = this.props;
    //     dispatch({
    //         type: "margin/getAccount",
    //     })
    // }
    componentDidMount = () => {
        // this.searchAccount()
    }
    render() {
        // eslint-disable-next-line no-unused-vars
        const { dataSource, currencyType, positionHavaListData, showReConecting } = this.props;
        let tooltopValue =  0;
        if(positionHavaListData.length > 0) {
            positionHavaListData.forEach(ele => {
                tooltopValue += Math.abs(ele.markValue);
            });
        }
        let unrealisedPnlWidth = 10;
        let walletBalanceWidth = 90;
        let maintMarginWidth = 10;
        let initMarginWidth = 10;
        let availableMarginWidth = 80;
        if (dataSource) {
            unrealisedPnlWidth = Math.abs(dataSource.unrealisedPnl * 100 / dataSource.marginBalance) || 0;
            walletBalanceWidth = Math.abs(dataSource.walletBalance * 100 / dataSource.marginBalance) || 0;
            maintMarginWidth = (Math.abs(dataSource.maintMargin * 100 / dataSource.marginBalance)) || 0;
            initMarginWidth = (Math.abs(dataSource.initMargin * 100 / dataSource.marginBalance)) || 0;
            availableMarginWidth = (Math.abs(dataSource.availableMargin * 100 / dataSource.marginBalance)) || 0;
        }
        let calculate = Math.pow(10,getCurrencyType().tick);
        let className = '';
        if(dataSource.unrealisedPnl < 0){
            className = 'colorRed';
        }
        return (
            <div className="totalRight">
                <div className="marginDisplay">
                    <div className="rowRight">
                        <div className='margin_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("钱包余额=(存款 - 提款 + 已实现盈亏)"))}>
                                <span className="left">{$('钱包余额')}</span>
                            </Tooltip>
                            <span className="right">{
                                currency(parseInt(((dataSource.walletBalance || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                            }</span>
                        </div>
                        <div style={{ width: "100%" }} className="dataBar transaction_back">
                            <div className='borderColorGreen' style={{minWidth:'1px', width: walletBalanceWidth + "%", height: '100%' }}></div>
                        </div>
                    </div>
                    <div className="rowRight">
                        <div className='margin_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("未实现盈亏: 所有未平仓合约的当前盈亏。"))}>
                                <span className="left">{$('未实现盈亏')}</span>
                            </Tooltip>
                            <span className={"right"}>{
                                currency(parseInt(((dataSource.unrealisedPnl || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                            }</span>
                        </div>
                        <div style={{ width: "100%" }} className="dataBar transaction_back">
                            <div className='borderColorRed' style={{minWidth:'1px', width: unrealisedPnlWidth + "%", marginLeft: (100 - unrealisedPnlWidth) + '%', height: '100%' }}></div>
                        </div>
                    </div>
                    <div className="rowRight">
                        <div className='margin_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('保证金余额')+ ": " + $("你在交易所的总权益。保证金余额=（钱包余额+未实现盈亏）"))}>
                                <span className="left">{$('保证金余额')}</span>
                            </Tooltip>
                            <span className="right">{
                                currency(parseInt(((dataSource.marginBalance || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                            }</span>
                        </div>
                        <div style={{ width: "100%" }} className="dataBar transaction_back">
                            <div className='borderColorGreen' style={{minWidth:'1px', width: dataSource.marginBalance?"100%":"0%", height: '100%' }}></div>
                        </div>
                    </div>
                    <div className="rowRight">
                        <div className='margin_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('仓位保证金') + ": " +$("保留你手持仓位所需的最低保证金要求。此数值为你持有的每种合约的开仓价值乘以其所需的维持保证金比例之和，并加上任何未实现的盈亏。"))}>
                                <span className="left">{$('仓位保证金')}</span>
                            </Tooltip>
                            <span className="right">{
                                currency(parseInt(((dataSource.maintMargin || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                            }</span>
                        </div>
                        <div style={{ width: "100%" }} className="dataBar transaction_back">
                            <div className='borderColorRed' style={{minWidth:'1px', width: maintMarginWidth + "%", marginLeft: (100 - maintMarginWidth) + '%', height: '100%' }}></div>
                        </div>
                    </div>
                    <div className="rowRight">
                        <div className='margin_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('委托保证金') + ": " +$("你的委托所需要的最小保证金额。此数值为你的每个委托价值乘以其所需的起始保证金比例之和。"))}>
                                <span className="left">{$('委托保证金')}</span>
                            </Tooltip>
                            <span className="right">{
                                currency(parseInt(((dataSource.initMargin || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                            }</span>
                        </div>
                        <div style={{ width: "100%" }} className="dataBar transaction_back">
                            <div className='borderColorRed' style={{minWidth:'1px', width: initMarginWidth + "%", marginLeft: availableMarginWidth + '%', height: '100%' }}></div>
                        </div>
                    </div>
                    <div className="rowRight">
                        <div className='margin_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("你可以用于开仓的保证金。可用余额=（保证金余额-委托保证金-仓位保证金）。"))}>
                                <span className="left">{$('可用余额')}</span>
                            </Tooltip>
                            <span className="right">{
                                currency(parseInt(((dataSource.availableMargin || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                            }</span>
                        </div>
                        <div style={{ width: "100%" }} className="dataBar transaction_back">
                            <div className='borderColorGreen' style={{minWidth:'1px', width: availableMarginWidth + "%", height: '100%' }}></div>
                        </div>
                    </div>
                </div>
                <div className="rowRight_last">
                    <Tooltip mouseLeaveDelay={0} placement="right" title={$("总仓位价值")+':' + tooltopValue }>
                    {(dataSource.marginUsedPcnt ?
                        (dataSource.marginUsedPcnt * 100).toFixed(0) : "0") + "% " + $('保证金已被使用') + " " + (dataSource.marginLeverage ? dataSource.marginLeverage.toFixed(2) : "0") + $('倍杠杆')}
                    </Tooltip>
                </div>
                {/* <Button onClick={this.searchAccount}>查询</Button> */}

            </div>
        )
    }
}

export default connect(({ margin, login, orderList }) => {
    const { dataSource, currencyType } = margin;
    const { showReConecting } = login;
    const { positionHavaListData } = orderList;
    return {
        dataSource,
        currencyType,
        showReConecting,
        positionHavaListData
    }
})(
    Index
)
