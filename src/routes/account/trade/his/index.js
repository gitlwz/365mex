import React, { Component } from 'react'
import { connect } from 'dva';
import "../order/index.less";
import { language, Form, DatePicker, Ellipsis, Card, Utils, Input, Table, Button, Tooltip } from 'quant-ui';
import { getOrdType, getDirectionStatus, getTradeType } from '@/utils/dictionary';
import moment from 'moment';
import Page from '../page/index.js';
import { tooltipShow, getCurrencyType, checkJsonString, sortByString, isJsonString } from '@/utils/utils';
const currency = Utils.currency;
let $ = language.getLanguageData;
let calculate = Math.pow(10,getCurrencyType().tick);
let page = null;
const columns = [{
    title: $('时间'),
    dataIndex: 'timestamp',
    key: 'timestamp',
    className: "textLeft",
    sorter: (a, b) => a.timestamp - b.timestamp,
    render: (record, obj, index) => {
        if (moment(record).format("LLL").indexOf("晚上") !== -1) {
            return <span>{moment(record).format("LLL").replace("晚上", "下午")}</span>
        } else if (moment(record).format("LLL").indexOf("凌晨") !== -1) {
            return <span>{moment(record).format("LLL").replace("凌晨", "上午")}</span>
        } else if (moment(record).format("LLL").indexOf("中午") !== -1) {
            if (moment(record).format("HH:mm:ss") > moment(record).format("12:00:00")) {
                return <span>{moment(record).format("LLL").replace("中午", "下午")}</span>
            } else {
                return <span>{moment(record).format("LLL").replace("中午", "上午")}</span>
            }
        } else {
            return <span>{moment(record).format("LLL")}</span>
        }
    }
}, {
    title: $('合约'),
    dataIndex: 'symbol',
    key: 'symbol',
    className: "textLeft",
    sorter: (a, b) => { return sortByString(a.symbol, b.symbol) },
    render: (record, obj, index) => {
        return <span onClick={() => page.filterClick(record, 'symbol')} className="greenColor filter_click">{record}</span>
    }
}, {
    title: $('成交类别'),
    dataIndex: 'execType',
    key: 'execType',
    className: "textRight",
    sorter: (a, b) => getTradeType(a.execType) - getTradeType(b.execType),
    render: (record, obj, index) => {
        return <span onClick={() => page.filterClick(record, 'execType')} className="filter_click">{getTradeType(record)}</span>
    }
}, {
    title: $('方向'),
    dataIndex: 'side',
    key: 'side',
    className: "textRight",
    sorter: (a, b) => { return sortByString(a.side, b.side) },
    render: (record) => {
        let className = "greenColor filter_click";
        if (record === "Sell") {
            className = "redColor filter_click";
        }
        if (record === "Sell" || record === "Buy") {
            return <span onClick={() => page.filterClick(record, 'side')} className={className}>{getDirectionStatus(record)}</span>
        } else {
            return <span></span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易中买入/卖出的合约数量。这等于或小于委托的数量。'), $('成交数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交数量')}</span>
    </Tooltip>,
    dataIndex: 'lastQty',
    key: 'lastQty',
    className: "textRight",
    sorter: (a, b) => a.lastQty - b.lastQty,
    render: (record, obj, index) => {
        let className = "greenColor filter_click";
        if (obj.side === "Sell") {
            className = "redColor filter_click";
        }
        return <span onClick={() => page.filterClick(record, 'lastQty')} className={className}>{record}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易中买入/卖出的合约数量。这等于或小于委托的数量。'), $('成交价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'lastPx',
    key: 'lastPx',
    className: "textRight",
    sorter: (a, b) => a.lastPx - b.lastPx,
    render: (record, obj, index) => {
        if (record) {
            let text = record.toString().split(".");
            if (text.length === 2) {
                if (text[1].length === 2) {
                    if ((text[1] / 100) >= 0.5) {
                        record = parseInt(text[0]) + 0.5;
                    } else {
                        record = parseInt(text[0]);
                    }
                } else {
                    if ((text[1]) >= 5) {
                        record = parseInt(text[0]) + 0.5;
                    } else {
                        record = parseInt(text[0]);
                    }
                }
            }
            return <span onClick={() => page.filterClick(record, 'lastPx')} className="filter_click">{record.toFixed(1)}</span>
        } else {
            return <span>--</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易中成交的合约的价值'), $('价值'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('价值')}</span>
    </Tooltip>,
    dataIndex: 'execCost',
    key: 'execCost',
    className: "textRight",
    sorter: (a, b) => a.execCost - b.execCost,
    render: (record, obj, index) => {
        return <div>
            <span style={{ marginRight: 5, float: "right" }}>
                {currency(parseInt((record * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
            </span>
        </div>
    }
}, {
    title: $('佣金费率'),
    dataIndex: 'commission',
    key: 'commission',
    className: "textRight",
    sorter: (a, b) => a.commission - b.commission,
    render: (record, obj, index) => {
        let className = "greenColor";
        if (record > 0) {
            className = "";
        }
        return <span className={className}>{(record * 100).toFixed(4) + "%"}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此交易所付的佣金'), $('已付费用'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('已付费用')}</span>
    </Tooltip>,
    dataIndex: 'execComm',
    key: 'execComm',
    className: "textRight",
    sorter: (a, b) => a.execComm - b.execComm,
    render: (record, obj, index) => {
        let className = "greenColor";
        if (record > 0) {
            className = "";
        }
        return <div>
            <span className={className} style={{ marginRight: 5, float: "right" }}>
                {currency(parseInt((record * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
            </span>
        </div>
    }
}, {
    title: $('委托种类'),
    dataIndex: 'ordType',
    key: 'ordType',
    className: "textRight",
    sorter: (a, b) => { return sortByString(a.ordType, b.ordType) },
    render: (record, obj, index) => {
        return <span onClick={() => page.filterClick(record, 'ordType')} className="filter_click">{getOrdType(record)}</span>
    }
}, {
    title: $('委托数量'),
    dataIndex: 'orderQty',
    key: 'orderQty',
    className: "textRight",
    sorter: (a, b) => a.orderQty - b.orderQty,
    render: (record, obj, index) => {
        let className = "greenColor filter_click";
        if (obj.side === "Sell") {
            className = "redColor filter_click";
        }
        return <span onClick={() => page.filterClick(record, 'orderQty')} className={className}>{record}</span>
    }
}, {
    title: $('未成交数量'),
    dataIndex: 'leavesQty',
    key: 'leavesQty',
    className: "textRight",
    sorter: (a, b) => a.leavesQty - b.leavesQty,
    render: (record, obj, index) => {
        return <span onClick={() => page.filterClick(record, 'leavesQty')} className="filter_click">{record}</span>
    }
}, {
    title: $('委托价格'),
    dataIndex: 'price',
    key: 'price',
    className: "textRight",
    sorter: (a, b) => a.price - b.price,
    render: (record, obj, index) => {
        return <span onClick={() => page.filterClick(record, 'price')} className="filter_click">{record}</span>
    }
}, {
    title: $('说明'),
    dataIndex: 'text',
    key: 'text',
    className: "textRight",
    sorter: (a, b) => a.text - b.text,
    render: (record, obj, index) => {
        return <Ellipsis tooltip length={15}>{record}</Ellipsis>
    }
}, {
    title: $('委托ID'),
    dataIndex: 'orderID',
    key: 'orderID',
    className: "textRight",
    sorter: (a, b) => a.orderID - b.orderID,
    render: (record, obj, index) => {
        let text = record;
        if (record === "00000000-0000-0000-0000-000000000000") {
            return <span>{$('强平委托')}</span>
        }
        return <Ellipsis tooltip length={7}>{text}</Ellipsis>
    }
}];
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            filter: ""
        }
        page = this;
        this.currentPage = 0;
    }
    filterClick = (value, key) => {
        let filter = this.state.filter;
        let flag = isJsonString(filter);
        if(flag && typeof filter == 'string') { 
            filter = JSON.parse(filter)
        } else if(typeof filter != 'object') {
            filter = JSON.parse("{}")
        }
        if (flag && filter[key] && filter[key] === value) {
            delete filter[key]
        } else {
            filter[key] = value;
        }
        
        this.setState({
            filter
        }, () => {
            this.onClick();
        })
    }
    componentDidMount = () => {
        let arr = document.getElementsByClassName('ant-table-column-sorters');
        for (let value of arr) {
            value.title = ""
        }
    }
    componentWillMount = () => {
        const { dispatch } = this.props;
        let obj = {
            start: 0,
            reverse: true,
            count: 100,
            filter: "",
            columns: ["timestamp", "symbol", "execType", "side",
                "lastQty", "lastPx", "execCost", "commission", "execComm", "ordType", "orderQty",
                "leavesQty", "price", "text", "orderID", "stopPx"]
        }
        dispatch({
            type: "tradeHistory/getTradeHistory",
            payload: {
                ...obj
            }
        })

    }
    onClear = () => {
        this.setState({
            filter: ''
        }, () => {
            this.onClick('clear');
        })
    }
    onClick = (key, start = 0) => {
        const { dispatch } = this.props;
        const { filter } = this.state;
        let value = checkJsonString(filter) ? JSON.stringify(filter) : filter
        let obj = {
            start: start,
            reverse: true,
            count: 100,
            filter: key === 'clear' ? '' : value,
            columns: ["timestamp", "symbol", "execType", "side",
                "lastQty", "lastPx", "execCost", "commission", "execComm", "ordType", "orderQty",
                "leavesQty", "price", "text", "orderID", "stopPx"]
        }
        this.currentPage = start / 100;
        dispatch({
            type: "tradeHistory/getTradeHistory",
            payload: {
                ...obj
            }
        })
    }
    callback = (key) => {
        console.log(key);
    }
    onChange = (e) => {
        this.setState({
            filter: e.target.value
        })
    }
    render() {
        let { dataSource, loading, currencyType } = this.props;
        let { filter } = this.state;
        if (!dataSource) {
            dataSource = [];
        }
        let start = 100 * this.currentPage;
        let end = dataSource.length + 100 * this.currentPage;
        let value = checkJsonString(filter) ? JSON.stringify(filter) : filter
        calculate = Math.pow(10,getCurrencyType().tick);
        return (
            <Card className="hover-shadow hisOrderAccount">
                <div className='marginBotm10'>
                    {$('该列表包含你所有提交的委托。')}
                </div>
                <div className='marginBotm10'>
                    {$('点选项目数值来筛选，你可以在下方输入栏手动输入筛选要求。')}
                </div>
                <div className='marginBotm10' style={{ marginBottom: 10 }}>
                    <Input onChange={this.onChange} value={value} style={{ width: 400, marginRight: 10 }} placeholder={$('点选下列数值筛选')} />
                    <Button style={{ marginRight: 10 }} onClick={this.onClear} type="primary">{$('清除')}</Button>
                    <Button onClick={this.onClick} type="primary">{$('搜寻')}</Button>
                </div>
                <Page loading={loading} onPrePage={this.onClick} onNextPage={this.onClick} start={start} end={end} />
                <Table loading={loading} scroll={{ x: 1180 }} className="tableHis" pagination={false} dataSource={dataSource} size="small" columns={columns} />
            </Card>
        )
    }
}

export default connect(({ tradeHistory, margin, loading }) => {
    const { dataSource } = tradeHistory;
    const { currencyType } = margin;
    return {
        dataSource,
        currencyType,
        loading: !!loading.effects["tradeHistory/getTradeHistory"],
    }
})(
    Form.create()(Index)
)
