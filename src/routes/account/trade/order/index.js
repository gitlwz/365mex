import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { language, Form, DatePicker, Ellipsis, Card, Utils, Col, Table, Button, Input, Tooltip } from 'quant-ui';
import moment from 'moment';
import Page from '../page/index.js';
import { tooltipShow, getCurrencyType , checkJsonString, sortByString, isJsonString} from '@/utils/utils';
import { getOrdType, getTradeStatus, inMarketOrStop, getDirectionStatus, inShowClear } from '@/utils/dictionary';
const currency = Utils.currency;
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
let $ = language.getLanguageData;
let page = null;
let calculate = Math.pow(10,getCurrencyType().tick);
const columns = [{
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托提交或最后一次修改的时间，用于撮合系统中按照时间优先的排序。'), $('时间'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('时间')}</span>
    </Tooltip>,
    dataIndex: 'transactTime',
    key: 'transactTime',
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
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('有关合约的市场代码'), $('合约'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('合约')}</span>
    </Tooltip>,
    dataIndex: 'symbol',
    key: 'symbol',
    className: "textLeft",
    sorter: (a, b) => { return sortByString(a.symbol, b.symbol) },
    render: (record, obj, index) => {
        return <span onClick={() => page.filterClick(record, 'symbol')} className="greenColor filter_click">{record}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('买或卖'), $('方向'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('方向')}</span>
    </Tooltip>,
    dataIndex: 'side',
    key: 'side',
    className: "textRight",
    sorter: (a, b) => { return sortByString(a.side, b.side) },
    render: (record, obj, index) => {
        let className = "greenColor filter_click";
        if (record === "Sell") {
            className = "redColor filter_click";
        }
        return <span onClick={() => page.filterClick(record, 'side')} className={className}>{getDirectionStatus(record)}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的合约数量'), $('数量'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('数量')}</span>
    </Tooltip>,
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
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('限价'), $('委托价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('委托价格')}</span>
    </Tooltip>,
    dataIndex: 'price',
    key: 'price',
    className: "textRight",
    sorter: (a, b) => a.price - b.price,
    render: (record, obj, index) => {
        return <span className='filter_click' onClick={() => page.filterClick(record, 'price')} >{record ? record.toFixed(1) : "-.--"}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托已成交数量，如果委托已被完全成交，此数值将等于委托数量。'), $('完全成交'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('完全成交')}</span>
    </Tooltip>,
    dataIndex: 'cumQty',
    key: 'cumQty',
    className: "textRight",
    sorter: (a, b) => a.cumQty - b.cumQty,
    render: (record, obj, index) => {
        return <span className='filter_click' onClick={() => page.filterClick(record, 'cumQty')} >{record}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托剩余可被成交的合约数量'), $('剩余'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('剩余')}</span>
    </Tooltip>,
    dataIndex: 'leavesQty',
    key: 'leavesQty',
    className: "textRight",
    sorter: (a, b) => a.leavesQty - b.leavesQty,
    render: (record, obj, index) => {
        return <span className='filter_click' onClick={() => page.filterClick(record, 'leavesQty')} >{record}</span>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('如果这是止损委托，这就是止损被触发的价格而委托就会进入市场。卖空止损将会在价格低于止损价格挂出市场，而买多止损将会在价格高于止损价格后触发。'), $('触发价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('触发价格')}</span>
    </Tooltip>,
    dataIndex: 'stopPx',
    key: 'stopPx',
    className: "textRight",
    sorter: (a, b) => a.stopPx - b.stopPx,
    render: (record, obj, index) => {
        if(record){
            return <span className='filter_click' onClick={() => page.filterClick(record, 'stopPx')}>{record ? record.toFixed(1) : "-.--"}</span>
        }else{
            return <span>{"-.--"}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('此委托的成交均价'), $('成交价格'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('成交价格')}</span>
    </Tooltip>,
    dataIndex: 'avgPx',
    key: 'avgPx',
    className: "textRight",
    sorter: (a, b) => a.avgPx - b.avgPx,
    render: (record, obj, index) => {
        if(record){
            return <span className='filter_click' onClick={() => page.filterClick(record, 'avgPx')}>{record ? record.toFixed(1) : "-.--"}</span>
        }else{
            return <span>{"-.--"}</span>
        }
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托在限价的名义值'), $('委托价值'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('委托价值')}</span>
    </Tooltip>,
    dataIndex: 'execCost',
    key: 'execCost',
    className: "textRight",
    sorter: (a, b) => {
        let pricea = a.price || a.stopPx;
        let priceb = b.price || b.stopPx;
        return (1 / pricea) * a.orderQty - (1 / priceb) * b.orderQty
    },
    render: (record, obj, index) => {
        let price = obj.price || obj.stopPx;
        price = Math.round((1 * 1 / price) * 100000000) * obj.orderQty;
        return <div>
            <span style={{ marginRight: 5, float: "right" }}>
                {currency(parseInt((((price * getCurrencyType().value / 100000000))) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
            </span>
        </div>
    }
}, {
    title: <Tooltip mouseLeaveDelay={0} placement="top"
        title={tooltipShow($('委托的种类，在委托控制参阅可使用的委托种类。'), $('类型'))}>
        <span className='underLine_show' style={{ zIndex: 999 }}>{$('类型')}</span>
    </Tooltip>,
    dataIndex: 'ordType',
    key: 'ordType',
    className: "textRight",
    sorter: (a, b) => { return sortByString(a.ordType, b.ordType) },
    render: (record, obj) => {
        if (!!record) {
            return <span className='filter_click' onClick={() => page.filterClick(record, 'ordType')}>{getOrdType(record)}</span>;
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
    key: 'ordStatus',
    className: "textRight",
    sorter: (a, b) => { return sortByString(a.ordStatus, b.ordStatus) },
    render: (record, obj) => {
        let text = '---';
        if (!!record) {
            if (inMarketOrStop(obj.ordType) && !inShowClear(obj.ordStatus)) {
                if (obj.triggered === "" || !obj.triggered) {
                    text = $('未触发');
                } else if (obj.triggered === 'StopOrderTriggered') {
                    text = $('已触发');
                } else {
                    text = getTradeStatus(record);
                }
            } else {
                text = getTradeStatus(record);
            }
        }
        return <span className='filter_click' onClick={() => page.filterClick(record, 'ordStatus')}>{text}</span>
    }
}, {
    title: $('说明'),
    dataIndex: 'text',
    key: 'text',
    className: "textRight",
    sorter: (a, b) => { return sortByString(a.text, b.text) },
    render: (record, obj, index) => {
        return <Ellipsis tooltip length={15}>{record}</Ellipsis>
    }
}, {
    title: $('客户委托ID'),
    dataIndex: 'clOrdID',
    key: 'clOrdID',
    className: "textRight",
    sorter: (a, b) => a.clOrdID - b.clOrdID,
}, {
    title: $('委托ID'),
    dataIndex: 'orderID',
    key: 'orderID',
    className: "textRight",
    sorter: (a, b) => a.orderID - b.orderID,
    render: (record, obj, index) => {
        let text = record;
        if (record === "00000000-0000-0000-0000-000000000000") {
            text = "";
        }
        return <Ellipsis tooltip length={7}>{text}</Ellipsis>
    }
}];
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            filter: "",
            start:0,
            end:100,
        }
        this.currentPage = 0;
        page = this;
    }
    componentDidMount = () => {
        let arr = document.getElementsByClassName('ant-table-column-sorters');
        for (let value of arr) {
            value.title = ""
        }
    }
    filterClick = (value, key) => {
        let filter = this.state.filter;
        let flag = isJsonString(filter);
        if(flag && typeof filter == 'string') { 
            filter = JSON.parse(filter)
        } else if(typeof filter != 'object') {
            filter = JSON.parse("{}")
        }
        if(filter[key] && filter[key] === value){
            delete filter[key]
        }else{
            filter[key] = value;
        }
        
        this.setState({
            filter
        }, () => {
            this.onClick();
        })
    }
    componentWillMount = () => {
        const { dispatch } = this.props;
        let obj = {
            start: 0,
            reverse: true,
            count: 100,
            filter: '',
        }
        dispatch({
            type: "orderList/orderListHisGet",
            payload: {
                ...obj
            }
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
            filter: key === 'clear'?'': value,
        }
        this.currentPage = start / 100;
        dispatch({
            type: "orderList/orderListHisGet",
            payload: {
                ...obj
            }
        })
    }
    onClear = () => {
        this.setState({
            filter:{}
        })
        this.onClick('clear');
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
        let { orderListHisData, loading } = this.props;
        let { filter } = this.state;
        if (!orderListHisData) {
            orderListHisData = [];
        }
        let start = 100 * this.currentPage;
        let end = orderListHisData.length + 100 * this.currentPage;
        let value = checkJsonString(filter) ? JSON.stringify(filter) : filter
        return (
            <Card className="hover-shadow hisOrderAccount">
                <div className='marginBotm10'>
                    {$('该列表包含你所有提交的委托。')}
                </div>
                <div className='marginBotm10'>
                    {$('点选项目数值来筛选，你可以在下方输入栏手动输入筛选要求。')}
                </div>
                <div className='marginBotm10' style={{ marginBottom: 10 }}>
                    <Input onChange={this.onChange} value={value} style={{ width: 400,marginRight:10 }} placeholder={$('点选下列数值筛选')} />
                    <Button style={{marginRight:10}} onClick={this.onClear} type="primary">{$('清除')}</Button>
                    <Button onClick={this.onClick} type="primary">{$('搜寻')}</Button>
                </div>
                <Page loading={loading} currentPage={this.state.currentPage} onPrePage={this.onClick} onNextPage={this.onClick} start={start} end={end} />
                <Table loading={loading} scroll={{ x: 1200 }} className="tableHis" pagination={false} dataSource={orderListHisData} size="small" columns={columns} />
            </Card>
        )
    }
}

export default connect(({ orderList, margin, loading }) => {
    const { orderListHisData } = orderList;
    const { currencyType } = margin;
    return {
        orderListHisData,
        currencyType,
        loading: !!loading.effects["orderList/orderListHisGet"],
    }
})(
    Form.create()(Index)
)
