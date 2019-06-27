import React, { Component } from 'react'
import { Tooltip, Icon, language } from 'quant-ui';
import { connect } from 'dva';
import { tooltipShow } from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { lastPrice, positionHavaListData, symbolCurrent, riskLimit, dataSource, riskStep } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        let text = $("最大杠杆") + ': ';
        let textLeft = $("最新成交价") + ': ' +  lastPrice;
        let min = riskLimit || 20000000000;
        let currentRisk = !!riskLimit ? riskLimit : 20000000000;
        let Step = riskStep || 10000000000;
        let num = (currentRisk - min) / Step;
        let maintMargin = 0.005;
        if (!positionHold) {
            positionHold = {};
        } else {
            currentRisk = positionHold.riskLimit;
            maintMargin = positionHold.maintMarginReq;
        }
        num = (currentRisk - min) / Step;
        let maxLe = 1 / (maintMargin * 1);
        text = text + maxLe.toFixed(2) + " x";
        if (positionHold.liquidationPrice) {
            text = text + "<br />" + $("强平价格") + ": " + positionHold.liquidationPrice;
        }
        let leverage = positionHold.crossMargin ? 0 : positionHold.leverage;
        if((leverage || leverage == 0) && positionHold.liquidationPrice){
            textLeft = $("开仓价格") + ": " + positionHold.avgEntryPrice + "<br />" + textLeft;
            if(leverage == 0){
                textLeft = $("起始杠杆") + ":" + $("全仓") + "<br />" + textLeft;
            }else{
                textLeft = $("起始杠杆") + ": " + leverage + " x<br />" + textLeft;
            }
        }
        return (
            <div className="positionLeverage">
                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(textLeft)}>
                    <span className="initialLeverageIcon">
                        <Icon style={{ display: (this.props.length * ((leverage || 0) / maxLe)) <= 12 ? "none" : "" }} type="safety-certificate" theme="filled" />
                    </span>
                </Tooltip>
                <div className="indicatorGraph">
                    <div style={{ left: ((this.props.length * ((leverage || 0) / maxLe)) || 0) + "%" }} className="lineIndicator">
                        <span style={{ left: (this.props.length * ((leverage || 0) / maxLe)) >= 75 ? (this.props.leftLength + "px") : "10px" }} className="valueLabel">
                            {leverage === undefined ? "0.00" :
                                (positionHold.crossMargin && dataSource.marginLeverage ? dataSource.marginLeverage.toFixed(2) : leverage.toFixed(2)) + " x"}
                        </span>
                    </div>
                </div>
                <span style={{ display: (this.props.length * ((leverage || 0) / maxLe)) > 12 ? "none" : "" }} className="indicatorLabel">{$("杠杆")}</span>
                <span className="maintLeverageIcon">
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(text)}>
                        <Icon type="warning" theme="filled" />
                    </Tooltip>
                </span>
            </div>
        )
    }
}
export default connect(({ instrument, orderList , margin}) => {
    const { positionHavaListData } = orderList;
    const { dataSource } = margin;
    const { symbolCurrent, riskLimit, riskStep, maintMargin , lastPrice} = instrument;
    return {
        positionHavaListData,
        symbolCurrent,
        riskLimit,
        dataSource,
        riskStep,
        maintMargin,
        lastPrice
    }
})(
    Index
)