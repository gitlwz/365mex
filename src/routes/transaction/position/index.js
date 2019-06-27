import React, { Component } from 'react'
import { Tabs, language } from 'quant-ui';
import { connect } from 'dva';
import PositionHave from "../userOrder/positionHave/index.js";
import PositionClose from "../userOrder/positionClose/index.js";
let { getLanguageData } = language;
let $ = getLanguageData;
const TabPane = Tabs.TabPane;
//stop 市价止损 MarketIfTouched 市价止盈 StopLimit 限价止损 LimitIfTouched 限价止盈
class Index extends Component {
    render() {
        return (
            <div className="userOrder">
                <Tabs defaultActiveKey="1" animated={false}>
                    <TabPane tab={$('持有仓位')} key="1">
                        <PositionHave />
                    </TabPane>
                    <TabPane tab={$('已平仓仓位')} key="2">
                        <PositionClose />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default connect(({ orderList, instrument }) => {
})(
    Index
)

