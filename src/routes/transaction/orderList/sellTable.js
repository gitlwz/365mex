import React, { Component } from 'react'
import { connect } from 'dva';
import TableItem from './tableItem';
import { translationParameters } from '@/utils/utils';
import { inMarketOrStop } from '@/utils/dictionary';
import { Utils, Tooltip, language, Icon } from 'quant-ui';
const currency = Utils.currency;
let { getLanguageData } = language;
let $ = getLanguageData;
class SellTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sellData: props.sellData,
            clickStyle: {},
            visible: {},
            liquidation: []
        }
        this.orderListData = {};
        this.orderListDataPriceArr = {};//某个价格档位所下的委托
    }
    componentWillMount = () => {
        const { orderListData, symbolCurrent } = this.props;
        if (orderListData.length > 0) {
            this.orderListData = {};
            orderListData.map((item) => {
                if ((item.ordStatus === "New" || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && item.side === 'Sell') {
                    if (!inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered') {
                        if (this.orderListData[item.price]) {
                            this.orderListData[item.price] += item.leavesQty;
                        } else {
                            this.orderListData[item.price] = item.leavesQty;
                        }
                    }
                }
            });
        }
    }
    componentWillReceiveProps = (nextProps) => {
        if ("sellData" in nextProps) {
            this.setState({
                sellData: nextProps.sellData,
                liquidation: nextProps.liquidation
            })
        }
        const { orderListData, symbolCurrent } = nextProps;
        if (orderListData.length > 0) {
            this.orderListData = {};
            orderListData.map((item) => {
                if ((item.ordStatus === "New" || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && item.side === 'Sell') {
                    if (!inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered') {
                        if (this.orderListData[item.price]) {
                            this.orderListData[item.price] += item.leavesQty;
                        } else {
                            this.orderListData[item.price] = item.leavesQty;
                        }
                    }
                }
            });
        }
    }
    onMouseUp = (id) => {
        let clickStyle = this.state.clickStyle;
        clickStyle[id] = "";
        this.setState({
            clickStyle
        })
    }
    onMouseDown = (id) => {
        let clickStyle = this.state.clickStyle;
        clickStyle[id] = "box_green";
        this.setState({
            clickStyle
        })
    }
    sendOrderPrice = (price) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                sendPrice: price,
                showChangeSendValue: (new Date()).getTime()
            }
        })
    }
    sendOrderQty = (price, all) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                sendPrice: price,
                sendVolum: all,
                showChangeSendValue: (new Date()).getTime()
            }
        })
    }
    canCelOrderAll = (price, e, value) => {
        e.stopPropagation()
        const { dispatch, symbolCurrent } = this.props;
        if (Array.isArray(value)) {
            let arrID = value.map((item) => item.orderID);
            dispatch({
                type: "orderList/cancelOrder",
                payload: {
                    orderID: arrID
                }
            })
        } else {
            dispatch({
                type: "orderList/cancelOrderAll",
                payload: {
                    filter: {
                        price: price
                    },
                    symbol: symbolCurrent
                }
            })
        }
    }
    onVisibleChange = (visible, price) => {
        let visibles = this.state.visible;
        visibles[price] = visible;
        this.setState({
            visible: visibles
        })
    }
    findPrice = () => {
        const { depth } = this.props;
        if (depth !== 0.5) {
            const { orderListData, symbolCurrent } = this.props;
            const { sellData } = this.state;
            let _orderListData = orderListData.filter((item) => {
                return (item.ordStatus === "New" || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && (!inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered') && item.side === 'Sell';
            })
            for (let obj of sellData) {
                let price = obj.price;
                let newPrice = price;
                let oldPrice = newPrice - depth * 1;
                for (let value of _orderListData) {
                    if (newPrice >= value.price && value.price > oldPrice) {
                        if (this.orderListDataPriceArr[price]) {
                            this.orderListDataPriceArr[price].push(value);
                        } else {
                            this.orderListDataPriceArr[price] = [];
                            this.orderListDataPriceArr[price].push(value);
                        }
                    }
                }
            }
        }
    }
    render() {
        const { sellData, liquidation } = this.state;
        const { depth, maxWidth } = this.props;
        let positionSetting = window.localStorage.getItem("recent_data_height") - 4;
        if (positionSetting <= 0) {
            positionSetting = 1;
        }
        let _sellData = [];
        try {
            if (positionSetting <= sellData.length) {
                _sellData = sellData.slice(sellData.length - positionSetting, sellData.length)
            } else {
                _sellData = sellData.slice(0, sellData.length)
            }
        } catch (error) {

        }
        return (
            <div className="table-container-inner">
                <table cellSpacing="0">
                    <thead>
                        <tr style={{ height: '31px' }}>
                            <th className="price">
                                <div style={{ textAlign: 'left' }} className="th-inner">
                                    <span>{$('价格')}</span>
                                </div>
                            </th>
                            <th className="size">
                                <div className="th-inner">
                                    <span>{$('目前委托数量')}</span>
                                </div>
                            </th>
                            <th className="cumSize">
                                <div className="th-inner">
                                    <span>{$('总数量')}</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {_sellData.map((ele, index, arr) => {
                            let itemLi = {};
                            let title = "";
                            let classNameLi = "";
                            let className = "";
                            let valueWei = 500;
                            if (liquidation.length > 0) {
                                for (let value of liquidation) {
                                    if (value.price === ele.price && value.symbol === ele.symbol) {
                                        classNameLi = "liquidation";
                                        itemLi = value;
                                    }
                                }
                            }
                            let value = depth === 0.5 ? this.orderListData[ele.price] : this.orderListDataPriceArr[ele.price];
                            if (value) {
                                let orderNumberInOrderBook = value;
                                if (Array.isArray(value)) {
                                    orderNumberInOrderBook = value.reduce(function (total, currentValue, currentIndex, arr) {
                                        return total + currentValue.leavesQty;
                                    }, 0)
                                }
                                className = " selt_order";
                                valueWei = 700;
                                title = translationParameters([ele.price, orderNumberInOrderBook, $('竞卖')], $('在 xx 价格 x 张 x 合约'));
                                return <Tooltip onVisibleChange={(e) => this.onVisibleChange(e, ele.price)} mouseLeaveDelay={0} placement="right" title={title}>
                                    <tr key={ele.id}
                                        // onMouseDown={() => this.onMouseDown(ele.id)}
                                        // onMouseUp={() => this.onMouseUp(ele.id)}
                                        onClick={() => this.sendOrderPrice(ele.price)}
                                        className={className}>
                                        <td className="price">
                                            <div>
                                                {this.state.visible[ele.price] ? <a onClick={(e) => this.canCelOrderAll(ele.price, e, value)}><Icon style={{ color: "red", fontSize: 12 }} type="close" /></a> : ""}
                                                {ele.price.toFixed(1)}
                                            </div>
                                        </td>
                                        <TableItem price={ele.price} className={classNameLi} size={ele.size} />
                                        <td className="cumSize"
                                            onClick={() => this.sendOrderQty(ele.price, ele.all)}
                                        >
                                            <div>
                                                <div className="depthBar" style={{ width: (ele.all / maxWidth) * 100 + "%" }}>
                                                </div>
                                                <span className="output">{currency(ele.all, { separator: ',', precision: 0 }).format()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </Tooltip>
                            }
                            return <tr key={ele.id}
                                // onMouseDown={() => this.onMouseDown(ele.id)}
                                // onMouseUp={() => this.onMouseUp(ele.id)}
                                onClick={() => this.sendOrderPrice(ele.price)}
                                >
                                <td className="price">
                                    <div>{ele.price.toFixed(1)}</div>
                                </td>
                                <TableItem price={ele.price} className={classNameLi} size={ele.size} />
                                {/* <td className={"size isNew highlightInc "+ele.dic}>
                                    <span className={className}>{ele.size}</span>
                                </td> */}
                                <td className="cumSize"
                                    onClick={() => this.sendOrderQty(ele.price, ele.all)}
                                >
                                    <div>
                                        <div className="depthBar" style={{ width: (ele.all / maxWidth) * 100 + "%" }}>
                                        </div>
                                        <span className="output">{currency(ele.all, { separator: ',', precision: 0 }).format()}</span>
                                    </div>
                                </td>
                            </tr>
                            // return <TableRow 
                            // columnsClose={columnsClose}
                            // key={ele.price + "-" + ele.size + "-" + ele.all}
                            // width={(ele.all / arr[0].all) * 100 + "%"} 
                            // ele={ele} />

                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default connect(({ recentTrade, instrument, orderList }) => {
    const { symbolCurrent } = instrument;
    const { orderListData, depth } = orderList;
    const { liquidation, sellData, maxWidth } = recentTrade;
    return {
        sellData,
        liquidation,
        symbolCurrent,
        orderListData,
        maxWidth,
        depth
    }
})(
    SellTable
)
