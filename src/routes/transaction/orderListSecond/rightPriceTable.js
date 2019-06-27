import React, { Component } from 'react'
import { Icon, Utils, Tooltip, language } from 'quant-ui';
import { connect } from 'dva';
import RenderItem from './renderItem';
import { translationParameters } from '@/utils/utils';
import { inMarketOrStop } from '@/utils/dictionary';
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sellData: props.sellData,
            visible: {

            },
            liquidation: []
        }
        this.orderListData = {};
        this.orderListDataPriceArr = {};//某个价格档位所下的委托
    }
    // componentDidMount = () => {
    //     let orderBookL2 = window._message.orderBookL2 || [];
    //     orderBookL2.push(throttle(({ buyData, sellData }) => {
    //         if (sellData) {
    //             this.setState({
    //                 sellData,
    //             })
    //         }
    //     }, 250));
    //     window._message.orderBookL2 = orderBookL2
    // }
    componentWillMount = () => {
        const { orderListData, symbolCurrent } = this.props;
        if (orderListData.length > 0) {
            this.orderListData = {};
            orderListData.map((item) => {
                if ((item.ordStatus === "New"  || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && item.side === 'Sell') {
                    if(!inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered'){
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
                if ((item.ordStatus === "New"  || item.ordStatus === "PartiallyFilled") && item.symbol === symbolCurrent && item.side === 'Sell') {
                    if(!inMarketOrStop(item.ordType) || item.triggered === 'StopOrderTriggered'){
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
    sendOrderPrice = (ele) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                sendPrice: ele.price,
                sendVolum: ele.all,
                showChangeSendValue:(new Date()).getTime()
            }
        })
    }
    sendOrderVolum = (ele) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                sendPrice: ele.price,
                showChangeSendValue:(new Date()).getTime()
            }
        })
    }
    canCelOrderAll = (price, e, value) => {
        e.stopPropagation()
        const { dispatch, symbolCurrent } = this.props;
        if(Array.isArray(value)){
            let arrID = value.map((item) => item.orderID);
            dispatch({
                type: "orderList/cancelOrder",
                payload: {
                    orderID:arrID
                }
            })
        }else{
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
        const { maxWidth, depth, orderListWidth } = this.props;
        let _sellData = [];
        _sellData = sellData.slice(0, sellData.length).sort((a, b) => { return a.price - b.price });
        this.orderListDataPriceArr = [];
        this.findPrice();
        return (
            <div className="table-container-inner asks">
                <table cellSpacing="0">
                    <Mytitle orderListWidth={orderListWidth} />
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
                                if(Array.isArray(value)){
                                    orderNumberInOrderBook = value.reduce(function (total, currentValue, currentIndex, arr) {
                                        return total + currentValue.leavesQty;
                                    }, 0)
                                }
                                className = "selt_order";
                                valueWei = 700;
                                title = translationParameters([ele.price, orderNumberInOrderBook, $('竞卖')], $('在 xx 价格 x 张 x 合约'));
                                return <Tooltip onVisibleChange={(e) => this.onVisibleChange(e, ele.price)} mouseLeaveDelay={0} placement="right" title={title}>
                                    <tr className={className}>
                                        <td style={{ fontWeight: valueWei, textAlign: 'left' }} onClick={() => this.sendOrderVolum(ele)} className="price">
                                            <div>
                                                <div className="depthBar" style={{ width: (ele.all / maxWidth) * 100 + "%" }}></div>
                                                <span className="output">{ele.price.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <RenderItem leavesQty={itemLi.leavesQty} price={ele.price} className={classNameLi} size={ele.size} />
                                        {!this.props.orderListWidth?
                                        <td onClick={() => this.sendOrderPrice(ele)} className="cumSize">
                                            <div>
                                                {currency(ele.all, { separator: ',', precision: 0 }).format()}
                                                {this.state.visible[ele.price] ? <a onClick={(e) => this.canCelOrderAll(ele.price, e, value)}><Icon style={{ color: "red", fontSize: 12 }} type="close" /></a> : ""}
                                            </div>
                                        </td>
                                        :''}
                                    </tr>
                                </Tooltip>
                            }
                            return <tr className={className}>
                                <Mytd2 valueWei={valueWei}
                                    sendOrderVolum={this.sendOrderVolum}
                                    width={(ele.all / maxWidth) * 100 + "%"}
                                    ele={ele}
                                    price={ele.price}
                                />
                                {/* <td style={{ fontWeight: valueWei }} onClick={() => this.sendOrderVolum(ele)} className="price">
                                    <div>
                                        <div className="depthBar" style={{ width: (ele.all / arr[arr.length - 1].all) * 100 + "%" }}></div>
                                        <span className="output">{ele.price.toFixed(1)}</span>
                                    </div>
                                </td> */}
                                <RenderItem leavesQty={itemLi.leavesQty} price={ele.price} className={classNameLi} size={ele.size} />
                                {!this.props.orderListWidth?<Mytd all={ele.all} sendOrderPrice={this.sendOrderPrice} ele={ele} />:''}
                                {/* <td onClick={() => this.sendOrderPrice(ele)} className="cumSize">
                                    <div>{currency(ele.all, { separator: ',', precision: 0 }).format()}</div>
                                </td> */}
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}
class Mytitle extends Component {
    shouldComponentUpdate = (nextProps) => {
        if(this.props.orderListWidth !== nextProps.orderListWidth){
            return true;
        }
        return false
    }
    render() {
        return <thead>
            <tr>
                <th style={{ textAlign: 'left' }} className="price">
                    <div className="th-inner">
                        <span>{$('价格')}</span>
                    </div>
                </th>
                <th className="size">
                    <div className="th-inner">
                        <span>{$('目前委托数量')}</span>
                    </div>
                </th>
                {!this.props.orderListWidth?
                <th className="cumSize">
                    <div className="th-inner">
                        <span>{$('总数量')}</span>
                    </div>
                </th>
                :''}
            </tr>
        </thead>
    }
}
class Mytd extends Component {
    shouldComponentUpdate = (nextProps) => {
        if (nextProps.ele.all !== this.props.ele.all) {
            return true;
        }
        if (nextProps.all !== this.props.all) {
            return true;
        }
        return false;
    }
    render() {
        return (
            <td onClick={() => this.props.sendOrderPrice(this.props.ele)} className="cumSize">
                <div>{currency(this.props.all, { separator: ',', precision: 0 }).format()}</div>
            </td>
        )
    }
}
class Mytd2 extends Component {
    shouldComponentUpdate = (nextProps) => {
        if (nextProps.ele.all !== this.props.ele.all) {
            return true;
        }
        if (nextProps.ele.price !== this.props.ele.price) {
            return true;
        }
        if (nextProps.price !== this.props.price) {
            return true;
        }
        if (nextProps.valueWei !== this.props.valueWei) {
            return true;
        }
        if (nextProps.width !== this.props.width) {
            return true;
        }
        return false;
    }
    render() {
        return (
            <td onClick={() => this.props.sendOrderVolum(this.props.ele)} style={{ fontWeight: this.props.valueWei, textAlign: 'left' }} className="price">
                <div>
                    <div className="depthBar" style={{ width: this.props.width }}></div>
                    <span className="output">{this.props.price.toFixed(1)}</span>
                </div>
            </td>
        )
    }
}
export default connect(({ instrument, recentTrade, orderList, login }) => {
    const { symbolCurrent } = instrument;
    const { orderListData, depth } = orderList;
    const { orderListWidth } = login;
    const { liquidation, sellData, maxWidth } = recentTrade;
    return {
        sellData,
        liquidation,
        symbolCurrent,
        orderListData,
        orderListWidth,
        maxWidth,
        depth
    }
})(
    Index
)