import React, { Component } from 'react'
import { Table, Utils, language, Tooltip, Ellipsis } from 'quant-ui';
import "./index.less";
import moment from "moment";
import { connect } from 'dva';
import { getCurrencyType, getTickLength, tooltipShow, sortByString, sortHideFunction } from '@/utils/utils'
import { Button } from 'antd/lib/radio';
import { getOrdType, getTradeStatus } from '@/utils/dictionary';
let page = null;
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
const columns = [{
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('有关合约的市场代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    align: 'left',
    // width:"7%",
    className: 'textAlignLeft',
    sorter: (a, b) => {
        return a.symbol - b.symbol;
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
    // width:"5%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return a.orderQty - b.orderQty;
    },
    render: (record, obj, index) => {
        return <span>{record}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易中买入/卖出的合约数量。这等于或小于委托的数量。'), $('成交数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交数量')}</span>
    </Tooltip>,
    dataIndex: 'foreignNotional',
    align: 'right',
    // width:"8%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return a.foreignNotional - b.foreignNotional;
    },
    render: (record, obj, index) => {
        if (obj.side === "Buy") {
            return <span className="colorGreen">{record}</span>
        } else {
            return <span className="colorRed">{-record}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托剩余可被成交的合约数量'), $('剩余'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('剩余')}</span>
    </Tooltip>,
    dataIndex: 'leavesQty',
    align: 'right',
    // width:"7%",
    className: 'textAlignRight',
    sorter: (a, b) => a.leavesQty - b.leavesQty,
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'lastPx',
    align: 'right',
    // width:"9%",
    className: 'textAlignRight',
    sorter: (a, b) => a.lastPx - b.lastPx,
    render: (record) => {
        if (!!record) {
            const { tickSize } = page.props;
            return <span>{record.toFixed(getTickLength(tickSize))}</span>
        } else {
            return <span>---</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('限价'), $('委托价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('委托价格')}</span>
    </Tooltip>,
    dataIndex: 'price',
    align: 'right',
    // width:"9%",
    className: 'textAlignRight',
    sorter: (a, b) => a.price - b.price,
    render: (record, obj, index) => {
        let recodeNew = record;
        if (obj.ordType === "Market" || obj.ordType === "MarketIfTouched" || obj.ordType === "Stop") {
            recodeNew = $('市价');
            return <span>{recodeNew}</span>
        } else {
            const { tickSize } = page.props;
            return <span>{recodeNew.toFixed(getTickLength(tickSize))}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易中成交的合约的价值'), $('价值'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('价值')}</span>
    </Tooltip>,
    dataIndex: 'execCost',
    align: 'right',
    // width:"12%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return a.execCost - b.execCost;
    },
    render: (record, obj, index) => {
        let calculate = Math.pow(10, getCurrencyType().tick);
        let execCost = ((record) * getCurrencyType().value / 100000000);
        return <div>
            <span style={{ float: "right" }}>
                {currency(parseInt(execCost * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
            </span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的种类，在委托控制参阅可使用的委托种类。'), $('类型'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('类型')}</span>
    </Tooltip>,
    dataIndex: 'ordType',
    align: 'right',
    className: 'textAlignRight',
    // width:"12%",
    sorter: (a, b) => {
        return sortByString(a.ordStatus, b.ordStatus)
    },
    render: (record, obj, index) => {
        return <span>{getOrdType(record)}</span>
    }
}, {
    title: $('委托ID'),
    dataIndex: 'orderID',
    align: 'right',
    className: 'textAlignRight',
    // width:"9%",
    sorter: (a, b) => {
        return a.orderID - b.orderID;
    },
    render: (record, obj, index) => {
        if (obj.text === "Liquidation") {
            return <span>{$('Liquidation')}</span>
        }
        return <Tooltip mouseLeaveDelay={0} placement="top"
            title={tooltipShow(record)}>
            <span>{record.substring(0, 8)}</span>
        </Tooltip>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托提交的时间'), $('时间'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('时间')}</span>
    </Tooltip>,
    dataIndex: 'timestamp',
    align: 'right',
    className: 'textAlignRight',
    defaultSortOrder: 'descend',
    sorter: (a, b) => {
        return moment(a.timestamp) - moment(b.timestamp);
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
const columnsTitle = [{
    title: <Tooltip mouseLeaveDelay={0} placement="top"
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
        return undefined;
    },
    render: (record, obj, index) => {
        return <span>{record}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易中买入/卖出的合约数量。这等于或小于委托的数量。'), $('成交数量'))}>
        <span onClick={(e) => page.changeSort("foreignNotional")} className='underLine_show' style={{ zIndex: 999 }}>{$('成交数量')}</span>
    </Tooltip>,
    dataIndex: 'foreignNotional',
    key: 'foreignNotional',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        if (obj.side === "Buy") {
            return <span className="colorGreen">{record}</span>
        } else {
            return <span className="colorRed">{-record}</span>
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
    // width:"7%",
    className: 'textAlignRight',
    sorter: (a, b) => undefined,
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span onClick={(e) => page.changeSort("lastPx")} className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'lastPx',
    key: 'lastPx',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => undefined,
    render: (record) => {
        if (!!record) {
            const { tickSize } = page.props;
            return <span>{record.toFixed(getTickLength(tickSize))}</span>
        } else {
            return <span>---</span>
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
    // width:"9%",
    className: 'textAlignRight',
    sorter: (a, b) => undefined,
    render: (record, obj, index) => {
        let recodeNew = record;
        if (obj.ordType === "Market" || obj.ordType === "MarketIfTouched" || obj.ordType === "Stop") {
            recodeNew = $('市价');
            return <span>{recodeNew}</span>
        } else {
            const { tickSize } = page.props;
            return <span>{recodeNew.toFixed(getTickLength(tickSize))}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易中成交的合约的价值'), $('价值'))}>
        <span onClick={(e) => page.changeSort("execCost")} className='underLine_show' style={{ zIndex: 999 }}>{$('价值')}</span>
    </Tooltip>,
    dataIndex: 'execCost',
    key: 'execCost',
    align: 'right',
    // width:"12%",
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        let calculate = Math.pow(10, getCurrencyType().tick);
        let execCost = ((record) * getCurrencyType().value / 100000000);
        return <div>
            <span style={{ float: "right" }}>
                {currency(parseInt(execCost * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
            </span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的种类，在委托控制参阅可使用的委托种类。'), $('类型'))}>
        <span onClick={(e) => page.changeSort("ordType")} className='underLine_show' style={{ zIndex: 999 }}>{$('类型')}</span>
    </Tooltip>,
    key: 'ordType',
    dataIndex: 'ordType',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        return <span>{getOrdType(record)}</span>
    }
}, {
    title: <span className='underLine_show_orderID' onClick={(e) => page.changeSort("orderID")}>{$('委托ID')}</span>,
    dataIndex: 'orderID',
    key: 'orderID',
    align: 'right',
    className: 'textAlignRight',
    sorter: (a, b) => {
        return undefined;
    },
    render: (record, obj, index) => {
        if (obj.text === "Liquidation") {
            return <span>{$('Liquidation')}</span>
        }
        return <Tooltip mouseLeaveDelay={0} placement="top"
            title={tooltipShow(record)}>
            <span>{record.substring(0, 8)}</span>
        </Tooltip>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托提交的时间'), $('时间'))}>
        <span onClick={(e) => page.changeSort("timestamp")} className='underLine_show' style={{ zIndex: 999 }}>{$('时间')}</span>
    </Tooltip>,
    dataIndex: 'timestamp',
    key: 'timestamp',
    align: 'right',
    className: 'textAlignRight',
    defaultSortOrder: 'descend',
    sorter: (a, b) => {
        return undefined;
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

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeKey: 'transactTime',
            sortUpOrLow: 'descend',
        }
        page = this;
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
        // this.searchTrade()
    }
    searchTrade = () => {
        // const { dispatch } = this.props;
        // dispatch({
        //     type: "orderList/tradeListGet",
        //     payload: {
        //         count: 200,
        //         reverse: true
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
        const { tradeListData, currencyType, orderHeight } = this.props;
        let _tradeListData = [];
        if (!!tradeListData && tradeListData.length > 0) {
            _tradeListData = tradeListData.filter((item) => {
                return item.text !== "Funding" && (item.ordStatus === "Filled" || item.ordStatus === "PartiallyFilled" || item.ordStatus === "Canceled");
            })
            _tradeListData.sort((a, b) => {
                let { sortUpOrLow, changeKey } = this.state;
                let { instrumentData } = this.props;
                return sortHideFunction(a, b, sortUpOrLow, changeKey, instrumentData);
            })
        }
        return (
            <div className="orderList">
                <Table
                    className="orderList_table_hide"
                    pagination={false}
                    scroll={{ x: 788 }}
                    columns={columnsTitle}
                    onChange={this.handleChange}
                    dataSource={_tradeListData}
                    size="small"
                />
                <Table
                    className="orderList_table_show"
                    pagination={false}
                    scroll={{ x: 788 }}
                    columns={columns}
                    dataSource={_tradeListData}
                    size="small"
                />
            </div>
        )
    }
}

export default connect(({ orderList, margin, loading, instrument }) => {
    const { tradeListData, orderHeight } = orderList;
    const { currencyType } = margin;
    const { tickSize } = instrument;
    return {
        tradeListData,
        currencyType,
        orderHeight,
        tickSize,
        loading: !!loading.effects["orderList/tradeListGet"]
    }
})(
    Index
)

