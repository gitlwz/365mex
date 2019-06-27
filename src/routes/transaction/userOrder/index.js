import React, { Component } from 'react'
import { Tabs, language } from 'quant-ui';
import { connect } from 'dva';
import OrderList from "./orderList/index.js";
import ActiveOrderList from "./activeOrderList/index.js";
import StopOrderList from "./stopOrderList/index.js";
import TradeList from "./tradeList/index.js";
// import PositionHave from "./positionHave/index.js";
// import PositionClose from "./positionClose/index.js";
import OrderListHis from "./orderListHis/index.js";
let { getLanguageData } = language;
let $ = getLanguageData;
const TabPane = Tabs.TabPane;
const ordTypeArr = ["Stop","LimitIfTouched","StopLimit","MarketIfTouched"];
//stop 市价止损 MarketIfTouched 市价止盈 StopLimit 限价止损 LimitIfTouched 限价止盈
class Index extends Component {
    render() {
        const { orderListData, symbolCurrent } = this.props;
        let tabStr = symbolCurrent + "[0]";
        let active = $('活动委托') + "[0]";
        let stop = $('止损委托') + "[0]";
        let activeLength = orderListData.length;
        let length = orderListData.length;
        let stopLength = 0;
        for (let value of orderListData) {
            if (value.ordStatus !== "New" && value.ordStatus !== "PartiallyFilled") {
                    activeLength--;
                length--;
            } else if (value.symbol !== symbolCurrent) {
                length--;
            } else if (ordTypeArr.indexOf(value.ordType) !== -1) {
                stopLength++;
                if(value.triggered !== 'StopOrderTriggered'){
                    activeLength--;
                }
            }
        }
        if (activeLength > 0 && orderListData[0].symbol) {
            active = $('活动委托') + "[" + activeLength + "]";
        }
        if (stopLength > 0) {
            stop = $('止损委托') + "[" + stopLength + "]";
        }
        tabStr = symbolCurrent + "[" + length + "]";
        return (
            <div className="userOrder">
                <Tabs defaultActiveKey="1" animated={false}>
                    <TabPane tab={tabStr} key="1">
                        <OrderList />
                    </TabPane>
                    <TabPane tab={active} key="2">
                        <ActiveOrderList />
                    </TabPane>
                    <TabPane tab={stop} key="3">
                        <StopOrderList />
                    </TabPane>
                    <TabPane tab={$('已成交')} key="4">
                        <TradeList />
                    </TabPane>
                    <TabPane tab={$('委托历史')} key="5">
                        <OrderListHis />
                    </TabPane>
                    {/* <TabPane tab={$('持有仓位')} key="6">
                        <PositionHave />
                    </TabPane>
                    <TabPane tab={$('已平仓仓位')} key="7">
                        <PositionClose />
                    </TabPane> */}
                </Tabs>
            </div>
        )
    }
}

export default connect(({ orderList, instrument }) => {
    const { orderListData } = orderList;
    const { symbolCurrent } = instrument;
    return {
        orderListData,
        symbolCurrent
    }
})(
    Index
)

