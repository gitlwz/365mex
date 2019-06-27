import React, { Component } from 'react'
import { language, Menu } from 'quant-ui';
import { connect } from 'dva';
const $ = language.getLanguageData;
const ordTypeArrStop = ["Stop", "LimitIfTouched", "StopLimit", "MarketIfTouched"];
class Index extends Component {
    handleClick = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/save",
            payload: {
                currentTabs: e.key
            }
        })
    }
    showUserOrderMenu = () => {
        const { orderListData, symbolCurrent, currentTabs, positionHavaListData } = this.props;
        let tabStr = $("全部委托") + "[0]";
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
            } else if (ordTypeArrStop.indexOf(value.ordType) !== -1) {
                stopLength++;
                if (value.triggered !== 'StopOrderTriggered') {
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
        tabStr = $("全部委托") + "[" + length + "]";
        let _positionHavaListData = positionHavaListData.filter(item => item.currentQty !== 0);
        let lengthPosition = 0;
        try{
            lengthPosition = _positionHavaListData.length;
        }catch(error){

        }
        let showText = $('持有仓位') + "[" + lengthPosition + "]";
        return <div>
            <Menu
                onClick={this.handleClick}
                selectedKeys={[currentTabs]}
                mode="horizontal"
            >
                <Menu.Item key="position">
                    {showText}
                </Menu.Item>
                <Menu.Item key="tabStr">
                    {tabStr}
                </Menu.Item>
                <Menu.Item key="active">
                    {active}
                </Menu.Item>
                <Menu.Item key="stop">
                    {stop}
                </Menu.Item>
                <Menu.Item key="trade">
                    {$('已成交')}
                </Menu.Item>
                <Menu.Item key="orderHis">
                    {$('委托历史')}
                </Menu.Item>
                <Menu.Item key="positionHave">
                    {$('已平仓仓位')}
                </Menu.Item>
            </Menu>
        </div>
    }
    render() {
        return (
            <div>
                {this.showUserOrderMenu()}
            </div>
        )
    }
}
export default connect(({ instrument, orderList }) => {
    const { symbolCurrent } = instrument;
    const { orderListData, currentTabs, positionHavaListData } = orderList;
    return {
        symbolCurrent,
        positionHavaListData,
        orderListData,
        currentTabs,
    }
})(
    Index
)