import React, { Component } from 'react'
import { connect } from 'dva';
import TableRow from './tableRow';
import TableItem from './tableItem';
import { translationParameters } from '@/utils/utils';
import { inMarketOrStop } from '@/utils/dictionary';
import { Utils, Tooltip, language, Icon } from 'quant-ui';
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
class BuyTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buyData: props.buyData,
            clickStyle: {},
            visible: {

            },
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
                if ((item.ordStatus === "New" || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && item.side === 'Buy') {
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
        if ("buyData" in nextProps) {
            this.setState({
                buyData: nextProps.buyData,
                liquidation: nextProps.liquidation
            })
        }
        const { orderListData, symbolCurrent } = nextProps;
        if (orderListData.length > 0) {
            this.orderListData = {};
            orderListData.map((item) => {
                if ((item.ordStatus === "New" || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && item.side === 'Buy') {
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
        clickStyle[id] = "box_red";
        this.setState({
            clickStyle
        })
    }
    renderTable = (buyData) => {
        let item = [];
        for (let i = 0; i < buyData.length; i++) {
            item.push(
                <TableRow key={buyData[i].id}
                    width={(buyData[i].all / buyData[buyData.length - 1].all) * 100 + "%"}
                    ele={buyData[i]}
                    color="green"
                    greenOrRed="depthBar-green"
                    hover="hover-green"
                />
            )
        }
        return item;
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
            const { buyData } = this.state;
            let _orderListData = orderListData.filter((item) => {
                return (item.ordStatus === "New" || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && (!inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered') && item.side === 'Buy';
            })
            for (let obj of buyData) {
                let price = obj.price;
                let newPrice = price;
                let oldPrice = newPrice + depth * 1;
                for (let value of _orderListData) {
                    if (newPrice <= value.price && value.price < oldPrice) {
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
        const { buyData, liquidation } = this.state;
        const { depth, maxWidth } = this.props;
        this.orderListDataPriceArr = [];
        this.findPrice();
        let positionSetting = window.localStorage.getItem("recent_data_height") - 4;
        if (positionSetting <= 0) {
            positionSetting = 1;
        }
        let _buyData = [];
        try {
            if (positionSetting <= buyData.length) {
                _buyData = buyData.slice(0, positionSetting)
            } else {
                _buyData = buyData.slice(0, buyData.length)
            }
        } catch (error) {

        }
        return (
            <div className="table-container-inner">
                <table cellSpacing="0">
                    <tbody>
                        {/* {this.renderTable(_buyData)} */}
                        {_buyData.map((ele, index, arr) => {
                            let className = "";
                            let valueWei = 500;
                            let itemLi = {};
                            let title = "";
                            let classNameLi = "";
                            if (liquidation.length > 0) {
                                let item = liquidation[0];
                                if (item.price === ele.price && item.symbol === ele.symbol) {
                                    classNameLi = "liquidation";
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
                                title = translationParameters([ele.price, orderNumberInOrderBook, $('竞买')], $('在 xx 价格 x 张 x 合约'));
                                return <Tooltip onVisibleChange={(e) => this.onVisibleChange(e, ele.price)} mouseLeaveDelay={0} placement="right" title={title}>
                                    <tr key={ele.id}
                                        // onMouseDown={() => this.onMouseDown(ele.id)}
                                        // onMouseUp={() => this.onMouseUp(ele.id)}
                                        onClick={() => this.sendOrderPrice(ele.price)}
                                        className={"hover-green " + className}>
                                        <td style={{ fontWeight: valueWei }} className="price green" key={ele.price}>
                                            <div>
                                                {this.state.visible[ele.price] ? <a onClick={(e) => { this.canCelOrderAll(ele.price, e, value) }}><Icon style={{ color: "red", fontSize: 12 }} type="close" /></a> : ""}
                                                {ele.price.toFixed(1)}
                                            </div>
                                        </td>
                                        <TableItem price={ele.price} className={classNameLi} size={ele.size} />
                                        <td className="cumSize"
                                            onClick={() => this.sendOrderQty(ele.price, ele.all)}
                                        >
                                            <div>
                                                <div className="depthBar depthBar-green" style={{ width: (ele.all / maxWidth) * 100 + "%" }}>
                                                </div>
                                                <span className="output">
                                                    {currency(ele.all, { separator: ',', precision: 0 }).format()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </Tooltip>
                            }
                            return <tr key={ele.id}
                                // onMouseDown={() => this.onMouseDown(ele.id)}
                                // onMouseUp={() => this.onMouseUp(ele.id)}
                                onClick={() => this.sendOrderPrice(ele.price)}
                                className={"hover-green "}>
                                <td className="price green" key={ele.price}>
                                    <div>{ele.price.toFixed(1)}</div>
                                </td>
                                <TableItem price={ele.price} className={classNameLi} size={ele.size} />
                                {/* <td className={"size isNew highlightInc " + ele.dic} key={ele.size}>
                                    <span className={className}>{ele.size}</span>
                                </td> */}
                                <td className="cumSize"
                                    onClick={() => this.sendOrderQty(ele.price, ele.all)}
                                >
                                    <div>
                                        <div className="depthBar depthBar-green" style={{ width: (ele.all / maxWidth) * 100 + "%" }}>
                                        </div>
                                        <span className="output">{currency(ele.all, { separator: ',', precision: 0 }).format()}</span>
                                    </div>
                                </td>
                            </tr>
                            // return <TableRow 
                            // columnsClose={columnsClose}
                            // key={ele.price + "-" + ele.size + "-" + ele.all}
                            // width={(ele.all / arr[_buyData.length - 1].all) * 100 + "%"} 
                            // ele={ele} />
                            // return <TableItem 
                            // greenOrRed="depthBar-green" 
                            // color={"green"}
                            // hover={"hover-green"}
                            // width={(ele.all / arr[_buyData.length - 1].all) * 100 + "%"} ele={ele} />;
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
    const { buyData, liquidation, maxWidth } = recentTrade
    return {
        buyData,
        liquidation,
        maxWidth,
        symbolCurrent,
        orderListData,
        depth,
    }
})(
    BuyTable
)
