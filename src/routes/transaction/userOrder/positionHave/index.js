/* eslint-disable no-loop-func */
import React, { Component } from 'react'
import { Table, Button, Utils, InputNumber, Tooltip, language } from 'quant-ui';
import "./index.less";
import AddModal from "./addModal";
import AddModalMargin from "./addModalMargin";
import { connect } from 'dva';
import { getCurrencyType, tooltipShow, getTickLength, toLowPrice, translationParameters } from '@/utils/utils';
import { Formula } from '@/utils/formula';
const FormulaFuc = new Formula();//计算公式
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
const tick = 0.5;//最小变化单位
const lengthNum = 2;//对应长度
let page = null;
let calculate = Math.pow(10, getCurrencyType().tick);
const arrStatus = ['Canceled', 'Rejected', 'Filled'];
const columnsPosition = [{
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此仓位的合约代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    align: 'left',
    className: 'textAlignLeft',
    // sorter: (a, b) => a.symbol - b.symbol,
    onCell: (record, index) => {
        return {
            className: "symbol_position "
        }
    },
    render: (record, obj, index) => {
        let className = 'leftDirection';
        if (obj.currentQty > 0) {
            className += ' borderColorGreen'
        } else if (obj.currentQty < 0) {
            className += ' borderColorRed'
        } else {
            return <div style={{ height: '24px', lineHeight: '24px' }}>
                <span>{record}</span>
            </div>
        }
        return <div style={{ height: '24px', lineHeight: '24px' }}>
            <span className={className}></span>
            <span>{record}</span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('你在此合约的仓位，正数为多仓，负数为空仓。'), $('目前仓位数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('目前仓位数量')}</span>
    </Tooltip>,
    dataIndex: 'currentQty',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => a.currentQty - b.currentQty,
    onCell: (record, index) => {
        return {
            className: record.currentQty > 0 ? "colorGreen textAlignRight" : "colorRed textAlignRight"
        }
    },

}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('仓位现时的名义价值'), $('价值'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('价值')}</span>
    </Tooltip>,
    dataIndex: 'markValue',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => a.markValue - b.markValue,
    render: (record, obj, index) => {
        return <Tooltip mouseLeaveDelay={0} placement="right"
            title={tooltipShow($('名义值') + ": $" + Math.abs(obj.currentQty).toFixed(2))}>
            <span className='underLine_showH' style={{ cursor: 'help' }}>{currency(parseInt((Math.abs(record) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}</span>
        </Tooltip>
    },
    onCell: (record, index) => {
        return {
            key: record.markValue,
            className: record.classNameValue + " textAlignRight"
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('目前多/空仓的平均买入/卖出价。'), $('开仓价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('开仓价格')}</span>
    </Tooltip>,
    dataIndex: 'avgEntryPrice',
    align: 'right',
    className: 'textAlignRight minWidth55',
    sorter: (a, b) => a.avgEntryPrice - b.avgEntryPrice,
    render: (record, obj, index) => {
        if (!!record) {
            return <Tooltip mouseLeaveDelay={0} placement="right"
                title={tooltipShow($('破产价格') + ": " + obj.bankruptPrice)}>
                <span style={{ fontWeight: 'bold' }}>{(Math.round(record * 100) / 100).toFixed(2)}</span>
            </Tooltip>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('这是合约的最新标记价格，此价格用于计算盈亏和保证金，并有可能与合约最新成交价格有偏差以避免市场操控，这不会影响结算。'), $('标记价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('标记价格')}</span>
    </Tooltip>,
    dataIndex: 'markPrice',
    align: 'right',
    className: 'textAlignRight minWidth55',
    sorter: (a, b) => a.markPrice - b.markPrice,
    render: (record, obj, index) => {
        return <span>{record.toFixed(2)}</span>
    },
    onCell: (record, index) => {
        return {
            key: record.markPrice,
            className: record.className + " textAlignRight"
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('如果该合约的标记价格低于该价格（多仓）或高于该价格（空仓），你将会被强制平仓。'), $('强平价格'))}>
        <span className='underLine_show colorRed' style={{ zIndex: 999 }}>{$('强平价格')}</span>
    </Tooltip>,
    dataIndex: 'liquidationPrice',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => a.liquidationPrice - b.liquidationPrice,
    render: (record) => {
        const { tickSize } = page.props;
        return <span className='colorRed'>{record.toFixed(getTickLength(tickSize))}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('被仓位使用并锁定的保证金，如果你有在某个仓位启用逐仓，此数值将会随着保证金下跌而减少，亦代表你的实际杠杆上升，移动滑杆来调整分配到各个仓位的保证金。'), $('保证金'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('保证金')}</span>
    </Tooltip>,
    dataIndex: 'maintMargin',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => a.maintMargin - b.maintMargin,
    render: (record, obj, index) => {
        let text = '(' + $('全仓') + ')';
        if (!obj.crossMargin) {
            try {
                text = "(" + (parseInt((obj.leverage) * 100) / 100 || '--') + "x)";
            } catch (error) {

            }
            return <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点此增减分配到此仓位的保证金。'))}>
                <span onClick={() => page.addVisibleAddMargin(obj.symbol, obj.currentQty, obj.maintMargin)} style={{ cursor: "help" }} className="underLine_showH">{" " + currency(parseInt((Math.abs(record) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key + text}</span>
            </Tooltip>
        } else {
            return <span>{" " + currency(parseInt((record * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key + text}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('该合约的未实现盈亏，以及回报率。'), $('未实现盈亏（回报率%）'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('未实现盈亏（回报率%）')}</span>
    </Tooltip>,
    dataIndex: 'unrealisedRoePcnt',
    align: 'right',
    className: 'textAlignRight ',
    sorter: (a, b) => {
        return a.unrealisedPnl - b.unrealisedPnl
    },
    onCell: (record) => {
        return {
            onMouseEnter: (event) => { page.setState({ hoverShowUn: false }) },  // 鼠标移入行
            onMouseLeave: (event) => { page.setState({ hoverShowUn: true }) },
            style: {
                minWidth: 150
            }
        };
    },
    render: (record, obj, index) => {
        let className = "colorRed";
        let classNameSecond = "colorRed";
        if (obj.unrealisedPnl > 0) {
            className = "colorGreen";
        } else if (obj.unrealisedPnl == 0) {
            className = "";
        }
        if (obj.realisedPnlCal) {
            let pcnt = obj.realisedPnlCal.pcnt.substring(0, obj.realisedPnlCal.pcnt.length - 1) * 1;
            if (pcnt > 0) {
                classNameSecond = "colorGreen";
            } else if (pcnt == 0) {
                classNameSecond = "";
            }
        }
        return <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('这是假设你市价平仓后预测的盈亏，它根据目前的委托列表来计算。'))}>
            <span
                style={{ cursor: "help" }} className={page.state.hoverShowUn ? className : classNameSecond + " underLine_showH"}>
                {page.state.hoverShowUn ?
                    currency(parseInt((obj.unrealisedPnl * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key + " (" + (record * 100).toFixed(2) + "%)" :
                    obj.realisedPnlCal ? obj.realisedPnlCal.pnl + "(" + obj.realisedPnlCal.pcnt + ")" : ''}
            </span>
        </Tooltip>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('自开仓以来的已实现盈亏'), $('已实现盈亏'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('已实现盈亏')}</span>
    </Tooltip>,
    dataIndex: 'realice',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return a.realisedPnl - b.realisedPnl
    },
    onCell: (obj) => {
        return {
            onMouseEnter: (event) => { page.setState({ hoverShow: false }) },  // 鼠标移入行
            onMouseLeave: (event) => { page.setState({ hoverShow: true }) },
            style: {
                minWidth: 70
            }
        };
    },
    render: (record, obj, index) => {
        let className = "colorRed";
        let classNameSecond = "colorRed";
        if (obj.realisedPnl > 0) {
            className = "colorGreen";
        }
        try {
            if (obj.realisedPnl + obj.rebalancedPnl > 0) {
                classNameSecond = 'colorGreen';
            }
        } catch (error) {

        }
        return <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('这是你今天的已实现盈亏。鼠标移开时将显示开仓以来总的已实现盈亏。'))}>
            <span style={{ cursor: "help" }} className={page.state.hoverShowUn ? className + " underLine_showH" : classNameSecond}>{
                page.state.hoverShow ?
                    currency(parseInt(((obj.realisedPnl + obj.rebalancedPnl) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key :
                    currency(parseInt((obj.realisedPnl * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
            }</span>
        </Tooltip>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('你能够在此平仓，这会向市场提交抵消现有仓位的委托，选择“市价”立即使用市场平仓，操作需要确认。'), $('平仓'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('平仓')}</span>
    </Tooltip>,
    dataIndex: 'close',
    align: 'right',
    render: (record, obj, index) => {
        let { loading, symbol, positionHavaListData } = page.props;
        let _positionHavaListData = positionHavaListData.filter(item => item.currentQty !== 0);
        let _loading = loading && obj.symbol === symbol;
        if (_positionHavaListData.length > 0) {
            for (let value of _positionHavaListData) {
                if (value.openOrderSellQty !== 0 || value.openOrderBuyQty !== 0) {
                    const { orderListData } = page.props;
                    let arr = orderListData.filter(item => item.execInst === "Close" && item.symbol === value.symbol && arrStatus.indexOf(item.ordStatus) === -1)
                    if (arr.length > 0) {
                        let closePosition = arr[0];
                        if (arr.length !== 1) {
                            if (closePosition.side === "Buy") { //都是买单，则显示最小的那个价格
                                closePosition = [...arr].sort(function (a, b) {
                                    if (a.price > b.price) {
                                        return 1;
                                    } else if (a.price < b.price) {
                                        return -1;
                                    } else {
                                        return a.transactTime < b.transactTime ? 1 : -1
                                    }
                                })[0];
                            } else {
                                closePosition = [...arr].sort(function (a, b) {
                                    if (a.price > b.price) {
                                        return -1;
                                    } else if (a.price < b.price) {
                                        return 1;
                                    } else {
                                        return a.transactTime < b.transactTime ? 1 : -1
                                    }
                                })[0];
                            }
                        }
                        return <div className="orderListTable">
                            {'在 ' + closePosition.price + ' 的平仓委托 '}
                            <Tooltip mouseLeaveDelay={0} placement="right" title={$('点此取消平仓委托')}>
                                <Button key={closePosition.orderID + "button"} size="small" icon="close" type="danger" loading={_loading} onClick={() => page.cancelOrder(closePosition)}></Button>
                            </Tooltip>
                        </div>
                    }
                }
            }
        }
        let className = 'rightDirection';
        if (obj.currentQty > 0) {
            className += ' borderColorGreen'
        } else if (obj.currentQty < 0) {
            className += ' borderColorRed'
        }
        return <div className="orderListTable">
            <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow($('请选择平仓委托的限价。'))}>
                <input
                    className='input-position-price'
                    type='number'
                    max="100000000"
                    min="0"
                    value={page.markPriceFlag ? toLowPrice(obj.markPrice) : page.state.price}
                    step={tick}
                    onWheel={(e) => {
                        page.pressKey = 'scoll'
                    }}
                    onKeyPress={page.onlyNumber}
                    onKeyDown={(e) => page.pressKey = e.keyCode}
                    onInput={page.onChange}
                />
                {/* <InputNumber
                    min={0}
                    size="small"
                    style={{ marginRight: 5 }}
                    value={page.markPriceFlag ? toLowPrice(obj.markPrice) : page.state.price}
                    formatter={(value) => {
                        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
                        if (((!isNaN(value) && reg.test(value)) || value === '' || value === '-')) {
                            value = String(value);
                            let index = value.indexOf(".");
                            if (index !== -1) {
                                if (index <= value.length - lengthNum) {
                                    let num = parseInt(value / tick);
                                    num = (num * tick).toFixed(lengthNum - 1);
                                    return num;
                                }
                            }
                            return value;
                        } else {
                            return value ? value.substring(0, value.length - 1) : value;
                        }
                    }}
                    step={tick} onChange={page.onChange} /> */}
            </Tooltip>
            <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow(translationParameters([obj.symbol, page.markPriceFlag ? toLowPrice(obj.markPrice) : page.state.price], $('限价平仓提示信息')))}>
                <Button disabled={page.markPriceFlag ? !obj.markPrice : !page.state.price} className='button-color-daybreak' style={{ width: '54px', height: '24px', marginRight: 5 }} key={obj.symbol + "close"} size="small" loading={_loading} onClick={(e) => page.alertCheckCommit(obj, page.markPriceFlag ? toLowPrice(obj.markPrice) : page.state.price)}>{$('平仓 ')}</Button>
            </Tooltip>
            <Tooltip mouseLeaveDelay={0} placement="top" title={tooltipShow(translationParameters([obj.symbol], $('市价平仓提示信息')))}>
                <Button className='button-color-dust' style={{ width: '54px', height: '24px', }} key={obj.symbol + "market"} size="small" type="primary" loading={_loading} onClick={(e) => page.alertCheckCommit(obj, "Market")}>{$('市价')}</Button>
            </Tooltip>
            <span className={className}></span>
        </div>
    }
}];
class Index extends Component {
    constructor(props) {
        super(props);
        page = this;
        this.state = {
            price: props.markPrice,
            hoverShow: true,
            hoverShowUn: true,
        }
        this.firstRender = true;
        this.markPriceFlag = true;
    }
    componentWillReceiveProps = (nextP) => {
        if (nextP.positionHavaListData.length > 0 && this.firstRender) {
            let position = nextP.positionHavaListData.filter(item => item.symbol === this.props.symbolCurrent);
            if (position.length > 0) {
                this.setState({
                    price: toLowPrice(position[0].markPrice)
                })
                this.firstRender = false;
            }
        }
    }
    addVisibleAddMargin = (symbol, currentQty, maintMargin) => {
        const { dispatch, positionHavaListData, takerFee, dataSource, instrumentData } = this.props;
        let _position = positionHavaListData.filter(item => item.symbol === symbol)[0];
        let max = (1 + takerFee) * Math.max(0, _position.posCross - _position.posLoss + Math.min(_position.unrealisedPnl, 0)) || 0;
        let leverage = FormulaFuc.getEffectiveLeverage(_position, instrumentData, dataSource).toFixed(2);
        dispatch({
            type: "orderCommit/save",
            payload: {
                addVisibleAddMargin: true,
                positionSymbol: symbol,
                positionCurrentQty: currentQty,
                positionMaintMargin: maintMargin,
                maxMoveMargin: max,
                leverageCal: leverage
            }
        })
    }
    // searchPosition = () => {
    //     const { dispatch } = this.props;
    //     dispatch({
    //         type: "orderList/getPosition",
    //     })
    // }
    componentDidMount = () => {
        // this.searchPosition()
        let arr = document.getElementsByClassName('ant-table-column-sorters');
        for (let value of arr) {
            value.title = ""
        }
    }
    alertCheckCommit = (positionAlertData, alertPrice) => {
        const { dispatch } = this.props;
        positionAlertData.alertPrice = alertPrice;
        dispatch({
            type: "orderCommit/save",
            payload: {
                addVisiblePosition: true,
                positionAlertData: positionAlertData
            }
        })
    }
    closePosition = (obj, price) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/save",
            payload: {
                symbol: obj.symbol
            }
        })
        let params = {
            execInst: "Close",
            ordType: "Limit",
            price: price,
            symbol: obj.symbol,
            text: "Position Close from 365MEX"
        };
        if (price === "Market") {
            params = {
                execInst: "Close",
                ordType: "Market",
                symbol: obj.symbol,
                text: "Position Close from 365MEX"
            };
        } else {
            params = {
                execInst: "Close",
                ordType: "Limit",
                price: price,
                symbol: obj.symbol,
                text: "Position Close from 365MEX"
            };
        }
        dispatch({
            type: "orderCommit/orderCommit",
            payload: { ...params }
        })
    }
    onlyNumber = (e, key) => {
        if (e.charCode === 45) {
            e.preventDefault();
            return false;
        }
    }
    cancelOrder = (obj) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/cancelOrder",
            payload: {
                orderID: obj.orderID,
            }
        })
    }
    onChange = (e) => {
        this.markPriceFlag = false;
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const reg = /^(0|[1-9][0-9]*)(.[0-9]+)?$/;
        let value = e.target.value;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let price = this.state.price;
            price = value;
            if (index !== -1) {
                if (index <= String(value).length - lengthNum) {
                    let num = parseInt(value / _tickSize);
                    num = (num * _tickSize).toFixed(lengthNum - 1);
                    price = num;
                }
            } else if (this.pressKey === 38 || this.pressKey === 40 || this.pressKey === 'scoll') {
                price = (price * 1).toFixed(getTickLength(_tickSize));
            }
            this.setState({
                price
            })
        }
    }
    render() {
        const { positionHavaListData, currencyType, orderHeight, symbolCurrent } = this.props;
        calculate = Math.pow(10, getCurrencyType().tick)
        let _positionHavaListData = positionHavaListData.filter(item => item.currentQty !== 0);
        if (!this.state.hoverShowUn) {
            const { instrumentData, depthData } = this.props;
            for (let value of _positionHavaListData) {
                value.realisedPnlCal = FormulaFuc.getIndicativePnl(value, instrumentData, depthData, symbolCurrent, getCurrencyType().key)
            }
        }
        return (
            <div className="orderList">
                <Table
                    className='orderList_table_position'
                    pagination={false}
                    rowKey={(record) => {
                        return record.symbol
                    }}
                    scroll={{ x: 'max-content' }}
                    columns={columnsPosition} dataSource={_positionHavaListData} size="small"
                />
                {/* <Button onClick={this.searchPosition}>查询</Button> */}
                <AddModal closePosition={this.closePosition} />
                <AddModalMargin />
            </div>
        )
    }
}

export default connect(({ orderList, instrument, loading, margin, tradeHistory }) => {
    const { positionHavaListData, symbol, orderListData, orderHeight } = orderList;
    const { markPrice, takerFee, instrumentData, symbolCurrent, tickSize } = instrument;
    const { currencyType, dataSource } = margin;
    const { depthData } = tradeHistory;
    return {
        positionHavaListData,
        symbol,
        markPrice,
        currencyType,
        orderHeight,
        orderListData,
        takerFee,
        instrumentData,
        depthData,
        tickSize,
        dataSource,
        symbolCurrent,
        loading: !!loading.effects["orderCommit/orderCommit"]
    }
})(
    Index
)

