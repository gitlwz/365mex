import React, { Component } from 'react'
import { Table, Button, Utils, language, Tooltip, Modal, Tag, Icon } from 'quant-ui';
import "./index.less";
import moment from "moment";
import { connect } from 'dva';
import { getCurrencyType, getTickLength, translationParameters, tooltipShow, sortByString, sortHideFunction } from '@/utils/utils'
import { getOrdType, getTradeStatus, inShowClear, inMarketOrStop } from '@/utils/dictionary';
import cloneDeep from "lodash/cloneDeep";
const currency = Utils.currency;
const confirm = Modal.confirm;
let { getLanguageData } = language;
let $ = getLanguageData;
let page = null;
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
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.orderQty - b.orderQty
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
                    onBlur={page.onBlurQty}
                    onKeyPress={(e) => page.handleEnterKeyQty(e, obj)}
                >
                    <input
                        autoFocus
                        min={0}
                        className="show_input_price"
                        value={page.state.showOtyOrPrice}
                        onChange={(e) => page.priceInputHide(e)}
                        step={1}
                        onKeyPress={page.onlyNumber}
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
                    onKeyPress={(e) => page.handleEnterKeyQty(e, obj)}
                >
                    <input
                        autoFocus
                        max={0}
                        className="show_input_price"
                        onKeyPress={page.onlyNumber}
                        value={0 - page.state.showOtyOrPrice * 1}
                        onChange={(e) => {
                            page.priceInputHide(e)
                        }
                        }
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
    // width: '10%',
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
                            page.onPriceInputChange(e)
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
                        onClick={(e) => { page.confirmOrderCheck(obj, false) }} type="primary" size="small">
                            <i style={{ cursor: 'pointer' }} className={'check-icon-img check'}></i>
                    </Button>
                </div> :
                (obj.symbol === $('买单') || obj.symbol === $('卖单') || (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled"))
                    ? <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点此自动填入委托资料'))}><span style={{ cursor: 'help' }}>{record ? record.toFixed(getTickLength(tickSize)) : '--'}</span></Tooltip> :
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('点击此处修改'))}>
                        <span style={{ cursor: "cell" }} className="underLine_show" onClick={() => page.showInput(obj)}>{record ? record.toFixed(getTickLength(tickSize)) : '--'}</span>
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
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.cumQty - b.cumQty
    //     }
    // },
    render: (record) => {
        if (!record) {
            return <span>---</span>;
        }
        // eslint-disable-next-line eqeqeq
        if (record == "0") {
            return <span>---</span>
        } else {
            return <span>{record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托剩余可被成交的合约数量'), $('剩余'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('剩余')}</span>
    </Tooltip>,
    dataIndex: 'leavesQty',
    align: 'right',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.leavesQty - b.leavesQty
    //     }
    // },
    render: (record, obj, index) => {
        if (!!record) {
            return <span>{record}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托在限价的名义值'), $('委托价值'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('委托价值')}</span>
    </Tooltip>,
    dataIndex: 'homeNotional',
    align: 'right',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         let pricea = a.price || a.stopPx;
    //         let priceb = b.price || b.stopPx;
    //         return (1 / pricea) * a.orderQty - (1 / priceb) * b.orderQty
    //     }
    // },
    render: (record, obj, index) => {
        if (record) {
            return <span style={{ float: "right" }}>{record}</span>
        }
        let price = obj.price || obj.avgPx;
        if (obj.ordType === "Stop" || obj.ordType === "MarketIfTouched" || obj.ordType === "Market") {
            if (obj.side === "Buy") {
                price = window.localStorage.getItem("askPrice")
            } else {
                price = window.localStorage.getItem("bidPrice")
            }
        }
        price = Math.round((1 * 1 / price) * 100000000);
        let calculate = Math.pow(10, getCurrencyType().tick);
        let homeNotional = (obj.orderQty * price * getCurrencyType().value / 100000000);
        return <div>
            <span style={{ float: "right" }}>
                {currency(parseInt(homeNotional * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
            </span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'avgPx',
    align: 'right',
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return a.avgPx - b.avgPx
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
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
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
    className: 'textAlignRight',
    // sorter: (a, b) => {
    //     if (a.symbol === $('概括') || b.symbol === $('概括')) {
    //         return undefined
    //     } else {
    //         return sortByString(a.ordStatus, b.ordStatus)
    //     }
    // },
    render: (record, obj, index) => {
        if (!!record) {
            if (obj.ordStatus === "New" && obj.triggered === 'StopOrderTriggered') {
                return <span>{$('已触发')}</span>
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
    defaultSortOrder: 'descend',
    className: 'textAlignRight',
    render: (record, obj, index) => {
        if (!record) {
            return <span>---</span>;
        }
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
}, {
    title: $('委托ID'),
    dataIndex: 'orderID',
    align: 'right',
    className: 'textAlignRight displayNone',
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
},
{
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
        let _loading = (loading && obj.orderID === orderID);
        if (obj.symbol === $('概括')) {
            const { orderListData } = page.props;
            let __orderListData = orderListData.filter(item => !inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered');
            if (__orderListData.length === 0) {
                return <span>
                    <span className='rightDirection'></span>
                </span>
            }
            let _orderListData = orderListData.filter(item => !inShowClear(item.ordStatus));
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
        let className = 'rightDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
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
    key: 'orderQtyHide_active',
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
                        disabled={page.state.showOtyOrPrice == 0}
                        style={{ height: '24px' }}
                        className='number_button levetage_ok' icon='check' size="small" />
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled")
                    ? <span className="colorGreen" style={{ cursor: 'help' }}>{record || ""}</span> :
                    <span style={{ cursor: "cell" }} className="colorGreen underLine_show">{record || ""}</span>
        } else {
            return (showOrderQty && showOrderId === obj.orderID) ?
                <div
                >
                    <input
                        max={0}
                        className="show_input_price"
                        value={0 - page.state.showOtyOrPrice * 1}
                        step={1}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' icon='close' size="small" />
                    <Button
                        disabled={page.state.showOtyOrPrice == 0}
                        style={{ height: '24px' }}
                        className='number_button levetage_ok' icon='check' size="small" />
                </div> :
                (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled")
                    ? <span className="colorRed" style={{ cursor: 'help' }}>{-record || ""}</span> :
                    <span style={{ cursor: "cell" }} className="colorRed underLine_show" >{-record || ""}</span>
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
                        value={page.state.showInputPrice}
                        step={tickSize}
                        type='number'>
                    </input>
                    <Button style={{ height: '24px' }} className='number_button levetage_cancel' icon='close' size="small" />
                    <Button
                        style={{ height: '24px' }}
                        className='number_button levetage_ok' type="primary" icon='check' size="small" />
                </div> :
                (obj.symbol === $('买单') || obj.symbol === $('卖单') || (obj.ordStatus !== "New" && obj.ordStatus !== "PartiallyFilled"))
                    ? <span style={{ cursor: 'help' }}>{record ? record.toFixed(getTickLength(tickSize)) : '--'}</span> :
                    <span style={{ cursor: "cell" }} className="underLine_show">{record ? record.toFixed(getTickLength(tickSize)) : '--'}</span>
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
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record) => {
        if (!record) {
            return <span>---</span>;
        }
        // eslint-disable-next-line eqeqeq
        if (record == "0") {
            return <span>---</span>
        } else {
            return <span>{record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托剩余可被成交的合约数量'), $('剩余'))}>
        <span onClick={(e) => page.changeSort("leavesQty")} className='underLine_show' style={{ zIndex: 999 }}>{$('剩余')}</span>
    </Tooltip>,
    dataIndex: 'leavesQty',
    key: 'leavesQty',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (!!record) {
            return <span>{record}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托在限价的名义值'), $('委托价值'))}>
        <span onClick={(e) => page.changeSort("homeNotional")} className='underLine_show' style={{ zIndex: 999 }}>{$('委托价值')}</span>
    </Tooltip>,
    dataIndex: 'homeNotional',
    key: 'homeNotional',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (record) {
            return <span style={{ float: "right" }}>{record}</span>
        }
        let price = obj.price || obj.avgPx;
        if (obj.ordType === "Stop" || obj.ordType === "MarketIfTouched" || obj.ordType === "Market") {
            if (obj.side === "Buy") {
                price = window.localStorage.getItem("askPrice")
            } else {
                price = window.localStorage.getItem("bidPrice")
            }
        }
        price = Math.round((1 * 1 / price) * 100000000);
        let calculate = Math.pow(10, getCurrencyType().tick);
        let homeNotional = (obj.orderQty * price * getCurrencyType().value / 100000000);
        return <div>
            <span style={{ float: "right" }}>
                {currency(parseInt(homeNotional * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
            </span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span onClick={(e) => page.changeSort("avgPx")} className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'avgPx',
    key: 'avgPx',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
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
        return undefined
    },
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
                return <span className="underLine_show">{getOrdType(record)}</span>

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
        <span onClick={(e) => page.changeSort("ordStatus")} className='underLine_show' style={{ zIndex: 999 }}>{$('状态')}</span>
    </Tooltip>,
    dataIndex: 'ordStatus',
    key: 'ordStatus',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (!!record) {
            if (obj.ordStatus === "New" && obj.triggered === 'StopOrderTriggered') {
                return <span>{$('已触发')}</span>
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
    key: 'transactTimeHide_active',
    defaultSortOrder: 'descend',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (!record) {
            return <span>---</span>;
        }
        let time = moment(record).format("a h:mm:ss");
        return <span>{time}</span>
    }
}, {
    title: <span className='underLine_show_orderID' onClick={(e) => page.changeSort("orderID")}>{$('委托ID')}</span>,
    dataIndex: 'orderID',
    key: 'orderID',
    align: 'right',
    className: 'textAlignRight displayNone',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (obj.text === "Liquidation") {
            return <span>{$('Liquidation')}</span>
        }
        if (!!record) {
            return <span>{record.substring(0, 8)}</span>
        }
    }
},
{
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
        let className = 'rightDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
        }
        return <span>
            <Button className="buttom_size" type="primary">{$('清除')}</Button>
            <span className={className}></span>
        </span>
    }
}];
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showInput: false,
            showOrderQty: false,
            showOrderId: "",
            showInputPrice: 0,
            showOtyOrPrice: 0,
            changeKey: 'transactTime',
            sortUpOrLow: 'descend',
        }
        this.showInputFlag = true;
        this.showInputFlagQty = true;
        page = this;
    }
    onlyNumber = (e) => {
        if (e.charCode === 45) {
            e.preventDefault();
            return false;
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
    onPriceInputChange = (e) => {
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const reg = /^(0|[1-9][0-9]*)(.[0-9]+)?$/;
        let value = e.target.value;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let showInputPrice = this.state.showInputPrice;
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
                showInputPrice
            })
            this.inpurPrice = showInputPrice
        }
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
    renderShowDanger = (type) => {
        return <div className="quickModal_content">
            <div className="quickModal_content2">
                <div>{translationParameters([this.inpurPrice], type === 1 ? $('价格委托修改可执行提示信息') : $('止损价格委托修改可执行提示信息'))}</div>
                <div>{$('请确认修改。')}</div>
            </div>
        </div>
    }
    showConfirm = (type, obj) => {
        this.showInputFlag = false;
        this.showInputFlagQty = false;
        if (type === 1) {
            confirm({
                title: <strong style={{ textAlign: "center" }}>{$('警告')}: {$('委托修改可执行')}</strong>,
                content: this.renderShowDanger(type),
                okType: 'danger',
                okText: $('成交委托'),
                cancelText: $('取消'),
                className: "quickModal",
                onOk() {
                    page.confirmOrder(obj);
                },
                onCancel: () => {
                    this.showInputFlag = true;
                    this.showInputFlagQty = true;
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
                onOk() {
                    page.confirmOrderStop(obj, true, page.inpurPrice);
                },
                onCancel: () => {
                    this.showInputFlag = true;
                    this.showInputFlagQty = true;
                },
            });
        }
    }
    confirmOrderCheck = (obj, flag) => {
        if (!flag || obj.triggered === 'StopOrderTriggered') {
            const { lastPrice } = this.props;
            if (obj.side === "Sell" && lastPrice > this.inpurPrice) {
                this.showConfirm(1, obj);
                return
            } else if (obj.side === "Buy" && lastPrice <= this.inpurPrice) {
                this.showConfirm(1, obj);
                return
            }
        }
        this.confirmOrder(obj, true);
    }
    handleEnterKey = (e, obj) => {
        if (e.charCode === 13) {
            this.confirmOrderCheck(obj, false)
        }
    }
    handleEnterKeyQty = (e, obj) => {
        if (e.charCode === 13) {
            this.confirmOrderQty(obj)
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
        page.setState({
            showInput: false,
        })
    }
    confirmOrderQty = (obj) => {
        const { dispatch } = page.props;
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
        page.setState({
            showOrderQty: false,
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
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/cancelOrderAll",
            payload: {
                filter: {},
            }
        })
    }
    deleteOrder = (obj) => {
        this.props.deleteOrder(obj.orderID);
        // const { dispatch } = this.props;
        // dispatch({
        //     type: "orderList/deleteOrder",
        //     payload: {
        //         orderID: obj.orderID,
        //     }
        // })
    }
    deleteAllOrder = (obj) => {
        const { dispatch } = this.props;
        const { orderListData } = this.props;
        let arr = [];
        let _orderListData = orderListData.filter(item => inShowClear(item.ordStatus));
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
        // eslint-disable-next-line no-unused-vars
        const { orderListData, currencyType, orderHeight, orderListFullOrSm } = this.props;
        let _columns = cloneDeep(columns);
        let _columnsTitle = cloneDeep(columnsTitle);
        let _orderListData = orderListData.filter(item => !inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered');
        let obj = {
            symbol: $('概括'),
            side: 'Total'
        }
        if (orderListFullOrSm) {
            _columns[_columns.length - 2].className = 'textAlignRight';
            _columnsTitle[_columnsTitle.length - 2].className = 'textAlignRight';
        } else {
            _columns[_columns.length - 2].className = 'textAlignRight displayNone';
            _columnsTitle[_columnsTitle.length - 2].className = 'textAlignRight displayNone';
        }
        let calculate = Math.pow(10, getCurrencyType().tick);
        let buyTotal = 0;
        let index = _orderListData.findIndex((item) => item.displayQty === 0 || item.displayQty);
        try {
            if (index === -1) {
                _columns.splice(3, 1);
                _columnsTitle.splice(3, 1);
            }
        } catch (error) {
        }
        if (_orderListData.length > 0) {
            _orderListData.forEach((item) => {
                if (item.price && (item.ordStatus === "New" || item.ordStatus === "PartiallyFilled")) {
                    let price = Math.round((1 * 1 / item.price) * 100000000);
                    let homeNotional = (item.orderQty * price * getCurrencyType().value / 100000000)
                    buyTotal += homeNotional;
                }
            })
            _orderListData.sort((a, b) => {
                let { sortUpOrLow, changeKey } = this.state;
                let { instrumentData } = this.props;
                return sortHideFunction(a, b, sortUpOrLow, changeKey, instrumentData);
            })
        }
        obj.homeNotional = currency(parseInt(buyTotal * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key;
        _orderListData.unshift(obj);
        // let inti = 160;
        // let height = window.localStorage.getItem("user_order_height") * 1;
        // if (height > 6) {
        //     inti = 160 + (height * 1 - 6) * 42;
        // }
        return (
            <div className="orderList">
                <Table
                    pagination={false}
                    className="orderList_table_hide"
                    scroll={{ x: 658 }}
                    rowKey="orderIDHideActive"
                    onChange={this.handleChange}
                    columns={_columnsTitle} dataSource={_orderListData} size="small"
                />
                <Table
                    pagination={false}
                    scroll={{ x: 658 }}
                    className="orderList_table_show"
                    rowKey="orderIDActive"
                    columns={_columns} dataSource={_orderListData} size="small"
                />
            </div>
        )
    }
}

export default connect(({ orderList, margin, instrument, login }) => {
    const { orderListData, orderHeight } = orderList;
    const { currencyType } = margin;
    const { tickSize, lastPrice } = instrument;
    const { orderListFullOrSm } = login;
    return {
        orderListData,
        orderListFullOrSm,
        currencyType,
        tickSize,
        orderHeight,
        lastPrice
    }
})(
    Index
)

