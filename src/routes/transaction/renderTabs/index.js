import React, { Component } from 'react'
import { connect } from 'dva';
import UserOrderList from "../userOrder/orderList/index.js";
import ActiveOrderList from "../userOrder/activeOrderList/index.js";
import StopOrderList from "../userOrder/stopOrderList/index.js";
import TradeList from "../userOrder/tradeList/index.js";
import OrderListHis from "../userOrder/orderListHis/index.js";
import PositionHave from '../userOrder/positionHave/index.js';
import PositionClose from "../userOrder/positionClose/index.js";
class Index extends Component {
    userOrderSwitch = (currentTabs) => {
        switch (currentTabs) {
            case 'tabStr':
                return <UserOrderList deleteAllOrder={this.props.deleteAllOrder} deleteOrder={this.props.deleteOrder} key='UserOrderList'/>
            case 'active':
                return <ActiveOrderList deleteAllOrder={this.props.deleteAllOrder} deleteOrder={this.props.deleteOrder} key='ActiveOrderList' />
            case 'stop':
                return <StopOrderList deleteAllOrder={this.props.deleteAllOrder} deleteOrder={this.props.deleteOrder} key='StopOrderList' />
            case 'trade':
                return <TradeList key='TradeList' />
            case 'orderHis':
                return <OrderListHis key='OrderListHis' />
            case 'position':
                return <PositionHave key='PositionHave' />
            case 'positionHave':
                return <PositionClose key='PositionClose' />
            default:
                return ''
        }
    }
    render() {
        const { currentTabs } = this.props;
        return (
            <div>
                {this.userOrderSwitch(currentTabs)}
            </div>
        )
    }
}
export default connect(({ orderList }) => {
    const { currentTabs } = orderList;
    return {
        currentTabs
    }
})(
    Index
)