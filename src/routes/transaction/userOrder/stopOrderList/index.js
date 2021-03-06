/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import { Table, Button, language, Tooltip, Modal, Tag, Icon, Checkbox } from 'quant-ui';
import "./index.less";
import moment from "moment";
import { connect } from 'dva';
import { getTickLength, tooltipShow, translationParameters, toLowPrice, sortHideFunction } from '@/utils/utils';
import { getOrdType, getTradeStatus, inMarketOrStop, inShowClear } from '@/utils/dictionary';
import cloneDeep from "lodash/cloneDeep";
let { getLanguageData } = language;
let $ = getLanguageData;
let page = null;
const confirm = Modal.confirm;
let columns = [{
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('有关合约的市场代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    align: 'left',
    className: 'textAlignLeft',
    onCell: (record, obj, index) => {
        if (record.symbol === $('概括')) {
            return {
                className: "fontBold"
            };
        }
        return {
            className: "symbol_position "
        }
    },
    render: (record, obj, index) => {
        let className = 'leftDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else if (obj.side === 'Sell') {
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
        title={tooltipShow($('委托的合约数量'), $('数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('数量')}</span>
    </Tooltip>,
    dataIndex: 'orderQty',
    align: 'right',
    // width: '5%',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.orderQty - b.orderQty
    //     }
    // },
    // onCell: record => {
    //     return {
    //         style: {
    //             width: '5%'
    //         }
    //     }
    // },
    // onHeaderCell: record => {
    //     const { showOrderQty } = page.state;
    //     if (showOrderQty) {
    //         return {
    //             style: {
    //                 width: '10%'
    //             }
    //         }
    //     }
    //     return {
    //         style: {
    //             width: '5%'
    //         }
    //     }
    // },
    render: (record, obj, index) => {
        const { showOrderQty, showOrderId } = page.state;
        if (!record) {
            return <span>---</span>
        }
        if (obj.side === "Buy") {
            return (showOrderQty && showOrderId === obj.orderID) ?
                <div
                    style={{ width: 150 }}
                    onBlur={page.onBlurQty}
                    onKeyPress={(e) => page.handleEnterKeyQty(e, obj)}
                >
                    <input
                        autoFocus
                        min={0}
                        className="show_input_price"
                        value={page.state.showOtyOrPrice}
                        onKeyPress={page.onlyNumber}
                        onChange={(e) => page.priceInputHide(e)}
                        step={1}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' size="small">
                        <i style={{ cursor: 'pointer' }} className={'check-icon-img close'}></i>
                    </Button>
                    <Button
                        disabled={page.state.showOtyOrPrice == 0}
                        style={{ height: '24px' }}
                        className='number_button levetage_ok'
                        onMouseOver={(e) => page.showInputFlagQty = false}
                        onMouseOut={(e) => page.showInputFlagQty = true}
                        onClick={(e) => { page.confirmOrderQty(obj) }} size="small">
                            <i style={{ cursor: 'pointer' }} className={'check-icon-img check'}></i>
                    </Button>
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled")
                    ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点此自动填入委托资料'))}><span className="colorGreen" style={{ cursor: 'help' }}>{record || ""}</span></Tooltip> :
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点击此处修改'))}>
                        <span style={{ cursor: "cell" }} className="colorGreen underLine_show" onClick={() => page.showInputOrderQty(obj)}>{record || ""}</span>
                    </Tooltip>
        } else {
            return (showOrderQty && showOrderId === obj.orderID) ?
                <div
                    onBlur={page.onBlurQty}
                    style={{ width: 150 }}
                    onKeyPress={(e) => page.handleEnterKeyQty(e, obj)}
                >
                    <input
                        autoFocus
                        max={0}
                        className="show_input_price"
                        value={0 - page.state.showOtyOrPrice * 1}
                        onKeyPress={page.onlyNumber}
                        onChange={(e) => page.priceInputHide(e)}
                        step={1}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' size="small">
                        <i style={{ cursor: 'pointer' }} className={'check-icon-img close'}></i>
                    </Button>
                    <Button
                        disabled={page.state.showOtyOrPrice == 0}
                        style={{ height: '24px' }}
                        className='number_button levetage_ok'
                        onMouseOver={(e) => page.showInputFlagQty = false}
                        onMouseOut={(e) => page.showInputFlagQty = true}
                        onClick={(e) => { page.confirmOrderQty(obj) }} type="primary" size="small">
                            <i style={{ cursor: 'pointer' }} className={'check-icon-img check'}></i>
                    </Button>
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled")
                    ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点此自动填入委托资料'))}><span className="colorRed" style={{ cursor: 'help' }}>{-record || ""}</span></Tooltip> :
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点击此处修改'))}>
                        <span style={{ cursor: "cell" }} className="colorRed underLine_show" onClick={() => page.showInputOrderQty(obj)}>{-record || ""}</span>
                    </Tooltip>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('限价'), $('委托价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('委托价格')}</span>
    </Tooltip>,
    dataIndex: 'price',
    align: 'right',
    // width: '8%',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.price - b.price
    //     }
    // },
    render: (record, obj, index) => {
        const { tickSize } = page.props;
        const { showInput, showOrderId } = page.state;
        if (!record && !obj.ordType) {
            return <span>---</span>
        }
        if (obj.ordType === "Stop" || obj.ordType === "MarketIfTouched" || obj.ordType === "Market") {
            return <span style={{ fontWeight: 'bold' }}>{$('市价')}</span>
        } else {
            return (showInput && showOrderId === obj.orderID) ?
                <div
                    style={{ width: 140 }}
                    onBlur={page.onBlur}
                    onKeyPress={(e) => page.handleEnterKey(e, obj)}
                >
                    <input
                        autoFocus
                        ref={(ref) => page.inputRef = ref}
                        className="show_input_price"
                        value={page.state.showInputPrice}
                        onKeyPress={page.onlyNumber}
                        onChange={(e) => {
                            page.onPriceInputChange(e, "showInputPrice")
                        }}
                        step={tickSize}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' size="small">
                        <i style={{ cursor: 'pointer' }} className={'check-icon-img close'}></i>
                    </Button>
                    <Button
                        disabled={page.state.showInputPrice == 0}
                        style={{ height: '24px' }}
                        className='number_button levetage_ok'
                        onMouseOver={(e) => page.showInputFlag = false}
                        onMouseOut={(e) => page.showInputFlag = true}
                        onClick={(e) => { page.confirmOrderCheck(obj, false) }} type="primary"size="small">
                        <i style={{ cursor: 'pointer' }} className={'check-icon-img check'}></i>
                </Button>
                </div> :
                (obj.symbol === $('买单') || obj.symbol === $('卖单') || (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled"))
                    ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点此自动填入委托资料'))}><span style={{ cursor: 'help' }}>{record.toFixed(getTickLength(tickSize))}</span></Tooltip> :
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点击此处修改'))}>
                        <span style={{ cursor: "cell" }} className="underLine_show" onClick={() => page.showInput(obj)}>{record.toFixed(getTickLength(tickSize))}</span>
                    </Tooltip>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托剩余可被成交的合约数量'), $('显示数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('显示数量')}</span>
    </Tooltip>,
    dataIndex: 'displayQty',
    align: 'right',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.displayQty - b.displayQty
    //     }
    // },
    render: (record, obj, index) => {
        if (!!record || record === 0) {
            return <span>{record}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托已成交数量，如果委托已被完全成交，此数值将等于委托数量。'), $('完全成交'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('完全成交')}</span>
    </Tooltip>,
    dataIndex: 'cumQty',
    align: 'right',
    // width: '8%',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.cumQty - b.cumQty
    //     }
    // },
    render: (record, obj, index) => {
        if (obj.symbol === $('概括')) {
            return <span>---</span>
        }
        if (!record && record !== 0) {
            return <span>---</span>
        } else {
            return <span>{record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('如果这是止损委托，这就是止损被触发的价格而委托就会进入市场。卖空止损将会在价格低于止损价格挂出市场，而买多止损将会在价格高于止损价格后触发。'), $('触发价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('触发价格')}</span>
    </Tooltip>,
    dataIndex: 'stopPx',
    align: 'right',
    className: 'textAlignRight',
    // onCell: record => {
    //     const { showOrderStop } = page.state;
    //     if (showOrderStop) {
    //         return {
    //             style: {
    //                 width: '12%'
    //             }
    //         }
    //     }
    //     return {
    //         style: {
    //             width: '8%'
    //         }
    //     }
    // },
    // onHeaderCell: record => {
    //     const { showOrderStop } = page.state;
    //     if (showOrderStop) {
    //         return {
    //             style: {
    //                 width: '12%'
    //             }
    //         }
    //     }
    //     return {
    //         style: {
    //             width: '8%'
    //         }
    //     }
    // },
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined;
    //     } else {
    //         return a.stopPx - b.stopPx;
    //     }
    // },
    render: (record, obj, index) => {
        const { tickSize } = page.props;
        const { showOrderStop, showOrderId } = page.state;
        let text = ">=";
        if (obj.side === "Buy") {
            if ((obj.ordType === "MarketIfTouched" || obj.ordType === "LimitIfTouched")) {
                text = "<=";
            }
        } else {
            if ((obj.ordType === "StopLimit" || obj.ordType === "Stop")) {
                text = "<=";
            }
        }
        if (!!record) {
            return (showOrderStop && showOrderId === obj.orderID) ?
                <div
                    onBlur={page.onBlurStop}
                    onKeyPress={(e) => page.handleEnterKeyStop(e, obj, text)}
                >
                    <input
                        autoFocus
                        ref={(ref) => page.inputRef = ref}
                        className="show_input_price"
                        value={page.state.showInputStopPrice}
                        onKeyPress={page.onlyNumber}
                        onChange={(e) => {
                            page.onPriceInputChange(e, "showInputStopPrice")
                        }}
                        step={tickSize}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' size="small">
                        <i style={{ cursor: 'pointer' }} className={'check-icon-img close'}></i>
                    </Button>
                    <Button
                        disabled={page.state.showInputStopPrice == 0}
                        style={{ height: '24px' }}
                        className='number_button levetage_ok'
                        onMouseOver={(e) => page.showInputFlagStop = false}
                        onMouseOut={(e) => page.showInputFlagStop = true}
                        onClick={(e) => { page.confirmOrderStop(obj, false, text) }} size="small">
                        <i style={{ cursor: 'pointer' }} className={'check-icon-img check'}></i>
                </Button>
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled") ? <span>{text + record.toFixed(getTickLength(tickSize))}</span> :
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点击此处修改'))}>
                        <span style={{ cursor: "cell" }} className="underLine_show" onClick={() => page.showInputOrderStop(obj)}>{text + record.toFixed(getTickLength(tickSize))}</span>
                    </Tooltip>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('这是标的合约的标记价格或最新成交价，将此对比于你的止损价格来厘定触发止损的价格距离。'), $('触发类型的价格和距离'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('触发类型的价格和距离')}</span>
    </Tooltip>,
    dataIndex: 'leavesQty',
    align: 'right',
    // width: '12%',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     const { instrumentData } = page.props;
    //     let price1 = 0;
    //     let price2 = 0;
    //     if (instrumentData) {
    //         price1 = instrumentData.lastPrice - a.stopPx;
    //         price2 = instrumentData.lastPrice - b.stopPx;
    //     }
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined;
    //     } else {
    //         return price1 - price2;
    //     }
    // },
    render: (record, obj, index) => {
        if (obj.ordType === "Market" || obj.ordType === "Limit" || obj.symbol === $('概括')) {
            return <span>---</span>
        }
        const { instrumentData, tickSize } = page.props;
        let price = 0;
        let calculatePrice = instrumentData.lastPrice;
        if (calculatePrice && obj.symbol !== $('概括')) {
            if (obj.execInst && obj.execInst.indexOf("LastPrice") !== -1) {
                calculatePrice = instrumentData.lastPrice;
            } else if (obj.execInst && obj.execInst.indexOf("IndexPrice") !== -1) {
                calculatePrice = toLowPrice(instrumentData.indicativeSettlePrice);
            } else {
                calculatePrice = toLowPrice(instrumentData.markPrice);
            }
            price = calculatePrice - obj.stopPx;
        }
        let className = "red";
        if (price > 0) {
            className = "green";
        }
        try {
            return <span>
                {calculatePrice.toFixed(getTickLength(tickSize)) + " "}
                <span className={className}>
                    {"(" + (price > 0 ? "+" : "") + price.toFixed(getTickLength(tickSize)) + ")"}
                </span>
            </span>
        } catch (error) {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'avgPx',
    align: 'right',
    // width: '8%',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined;
    //     } else {
    //         return a.avgPx - b.avgPx;
    //     }
    // },
    render: (record) => {
        const { tickSize } = page.props;
        if (!!record) {
            return <span>{record.toFixed(getTickLength(tickSize))}</span>
        } else {
            return <span>-.--</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的种类，在委托控制参阅可使用的委托种类。'), $('类型'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('类型')}</span>
    </Tooltip>,
    dataIndex: 'ordType',
    align: 'right',
    // width: '8%',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined;
    //     } else {
    //         return sortByString(a.ordType, b.ordType)
    //     }
    // },
    render: (record, obj) => {
        if (!!record) {
            let text = "";
            let textS = "";
            if (!!obj.execInst) {
                let arr = [];
                if (Array.isArray(obj.execInst)) {
                    arr = obj.execInst;
                } else {
                    arr = obj.execInst.split(',')
                }
                if (arr.length > 0) {
                    text = text + $("委托执行类型: ");
                }
                for (let index in arr) {
                    if (index == arr.length - 1) {
                        text = text + $(arr[index]) + '. ';
                    } else {
                        text = text + $(arr[index]) + ', ';
                    }
                }
            }
            if (!!obj.timeInForce) {
                let arr = obj.timeInForce.split(',');
                if (arr.length > 0 && arr[0] !== 'GoodTillCancel') {
                    textS = textS + $("生效时间: ");
                    for (let index in arr) {
                        if (index == arr.length - 1) {
                            textS = textS + $(arr[index]) + '. ';
                        } else {
                            textS = textS + $(arr[index]) + ', ';
                        }
                    }
                }
            }
            if ((text + textS) !== "") {
                return <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(text + textS)}>
                    <span className="underLine_show">{getOrdType(record)}</span>
                </Tooltip>

            } else {
                return <span>{getOrdType(record)}</span>;
            }
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的状态，此栏将会显示新委托、部分成交、已成交或取消。对于触发性委托将会有2个状态：当触发性委托未被触发时，它不会到市场上挂单，也不会使用起始保证金。当委托被触发后，他会进入你的挂单列表。'), $('状态'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('状态')}</span>
    </Tooltip>,
    dataIndex: 'ordStatus',
    align: 'right',
    // width: '8%',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined;
    //     } else {
    //         return sortByString(a.ordStatus, b.ordStatus)
    //     }
    // },
    render: (record, obj) => {
        if (!!record) {
            if (inMarketOrStop(obj.ordType) && !inShowClear(obj.ordStatus)) {
                if (obj.triggered === "" || !obj.triggered) {
                    return <span>{$('未触发')}</span>
                } else if (obj.triggered === 'StopOrderTriggered') {
                    return <span>{$('已触发')}</span>
                } else {
                    return <span>{getTradeStatus(record)}</span>
                }
            } else {
                return <span>{getTradeStatus(record)}</span>
            }
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托提交的时间'), $('时间'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('时间')}</span>
    </Tooltip>,
    dataIndex: 'transactTime',
    align: 'right',
    className: 'textAlignRight',
    defaultSortOrder: 'descend',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined;
    //     } else {
    //         return moment(a.transactTime) - moment(b.transactTime);
    //     }
    // },
    render: (record, obj, index) => {
        if (obj.symbol === $('概括')) {
            return <span>---</span>
        } else {
            let time = moment(record).format("a h:mm:ss");
            if (time.indexOf("晚上") !== -1) {
                time = time.replace("晚上", "下午");
            } else if (moment(record).format("a h:mm:ss").indexOf("凌晨") !== -1) {
                time = time.replace("凌晨", "上午");
            } else if (moment(record).format("a h:mm:ss").indexOf("中午") !== -1) {
                if (moment(record).format("HH:mm:ss") > moment(record).format("12:00:00")) {
                    time = time.replace("中午", "下午");
                } else {
                    time = time.replace("中午", "上午");
                }
            }
            return <Tooltip mouseLeaveDelay={0} placement="bottom"
                title={tooltipShow(moment(record).format("LLL"))}>
                <span>{time}</span>
            </Tooltip>
        }
    }
}
    , {
    title: $('委托ID'),
    dataIndex: 'orderID',
    align: 'right',
    className: 'textAlignRight displayNone',
    // width:"9%",
    // sorter: (a, b) => {
    //     return a.orderID - b.orderID;
    // },
    render: (record, obj, index) => {
        if (obj.text === "Liquidation") {
            return <span>{$('Liquidation')}</span>
        }
        if (!!record) {
            return <Tooltip mouseLeaveDelay={0} placement="top"
                title={tooltipShow(record)}>
                <span>{record.substring(0, 8)}</span>
            </Tooltip>
        }
    }
}
    , {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('操作'), $('操作'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('操作')}</span>
    </Tooltip>,
    dataIndex: 'close',
    align: 'center',
    onCell: record => {
        return {
            style: {
                width: '90px'
            }
        }
    },
    render: (record, obj, index) => {
        let { loading, orderID } = page.props;
        let _loading = loading && obj.orderID === orderID
        let className = 'rightDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
        }
        if (obj.symbol === $('概括')) {
            const { orderListData } = page.props;
            let __orderListData = orderListData.filter(item => ordTypeArr.indexOf(item.ordType) !== -1);
            if (__orderListData.length === 0) {
                return <span>
                    <span className='rightDirection'></span>
                </span>
            }
            let _orderListData = orderListData.filter(item => !inShowClear(item.ordStatus) && inMarketOrStop(item.ordType));
            if (_orderListData.length === 0) {
                return <span>
                    <span onClick={(e) => page.deleteAllOrder(obj)}><Tag className="buttom_size" style={{ marginRight: 0 }} color="#24B36B"><Icon type="check" /></Tag></span>
                    <span className='rightDirection'></span>
                </span>
            } else {
                return <span>
                    <Button icon="close" className='button-color-dust buttom_size' key={obj.orderID + "button"} type="danger" loading={_loading} onClick={(e) => page.cancelOrderAll(obj)}></Button>
                    <span className='rightDirection'></span>
                </span>
            }
        }
        if (obj.ordStatus === "New" || obj.ordStatus === "PartiallyFilled") {
            return <span>
                <Button className='button-color-dust buttom_size' key={obj.orderID + "button"} type="danger" loading={_loading} onClick={(e) => page.cancelOrder(obj)}>{$('取消')}</Button>
                <span className={className}></span>
            </span>
        } else {
            return <span>
                <Button className="buttom_size button-color-geekblue" onClick={(e) => page.deleteOrder(obj)} type="primary">{$('清除')}</Button>
                <span className={className}></span>
            </span>
        }
    }
}];
let columnsTitle = [{
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('有关合约的市场代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    align: 'left',
    className: 'textAlignLeft',
    onCell: (record, obj, index) => {
        if (record.symbol === $('概括')) {
            return {
                className: "fontBold"
            };
        }
        return {
            className: "symbol_position "
        }
    },
    render: (record, obj, index) => {
        let className = 'leftDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else if (obj.side === 'Sell') {
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
        title={tooltipShow($('委托的合约数量'), $('数量'))}>
        <span onClick={(e) => page.changeSort("orderQty")} className='underLine_show' style={{ zIndex: 999 }}>{$('数量')}</span>
    </Tooltip>,
    dataIndex: 'orderQty',
    key: 'orderQty',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        const { showOrderQty, showOrderId } = page.state;
        if (!record) {
            return <span>---</span>
        }
        if (obj.side === "Buy") {
            return (showOrderQty && showOrderId === obj.orderID) ?
                <div
                    style={{ width: 150 }}
                >
                    <input
                        autoFocus
                        min={0}
                        className="show_input_price"
                        step={1}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' icon='close' size="small" />
                    <Button
                        style={{ height: '24px' }}
                        className='number_button levetage_ok' icon='check' size="small" />
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled")
                    ? <span className="colorGreen" style={{ cursor: 'help' }}>{record || ""}</span> :
                    <span style={{ cursor: "cell" }} className="colorGreen underLine_show">{record || ""}</span>
        } else {
            return (showOrderQty && showOrderId === obj.orderID) ?
                <div
                    style={{ width: 150 }}
                >
                    <input
                        autoFocus
                        className="show_input_price"
                        step={1}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' icon='close' size="small" />
                    <Button
                        style={{ height: '24px' }}
                        className='number_button levetage_ok' type="primary" icon='check' size="small" />
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled")
                    ? <span className="colorRed" style={{ cursor: 'help' }}>{-record || ""}</span> :
                    <span style={{ cursor: "cell" }} className="colorRed underLine_show">{-record || ""}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('限价'), $('委托价格'))}>
        <span onClick={(e) => page.changeSort("price")} className='underLine_show' style={{ zIndex: 999 }}>{$('委托价格')}</span>
    </Tooltip>,
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        const { tickSize } = page.props;
        const { showInput, showOrderId } = page.state;
        if (!record && !obj.ordType) {
            return <span>---</span>
        }
        if (obj.ordType === "Stop" || obj.ordType === "MarketIfTouched" || obj.ordType === "Market") {
            return <span style={{ fontWeight: 'bold' }}>{$('市价')}</span>
        } else {
            return (showInput && showOrderId === obj.orderID) ?
                <div
                    style={{ width: 140 }}
                >
                    <input
                        autoFocus
                        className="show_input_price"
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' icon='close' size="small" />
                    <Button
                        style={{ height: '24px' }}
                        className='number_button levetage_ok' type="primary" icon='check' size="small" />
                </div> :
                (obj.symbol === $('买单') || obj.symbol === $('卖单') || (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled"))
                    ? <span style={{ cursor: 'help' }}>{record.toFixed(getTickLength(tickSize))}</span> :
                    <span style={{ cursor: "cell" }} className="underLine_show">{record.toFixed(getTickLength(tickSize))}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托剩余可被成交的合约数量'), $('显示数量'))}>
        <span onClick={(e) => page.changeSort("displayQty")} className='underLine_show' style={{ zIndex: 999 }}>{$('显示数量')}</span>
    </Tooltip>,
    dataIndex: 'displayQty',
    key: 'displayQty',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (!!record || record === 0) {
            return <span>{record}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托已成交数量，如果委托已被完全成交，此数值将等于委托数量。'), $('完全成交'))}>
        <span onClick={(e) => page.changeSort("cumQty")} className='underLine_show' style={{ zIndex: 999 }}>{$('完全成交')}</span>
    </Tooltip>,
    dataIndex: 'cumQty',
    key: 'cumQty',
    align: 'right',
    // width: '8%',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (obj.symbol === $('概括')) {
            return <span>---</span>
        }
        if (!record && record !== 0) {
            return <span>---</span>
        } else {
            return <span>{record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('如果这是止损委托，这就是止损被触发的价格而委托就会进入市场。卖空止损将会在价格低于止损价格挂出市场，而买多止损将会在价格高于止损价格后触发。'), $('触发价格'))}>
        <span onClick={(e) => page.changeSort("stopPx")} className='underLine_show' style={{ zIndex: 999 }}>{$('触发价格')}</span>
    </Tooltip>,
    dataIndex: 'stopPx',
    key: 'stopPx',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        const { tickSize } = page.props;
        const { showOrderStop, showOrderId } = page.state;
        let text = ">=";
        if (obj.side === "Buy") {
            if ((obj.ordType === "MarketIfTouched" || obj.ordType === "LimitIfTouched")) {
                text = "<=";
            }
        } else {
            if ((obj.ordType === "StopLimit" || obj.ordType === "Stop")) {
                text = "<=";
            }
        }
        if (!!record) {
            return (showOrderStop && showOrderId === obj.orderID) ?
                <div
                >
                    <input
                        className="show_input_price"
                        step={tickSize}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' icon='close' size="small" />
                    <Button
                        style={{ height: '24px' }}
                        className='number_button levetage_ok' icon='check' size="small" />
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled") ? <span>{text + record.toFixed(getTickLength(tickSize))}</span> :
                <span style={{ cursor: "cell" }} className="underLine_show">{text + record.toFixed(getTickLength(tickSize))}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('这是标的合约的标记价格或最新成交价，将此对比于你的止损价格来厘定触发止损的价格距离。'), $('触发类型的价格和距离'))}>
        <span onClick={(e) => page.changeSort("stopPriceLength")} className='underLine_show' style={{ zIndex: 999 }}>{$('触发类型的价格和距离')}</span>
    </Tooltip>,
    dataIndex: 'stopPriceLength',
    key: 'stopPriceLength',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        if (obj.ordType === "Market" || obj.ordType === "Limit" || obj.symbol === $('概括')) {
            return <span>---</span>
        }
        const { instrumentData, tickSize } = page.props;
        let price = 0;
        let calculatePrice = instrumentData.lastPrice;
        if (calculatePrice && obj.symbol !== $('概括')) {
            if (obj.execInst && obj.execInst.indexOf("LastPrice") !== -1) {
                calculatePrice = instrumentData.lastPrice;
            } else if (obj.execInst && obj.execInst.indexOf("IndexPrice") !== -1) {
                calculatePrice = toLowPrice(instrumentData.indicativeSettlePrice);
            } else {
                calculatePrice = toLowPrice(instrumentData.markPrice);
            }
            price = calculatePrice - obj.stopPx;
        }
        let className = "red";
        if (price > 0) {
            className = "green";
        }
        try {
            return <span>
                {calculatePrice.toFixed(getTickLength(tickSize)) + " "}
                <span className={className}>
                    {"(" + (price > 0 ? "+" : "") + price.toFixed(getTickLength(tickSize)) + ")"}
                </span>
            </span>
        } catch (error) {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span onClick={(e) => page.changeSort("avgPx")} className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'avgPx',
    key: 'avgPx',
    align: 'right',
    // width: '8%',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record) => {
        const { tickSize } = page.props;
        if (!!record) {
            return <span>{record.toFixed(getTickLength(tickSize))}</span>
        } else {
            return <span>-.--</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的种类，在委托控制参阅可使用的委托种类。'), $('类型'))}>
        <span onClick={(e) => page.changeSort("ordType")} className='underLine_show' style={{ zIndex: 999 }}>{$('类型')}</span>
    </Tooltip>,
    dataIndex: 'ordType',
    key: 'ordType',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj) => {
        if (!!record) {
            return <span>{getOrdType(record)}</span>;
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的状态，此栏将会显示新委托、部分成交、已成交或取消。对于触发性委托将会有2个状态：当触发性委托未被触发时，它不会到市场上挂单，也不会使用起始保证金。当委托被触发后，他会进入你的挂单列表。'), $('状态'))}>
        <span onClick={(e) => page.changeSort("ordStatus")} className='underLine_show' style={{ zIndex: 999 }}>{$('状态')}</span>
    </Tooltip>,
    dataIndex: 'ordStatus',
    key: 'ordStatus',
    align: 'right',
    sorter: (a, b) => {
        return undefined;
    },
    className: 'textAlignRight',
    render: (record, obj) => {
        if (!!record) {
            if (inMarketOrStop(obj.ordType) && !inShowClear(obj.ordStatus)) {
                if (obj.triggered === "" || !obj.triggered) {
                    return <span>{$('未触发')}</span>
                } else if (obj.triggered === 'StopOrderTriggered') {
                    return <span>{$('已触发')}</span>
                } else {
                    return <span>{getTradeStatus(record)}</span>
                }
            } else {
                return <span>{getTradeStatus(record)}</span>
            }
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托提交的时间'), $('时间'))}>
        <span onClick={(e) => page.changeSort("transactTime")} className='underLine_show' style={{ zIndex: 999 }}>{$('时间')}</span>
    </Tooltip>,
    dataIndex: 'transactTime',
    key: 'transactTime',
    align: 'right',
    className: 'textAlignRight',
    defaultSortOrder: 'descend',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        if (obj.symbol === $('概括')) {
            return <span>---</span>
        } else {
            let time = moment(record).format("a h:mm:ss");
            return <span>{time}</span>
        }
    }
}, {
    title: <span className='underLine_show_orderID' onClick={(e) => page.changeSort("orderID")}>{$('委托ID')}</span>,
    dataIndex: 'orderID',
    key: 'orderID',
    align: 'right',
    className: 'textAlignRight displayNone',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        if (obj.text === "Liquidation") {
            return <span>{$('Liquidation')}</span>
        }
        if (!!record) {
            return <span>{record.substring(0, 8)}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('操作'), $('操作'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('操作')}</span>
    </Tooltip>,
    dataIndex: 'close',
    align: 'center',
    onCell: record => {
        return {
            style: {
                width: '90px'
            }
        }
    },
    render: (record, obj, index) => {
        let { loading, orderID } = page.props;
        let _loading = loading && obj.orderID === orderID
        let className = 'rightDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
        }
        if (obj.symbol === $('概括')) {
            const { orderListData } = page.props;
            let __orderListData = orderListData.filter(item => ordTypeArr.indexOf(item.ordType) !== -1);
            if (__orderListData.length === 0) {
                return <span>
                    <span className='rightDirection'></span>
                </span>
            }
            let _orderListData = orderListData.filter(item => !inShowClear(item.ordStatus) && inMarketOrStop(item.ordType));
            if (_orderListData.length === 0) {
                return <span>
                    <span onClick={(e) => page.deleteAllOrder(obj)}><Tag className="buttom_size" style={{ marginRight: 0 }} color="#24B36B"><Icon type="check" /></Tag></span>
                    <span className='rightDirection'></span>
                </span>
            } else {
                return <span>
                    <Button icon="close" className='button_cancel buttom_size' key={obj.orderID + "button"} type="danger" loading={_loading} onClick={(e) => page.cancelOrderAll(obj)}></Button>
                    <span className='rightDirection'></span>
                </span>
            }
        }
        if (obj.ordStatus === "New" || obj.ordStatus === "PartiallyFilled") {
            return <span>
                <Button className='button-color-dust buttom_size' key={obj.orderID + "button"} type="danger" loading={_loading} onClick={(e) => page.cancelOrder(obj)}>{$('取消')}</Button>
                <span className={className}></span>
            </span>
        } else {
            return <span>
                <Button className="buttom_size" onClick={(e) => page.deleteOrder(obj)} type="primary">{$('清除')}</Button>
                <span className={className}></span>
            </span>
        }
    }
}];

const ordTypeArr = ["Stop", "LimitIfTouched", "StopLimit", "MarketIfTouched"];
class Index extends Component {
    constructor(props) {
        super(props);
        page = this;
        this.state = {
            showInput: false,
            showOrderQty: false,
            showOrderStop: false,
            showOrderId: "",
            showOtyOrPrice: 0,
            showInputPrice: 0,
            showInputStopPrice: 0,
            changeKey: 'transactTime',
            sortUpOrLow: 'descend',
        }
        this.showInputFlag = true;
        this.showInputFlagQty = true;
        this.showInputFlagStop = true;
        this.showDanger = true;
    }
    componentDidMount = () => {
        let arr = document.getElementsByClassName('ant-table-column-sorters');
        for (let value of arr) {
            value.title = ""
        }
        let scollDom = document.getElementsByClassName('orderList_table_show')[0];
        scollDom.onscroll = function() {
            let scollDomHide = document.getElementsByClassName('orderList_table_hide')[0];
            scollDomHide.scrollLeft = scollDom.scrollLeft;
        }
    }
    onPriceInputChange = (e, key) => {
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const reg = /^(0|[1-9][0-9]*)(.[0-9]+)?$/;
        let value = e.target.value;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let showInputPrice = this.state[key];
            showInputPrice = value;
            if (index !== -1) {
                if (index <= String(value).length - 2) {
                    let num = parseInt(value / _tickSize);
                    num = (num * _tickSize).toFixed(1);
                    showInputPrice = num;
                }
            } else if (this.pressKey === 38 || this.pressKey === 40) {
                showInputPrice = (showInputPrice * 1).toFixed(getTickLength(_tickSize));
            }
            this.setState({
                [key]: showInputPrice
            })
            this.inpurPrice = showInputPrice
        }
    }
    priceInputHide = (e) => {
        let value = e.target.value * 1;
        if (value < 0) {
            value = 0 - value;
        }
        const reg = /^[0-9]*[1-9][0-9]*$/;
        let showOtyOrPrice = this.state.showOtyOrPrice;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            if (showOtyOrPrice < 0) {
                showOtyOrPrice = 0;
            }
            this.setState({
                showOtyOrPrice: value
            })
            this.inpurPrice = value
        } else if (value == "0") {
            showOtyOrPrice = 0;
            this.setState({
                showOtyOrPrice
            })
            this.inpurPrice = showOtyOrPrice
        }
    }
    onlyNumber = (e) => {
        if (e.charCode === 45) {
            e.preventDefault();
            return false;
        }
    }
    deleteAllOrder = (side) => {
        const { dispatch } = this.props;
        const { orderListData } = this.props;
        let arr = [];
        let _orderListData = orderListData.filter(item => inMarketOrStop(item.ordType));
        for (let value of _orderListData) {
            arr.push(value.orderID)
        }
        this.props.deleteAllOrder(arr);
        // dispatch({
        //     type: "orderList/deleteAllOrder",
        //     payload: {
        //         orderIdArr: arr,
        //     }
        // })
    }
    confirmOrderCheck = (obj, flag) => {
        if (this.showDanger) {
            if ((!flag || obj.triggered === 'StopOrderTriggered')) {
                const { lastPrice } = this.props;
                if (obj.side == "Sell" && lastPrice > this.inpurPrice) {
                    this.showConfirm(1, obj);
                    return
                } else if (obj.side == "Buy" && lastPrice <= this.inpurPrice) {
                    this.showConfirm(1, obj);
                    return
                }
            }
        }
        this.confirmOrder(obj, true);
    }
    renderShowDanger = (type) => {
        return <div className="quickModal_content">
            <div className="quickModal_content2">
                <div>{translationParameters([this.inpurPrice], type === 1 ? $('价格委托修改可执行提示信息') : $('止损价格委托修改可执行提示信息'))}</div>
                <div>{$('请确认修改。')}</div>
            </div>
            <div style={{ textAlign: "right" }}>
                <Checkbox style={{ color: "black", fontSize: 12 }}
                    onChange={(e) => {
                        this.showDanger = !e.target.checked
                    }}>{$('不要再显示')}
                </Checkbox>
            </div>
        </div>
    }
    showConfirm = (type, obj) => {
        this.showInputFlag = false;
        this.showInputFlagQty = false;
        this.showInputFlagStop = false;
        if (type === 1) {
            confirm({
                title: <strong style={{ textAlign: "center" }}>{$('警告')}: {$('委托修改可执行')}</strong>,
                content: this.renderShowDanger(type),
                okType: 'danger',
                okText: $('成交委托'),
                cancelText: $('取消'),
                className: "quickModal",
                onOk: () => {
                    page.confirmOrder(obj);
                },
                onCancel: () => {
                    this.showDanger = true;
                    this.showInputFlag = true;
                    this.showInputFlagQty = true;
                    this.showInputFlagStop = true;
                },
            });
        } else {
            confirm({
                title: <strong style={{ textAlign: "center" }}>{$('警告')}: {$('委托修改可执行')}</strong>,
                content: this.renderShowDanger(type),
                okType: 'danger',
                okText: $('执行修改'),
                cancelText: $('取消'),
                className: "quickModal",
                onOk: () => {
                    page.confirmOrderStop(obj, true, page.inpurPrice);
                },
                onCancel: () => {
                    this.showDanger = true;
                    this.showInputFlag = true;
                    this.showInputFlagQty = true;
                    this.showInputFlagStop = true;
                },
            });
        }
    }
    handleEnterKey = (e, obj) => {
        if (e.charCode === 13) {
            this.confirmOrder(obj, false)
        }
    }
    handleEnterKeyQty = (e, obj) => {
        if (e.charCode === 13) {
            this.confirmOrderQty(obj)
        }
    }
    handleEnterKeyStop = (e, obj, text) => {
        if (e.charCode === 13) {
            this.confirmOrderStop(obj, false, text)
        }
    }
    confirmOrder = (obj) => {
        const { dispatch } = page.props;
        if (page.inpurPrice && obj.price != page.inpurPrice) {
            dispatch({
                type: "orderCommit/orderUpdate",
                payload: {
                    orderID: obj.orderID,
                    oldPrice: obj.price,
                    price: page.inpurPrice
                }
            })
        }
        page.inpurPrice = null;
        page.showInputFlag = true;
        page.showInputFlagQty = true;
        page.showInputFlagStop = true;
        page.setState({
            showInput: false,
        })
    }
    confirmOrderQty = (obj) => {
        const { dispatch } = this.props;
        if (page.inpurPrice && obj.orderQty != page.inpurPrice) {
            dispatch({
                type: "orderCommit/orderUpdate",
                payload: {
                    orderID: obj.orderID,
                    oldOrderQty: obj.orderQty,
                    orderQty: Math.abs(page.inpurPrice)
                }
            })
        }
        page.inpurPrice = null;
        page.showInputFlag = true;
        page.showInputFlagQty = true;
        page.showInputFlagStop = true;
        page.setState({
            showOrderQty: false,
        })
    }
    confirmOrderStop = (obj, flag, bigOrSmall) => {
        const { dispatch } = page.props;
        if (page.showDanger && page.inpurPrice && obj.stopPx != page.inpurPrice) {
            if (!flag) {
                const { instrumentData } = page.props;
                let lastPrice = instrumentData.lastPrice;
                if(obj.execInst === ""){
                    lastPrice = instrumentData.markPrice;
                }else if(obj.execInst === "IndexPrice"){
                    lastPrice = instrumentData.indicativeSettlePrice;
                }
                if (bigOrSmall === ">=" && lastPrice >= page.inpurPrice) {
                    page.showConfirm(2, obj);
                    return
                } else if (bigOrSmall === "<=" && lastPrice <= page.inpurPrice) {
                    page.showConfirm(2, obj);
                    return
                }
            }
        }
        if (page.inpurPrice && obj.stopPx != page.inpurPrice) {
            dispatch({
                type: "orderCommit/orderUpdate",
                payload: {
                    orderID: obj.orderID,
                    oldStopPx: obj.stopPx,
                    stopPx: Math.abs(page.inpurPrice)
                }
            })
        }
        page.inpurPrice = null;
        page.showInputFlagQty = true;
        page.showInputFlag = true;
        page.showInputFlagStop = true;
        page.setState({
            showOrderStop: false,
        })
    }
    showInput = (obj) => {
        if (obj.orderID) {
            this.setState({
                showInput: true,
                showOrderId: obj.orderID,
                showInputPrice: obj.price
            })
        }
    }
    showInputOrderQty = (obj) => {
        if (obj.orderID) {
            this.setState({
                showOrderQty: true,
                showOrderId: obj.orderID,
                showOtyOrPrice: obj.orderQty
            })
        }
    }
    showInputOrderStop = (obj) => {
        if (obj.orderID && obj.triggered !== 'StopOrderTriggered') {
            this.setState({
                showOrderStop: true,
                showOrderId: obj.orderID,
                showInputStopPrice: obj.stopPx
            })
        }
    }
    onBlur = () => {
        if (this.showInputFlag) {
            this.inpurPrice = null;
            this.setState({
                showInput: false,
            })
        }
    }
    onBlurQty = () => {
        if (this.showInputFlagQty) {
            this.inpurPrice = null;
            this.setState({
                showOrderQty: false,
            })
        }
    }
    onBlurStop = () => {
        if (this.showInputFlagStop) {
            this.inpurPrice = null;
            this.setState({
                showOrderStop: false,
            })
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
    cancelOrderAll = (obj) => {
        const { dispatch, orderListData } = this.props;
        let _orderListData = orderListData.filter(item => ordTypeArr.indexOf(item.ordType) !== -1);
        if (_orderListData.length > 0) {
            dispatch({
                type: "orderList/cancelOrderAll",
                payload: {
                    filter: {
                        ordType: ordTypeArr
                    },
                }
            })
        }
    }
    deleteOrder = (obj) => {
        this.props.deleteOrder(obj.orderID);
    }
    changeSort = (key) => {
        this.setState({
            changeKey: key,
        })
    }
    handleChange = (pagination, filters, sorter) => {
        let { sortUpOrLow } = this.state;
        if (sorter.order === "descend") {//降序
            sortUpOrLow = "descend";
        } else if (sorter.order === "ascend") {//升序
            sortUpOrLow = "ascend";
        } else {
            sortUpOrLow = '';
        }
        this.setState({
            sortUpOrLow
        })
    }
    render() {
        const { orderListData, orderListFullOrSm } = this.props;
        let _columns = cloneDeep(columns);
        let _columnsTitle = cloneDeep(columnsTitle);
        if (orderListFullOrSm) {
            _columns[_columns.length - 2].className = 'textAlignRight';
            _columnsTitle[_columnsTitle.length - 2].className = 'textAlignRight';
        } else {
            _columns[_columns.length - 2].className = 'textAlignRight displayNone';
            _columnsTitle[_columnsTitle.length - 2].className = 'textAlignRight displayNone';
        }
        let _orderListData = orderListData.filter(item => ordTypeArr.indexOf(item.ordType) !== -1);
        if (_orderListData.length > 0) {
            _orderListData.sort((a, b) => {
                let { sortUpOrLow, changeKey } = this.state;
                let { instrumentData } = this.props;
                return sortHideFunction(a, b, sortUpOrLow, changeKey, instrumentData);
            })
        }
        let index = _orderListData.findIndex((item) => item.displayQty === 0 || item.displayQty);
        try {
            if (index === -1) {
                _columns.splice(3, 1);
                _columnsTitle.splice(3, 1);
            }
        } catch (error) {

        }
        let obj = {
            symbol: $('概括'),
        }
        _orderListData.unshift(obj);
        return (
            <div className="orderList">
                <Table
                    className="orderList_table_hide"
                    pagination={false}
                    scroll={{ x: 800 }}
                    onChange={this.handleChange}
                    rowKey="orderIDStopHide"
                    columns={_columnsTitle} dataSource={_orderListData} size="small"
                />
                <Table
                    className="orderList_table_show"
                    pagination={false}
                    scroll={{ x: 800 }}
                    rowKey="orderIDStop"
                    columns={_columns} dataSource={_orderListData} size="small"
                />
            </div>
        )
    }
}

export default connect(({ orderList, instrument, loading, login }) => {
    const { orderListData, orderID } = orderList;
    const { instrumentData, tickSize, lastPrice } = instrument;
    const { orderListFullOrSm } = login;
    return {
        orderListData,
        instrumentData,
        orderID,
        orderListFullOrSm,
        lastPrice,
        tickSize,
        loading: !!loading.effects["orderList/cancelOrder"]
    }
})(
    Index
)

