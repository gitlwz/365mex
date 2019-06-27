import React, { Component } from 'react'
import { Table, language, Tooltip } from 'quant-ui';
import "./index.less";
import moment from "moment";
import { connect } from 'dva';
import { getOrdType, getTradeStatus, inMarketOrStop, inShowClear } from '@/utils/dictionary';
import { getTickLength, tooltipShow, sortHideFunction } from '@/utils/utils';
let { getLanguageData } = language;
let page = null;
let $ = getLanguageData;
let columns = [{
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('有关合约的市场代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    align: 'left',
    // width: "6%",
    className: 'textAlignLeft',
    sorter: (a, b) => {
        if (a.symbol > b.symbol) {
            return 1;
        } else {
            if (a.symbol === b.symbol) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    onCell: (record, index) => {
        return {
            className: "symbol_position "
        }
    },
    render: (record, obj, index) => {
        let className = 'leftDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
        }
        return <div style={{ height: '26px', lineHeight: '26px' }}>
            <span className={className}></span>
            <span>{record}</span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('委托的合约数量'), $('数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('数量')}</span>
    </Tooltip>,
    dataIndex: 'orderQty',
    align: 'right',
    // width: "6%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.orderQty > b.orderQty) {
            return 1;
        } else {
            if (a.orderQty === b.orderQty) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    render: (record, obj, index) => {
        if (obj.side === "Buy") {
            return <span className="colorGreen">{record}</span>
        } else {
            return <span className="colorRed">{-record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('限价'), $('委托价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('委托价格')}</span>
    </Tooltip>,
    dataIndex: 'price',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.price > b.price) {
            return 1;
        } else {
            if (a.price === b.price) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    render: (record, obj, index) => {
        if (obj.ordType === "Stop" || obj.ordType === "MarketIfTouched" || obj.ordType === "Market") {
            return <span>{$('市价')}</span>
        } else {
            const { tickSize } = page.props;
            return <span>{record ? record.toFixed(getTickLength(tickSize)) : "---"}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('隐藏或部分隐藏的委托在委托列表显示的数量，如果值为空，那么所有的数量将被公开显示。'), $('显示数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('显示数量')}</span>
    </Tooltip>,
    dataIndex: 'displayQty',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.displayQty > b.displayQty) {
            return 1;
        } else {
            if (a.displayQty === b.displayQty) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    render: (record) => {
        if (!!record || record === 0) {
            return <span>{record}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('委托已成交数量，如果委托已被完全成交，此数值将等于委托数量。'), $('完全成交'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('完全成交')}</span>
    </Tooltip>,
    dataIndex: 'cumQty',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.cumQty > b.cumQty) {
            return 1;
        } else {
            if (a.cumQty === b.cumQty) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    render: (record, obj, index) => {
        // eslint-disable-next-line eqeqeq
        if (record == "0") {
            return <span>---</span>
        }
        if (obj.side === "Buy") {
            return <span className="colorGreen">{record}</span>
        } else {
            return <span className="colorRed">{-record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('如果这是止损委托，这就是止损被触发的价格而委托就会进入市场。卖空止损将会在价格低于止损价格挂出市场，而买多止损将会在价格高于止损价格后触发。'), $('触发价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('触发价格')}</span>
    </Tooltip>,
    dataIndex: 'stopPx',
    align: 'right',
    // width: "10%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.stopPx > b.stopPx) {
            return 1;
        } else {
            if (a.stopPx === b.stopPx) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    render: (record, obj, index) => {
        const { tickSize } = page.props;
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
            if (obj.side === "Buy") {
                return <span>{text + record.toFixed(getTickLength(tickSize))}</span>
            } else {
                return <span>{text + record.toFixed(getTickLength(tickSize))}</span>
            }
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'avgPx',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.avgPx > b.avgPx) {
            return 1;
        } else {
            if (a.avgPx === b.avgPx) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    render: (record) => {
        if (!!record) {
            const { tickSize } = page.props;
            return <span>{record ? record.toFixed(getTickLength(tickSize)) : "---"}</span>
        } else {
            return <span>-.--</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('委托的种类，在委托控制参阅可使用的委托种类。'), $('类型'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('类型')}</span>
    </Tooltip>,
    dataIndex: 'ordType',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.ordType > b.ordType) {
            return 1;
        } else {
            if (a.ordType === b.ordType) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
    render: (record, obj, index) => {
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
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('委托的状态，此栏将会显示新委托、部分成交、已成交或取消。对于触发性委托将会有2个状态：当触发性委托未被触发时，它不会到市场上挂单，也不会使用起始保证金。当委托被触发后，他会进入你的挂单列表。'), $('状态'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('状态')}</span>
    </Tooltip>,
    dataIndex: 'ordStatus',
    align: 'right',
    // width: "8%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        if (a.ordStatus > b.ordStatus) {
            return 1;
        } else {
            if (a.ordStatus === b.ordStatus) {
                return moment(a.timestamp) - moment(b.timestamp);
            } else {
                return -1;
            }
        }
    },
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
    title: $('委托ID'),
    dataIndex: 'orderID',
    align: 'right',
    className: 'textAlignRight displayNone',
    // width:"9%",
    sorter: (a, b) => {
        return a.orderID - b.orderID;
    },
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
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('委托提交的时间'), $('时间'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('时间')}</span>
    </Tooltip>,
    dataIndex: 'transactTime',
    align: 'right',
    // width: "17%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return moment(a.transactTime) - moment(b.transactTime);
    },
    render: (record, obj, index) => {
        let className = 'rightDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
        }
        let time = moment(record).format("LLL");
        if (moment(record).format("LLL").indexOf("晚上") !== -1) {
            time = moment(record).format("LLL").replace("晚上", "下午")
        } else if (moment(record).format("LLL").indexOf("凌晨") !== -1) {
            time = moment(record).format("LLL").replace("凌晨", "上午")
        } else if (moment(record).format("LLL").indexOf("中午") !== -1) {
            if (moment(record).format("HH:mm:ss") > moment(record).format("12:00:00")) {
                time = moment(record).format("LLL").replace("中午", "下午")
            } else {
                time = moment(record).format("LLL").replace("中午", "上午")
            }
        } else {
            time = moment(record).format("LLL");
        }
        return <span>
            {time}
            <span className={className}></span>
        </span>
    }
}];
let columnsTitle = [{
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('有关合约的市场代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    align: 'left',
    className: 'textAlignLeft',
    onCell: (record, index) => {
        return {
            className: "symbol_position "
        }
    },
    render: (record, obj, index) => {
        let className = 'leftDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
        }
        return <div style={{ height: '26px', lineHeight: '26px' }}>
            <span className={className}></span>
            <span>{record}</span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
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
        if (obj.side === "Buy") {
            return <span className="colorGreen">{record}</span>
        } else {
            return <span className="colorRed">{-record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('限价'), $('委托价格'))}>
        <span onClick={(e) => page.changeSort("price")} className='underLine_show' style={{ zIndex: 999 }}>{$('委托价格')}</span>
    </Tooltip>,
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        if (obj.ordType === "Stop" || obj.ordType === "MarketIfTouched" || obj.ordType === "Market") {
            return <span>{$('市价')}</span>
        } else {
            const { tickSize } = page.props;
            return <span>{record ? record.toFixed(getTickLength(tickSize)) : "---"}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('隐藏或部分隐藏的委托在委托列表显示的数量，如果值为空，那么所有的数量将被公开显示。'), $('显示数量'))}>
        <span onClick={(e) => page.changeSort("displayQty")} className='underLine_show' style={{ zIndex: 999 }}>{$('显示数量')}</span>
    </Tooltip>,
    dataIndex: 'displayQty',
    key: 'displayQty',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record) => {
        if (!!record || record === 0) {
            return <span>{record}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('委托已成交数量，如果委托已被完全成交，此数值将等于委托数量。'), $('完全成交'))}>
        <span onClick={(e) => page.changeSort("cumQty")} className='underLine_show' style={{ zIndex: 999 }}>{$('完全成交')}</span>
    </Tooltip>,
    key: 'cumQty',
    dataIndex: 'cumQty',
    align: 'right',
    // width: "9%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        // eslint-disable-next-line eqeqeq
        if (record == "0") {
            return <span>---</span>
        }
        if (obj.side === "Buy") {
            return <span className="colorGreen">{record}</span>
        } else {
            return <span className="colorRed">{-record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('如果这是止损委托，这就是止损被触发的价格而委托就会进入市场。卖空止损将会在价格低于止损价格挂出市场，而买多止损将会在价格高于止损价格后触发。'), $('触发价格'))}>
        <span onClick={(e) => page.changeSort("stopPx")} className='underLine_show' style={{ zIndex: 999 }}>{$('触发价格')}</span>
    </Tooltip>,
    dataIndex: 'stopPx',
    key: 'stopPx',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        const { tickSize } = page.props;
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
            if (obj.side === "Buy") {
                return <span>{text + record.toFixed(getTickLength(tickSize))}</span>
            } else {
                return <span>{text + record.toFixed(getTickLength(tickSize))}</span>
            }
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
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
        if (!!record) {
            const { tickSize } = page.props;
            return <span>{record ? record.toFixed(getTickLength(tickSize)) : "---"}</span>
        } else {
            return <span>-.--</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
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
    render: (record, obj, index) => {
        if (!!record) {
            return <span>{getOrdType(record)}</span>;
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
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
    render: (record) => {
        if (!!record) {
            return <span>{getTradeStatus(record)}</span>
        } else {
            return <span>---</span>
        }
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
            return <Tooltip mouseLeaveDelay={0} placement="top"
                title={tooltipShow(record)}>
                <span>{record.substring(0, 8)}</span>
            </Tooltip>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="right"
        title={tooltipShow($('委托提交的时间'), $('时间'))}>
        <span onClick={(e) => page.changeSort("transactTime")} className='underLine_show' style={{ zIndex: 999 }}>{$('时间')}</span>
    </Tooltip>,
    dataIndex: 'transactTime',
    key: 'transactTime',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined
    },
    render: (record, obj, index) => {
        let className = 'rightDirection';
        if (obj.side === 'Buy') {
            className += ' borderColorGreen'
        } else {
            className += ' borderColorRed'
        }
        let time = moment(record).format("LLL");
        return <span>
            {time}
            <span className={className}></span>
        </span>
    }
}];

class Index extends Component {
    constructor(props) {
        super(props);
        page = this;
        this.state = {
            changeKey: 'transactTime',
            sortUpOrLow: 'descend',
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
        const { orderListHisData, orderHeight, orderListFullOrSm } = this.props;
        let _orderListHisData = orderListHisData;
        // let inti = 160;
        // let height = window.localStorage.getItem("user_order_height") * 1;
        // if (height > 6) {
        //     inti = 160 + (height * 1 - 6) * 42;
        // }
        if(orderListFullOrSm){
            columns[columns.length - 2].className = 'textAlignRight';
        }else{
            columns[columns.length - 2].className = 'textAlignRight displayNone';
        }
        if (!_orderListHisData) {
            _orderListHisData = [];
        } else {
            _orderListHisData.sort((a, b) => {
                let { sortUpOrLow, changeKey } = this.state;
                let { instrumentData } = this.props;
                // if(changeKey === 'orderQty'){
                //     if (a.orderQty > b.orderQty) {
                //         return 1;
                //     } else {
                //         if (a.orderQty === b.orderQty) {
                //             return moment(a.timestamp) - moment(b.timestamp);
                //         } else {
                //             return -1;
                //         }
                //     }
                // }else{
                    return sortHideFunction(a, b, sortUpOrLow, changeKey, instrumentData);
                // }
            })
        }
        return (
            <div className="orderList">
                <Table
                    className="orderList_table_hide"
                    rowKey="orderID"
                    pagination={false}
                    onChange={this.handleChange}
                    scroll={{ x: 788 }}
                    columns={columnsTitle} dataSource={_orderListHisData} size="small"
                />
                <Table
                    className="orderList_table_show"
                    rowKey="orderID"
                    pagination={false}
                    scroll={{ x: 788 }}
                    columns={columns} dataSource={_orderListHisData} size="small"
                />
            </div>
        )
    }
}

export default connect(({ orderList, instrument, login }) => {
    const { orderListHisData, orderHeight } = orderList;
    const { tickSize } = instrument;
    const { orderListFullOrSm } = login;
    return {
        orderListHisData,
        orderHeight,
        tickSize,
        orderListFullOrSm
    }
})(
    Index
)

