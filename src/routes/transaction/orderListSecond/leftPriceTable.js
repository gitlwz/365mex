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
            buyData: props.buyData,
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
    //         if (buyData) {
    //             this.setState({
    //                 buyData,
    //             })
    //         }
    //     }, 250));
    //     window._message.orderBookL2 = orderBookL2;
    // }
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
                showChangeSendValue: (new Date()).getTime()
            }
        })
    }
    sendOrderVolum = (ele) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                sendPrice: ele.price,
                showChangeSendValue: (new Date()).getTime()
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
        const { depth, orderListWidth } = this.props;
        let _buyData = buyData.slice(0, buyData.length);
        const { maxWidth } = this.props;
        this.orderListDataPriceArr = [];
        this.findPrice();
        return (
            <div className="table-container-inner bids">
                <table cellSpacing="0">
                    <Mytitle orderListWidth={orderListWidth} />
                    <tbody>
                        {_buyData.map((ele, index, arr) => {
                            let className = "";
                            let valueWei = 500;
                            let itemLi = {};
                            let title = "";
                            let classNameLi = "";
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
                                title = translationParameters([ele.price, orderNumberInOrderBook, $('竞买')], $('在 xx 价格 x 张 x 合约'));
                                return <Tooltip onVisibleChange={(e) => this.onVisibleChange(e, ele.price)} mouseLeaveDelay={0} placement="right" title={title}>
                                    <tr
                                        className={className}>
                                        {!this.props.orderListWidth?
                                        <td style={{ textAlign: 'left' }} onClick={() => this.sendOrderPrice(ele)} className="cumSize">
                                        <div>
                                            {this.state.visible[ele.price] ? <a onClick={(e) => {this.canCelOrderAll(ele.price,e, value)}}><Icon style={{ color: "red", fontSize: 12 }} type="close" /></a> : ""}
                                            {currency(ele.all, { separator: ',', precision: 0 }).format()}
                                        </div>
                                    </td>    
                                        :''}
                                        
                                        <RenderItem price={ele.price} leavesQty={itemLi.leavesQty} className={classNameLi} size={ele.size} />
                                        <td onClick={() => this.sendOrderVolum(ele)} style={{ fontWeight: valueWei }} className="price">
                                            <div>
                                                <div className="depthBar" style={{ width: (ele.all / maxWidth) * 100 + "%" }}></div>
                                                <span className="output">{ele.price.toFixed(1)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </Tooltip>
                            }
                            return <tr className={className}>
                                {/* <td onClick={() => this.sendOrderPrice(ele)} className="cumSize">
                                    <div>{currency(ele.all, { separator: ',', precision: 0 }).format()}</div>
                                </td> */}
                                {!this.props.orderListWidth?<Mytd ele={ele} all={ele.all} sendOrderPrice={this.sendOrderPrice} />:''}
                                <RenderItem price={ele.price} leavesQty={itemLi.leavesQty} className={classNameLi} size={ele.size} />
                                <Mytd2 price={ele.price} ele={ele} sendOrderVolum={this.sendOrderVolum} width={(ele.all / maxWidth) * 100 + "%"} valueWei={valueWei} />
                                {/* <td onClick={() => this.sendOrderVolum(ele)} style={{ fontWeight: valueWei }} className="price">
                                    <div>
                                        <div className="depthBar" style={{ width: (ele.all / arr[arr.length - 1].all) * 100 + "%" }}></div>
                                        <span className="output">{ele.price.toFixed(1)}</span>
                                    </div>
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
                {!this.props.orderListWidth?<th style={{ textAlign: 'left' }} className="cumSize">
                    <div className="th-inner">
                        <span>{$('总数量')}</span>
                    </div>
                </th>:''}
                <th className="size">
                    <div className="th-inner">
                        <span>{$('目前委托数量')}</span>
                    </div>
                </th>
                <th className="price">
                    <div className="th-inner">
                        <span>{$('价格')}</span>
                    </div>
                </th>
            </tr>
        </thead>
    }
}
class Mytd extends Component {
    shouldComponentUpdate = (nextProps) => {
        if (nextProps.all !== this.props.all) {
            return true;
        }
        if (nextProps.ele.all !== this.props.ele.all) {
            return true;
        }
        return false;
    }
    render() {
        return (
            <td style={{ textAlign: 'left' }} onClick={() => this.props.sendOrderPrice(this.props.ele)} className="cumSize">
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
            <td onClick={() => this.props.sendOrderVolum(this.props.ele)} style={{ textAlign: 'right', fontWeight: this.props.valueWei }} className="price">
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
    const { orderListWidth } = login;
    const { orderListData, depth } = orderList;
    const { liquidation, buyData, maxWidth } = recentTrade;
    return {
        liquidation,
        symbolCurrent,
        orderListData,
        orderListWidth,
        maxWidth,
        buyData,
        depth
    }
})(
    Index
)