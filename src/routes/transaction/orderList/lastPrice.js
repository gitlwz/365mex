/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import { connect } from 'dva';
import { Icon, language, Tooltip } from 'quant-ui';
import { getTickLength, showLastTickDirection, tooltipShow } from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
class LastPrice extends Component {
    showLight = (deleveragePercentile) => {
        let showLight = [<div className="leverageLight inactive statusGreen"></div>,
        <div className="leverageLight inactive statusGreen"></div>,
        <div className="leverageLight inactive statusGreen"></div>,
        <div className="leverageLight inactive statusGreen"></div>,
        <div className="leverageLight inactive statusGreen"></div>];
        if (deleveragePercentile == 1) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.8) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.6) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
            showLight[2] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.4) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
            showLight[2] = <div className="leverageLight active statusGreen"></div>;
            showLight[3] = <div className="leverageLight active statusGreen"></div>;
        } else if (deleveragePercentile == 0.2) {
            showLight[0] = <div className="leverageLight active statusGreen"></div>;
            showLight[1] = <div className="leverageLight active statusGreen"></div>;
            showLight[2] = <div className="leverageLight active statusGreen"></div>;
            showLight[3] = <div className="leverageLight active statusGreen"></div>;
            showLight[4] = <div className="leverageLight active statusGreen"></div>;
        }
        return showLight;
    }
    render() {
        const { instrumentData, positionHavaListData, symbolCurrent } = this.props
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        if (!positionHold) {
            positionHold = {}
        }
        let icon = showLastTickDirection(instrumentData.lastTickDirection);
        return (
            <div className="lastPriceWidget">
                <div className={"headPrice " + icon}>
                    {instrumentData.lastPrice ? instrumentData.lastPrice.toFixed(getTickLength(instrumentData.tickSize)) : "--"}<Icon type={icon} theme="outlined" />
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('这一指标显示你在自动减仓队列中的位置。如果所有的指示灯都亮起，在发生强平事件后，你的仓位可能被减小。点此查看更多详细信息。'))}>
                        <div className="positionDeleverageIndicatorWrapper">
                            <a>
                                <div className="positionDeleverageIndicator">
                                    {this.showLight(positionHold.deleveragePercentile)}
                                </div>
                            </a>
                        </div>
                    </Tooltip>
                </div>
                <div className="limits">
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('指数价格: 标的资产的价格') + '<br />' + $('这是.365XBT的价格，点此查看历史价格。'))}>
                        <a className="indicativeSettlePrice">
                            <i style={{ marginRight: 1 }}  className={'all-icon-img earth'}></i>
                            <i>{instrumentData.indicativeSettlePrice ? parseFloat(instrumentData.indicativeSettlePrice || 0).toFixed(3).slice(0, -1) : ""}</i>
                        </a>
                    </Tooltip>
                    <span className="fairPrice">
                        /
                        <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('标记价格') + ": " + $("这是现在的标记价格, 点此了解更多"))}>
                            <i style={{ marginRight: 1 }}  className={'all-icon-img earthMark'}></i>
                            <a>{instrumentData.markPrice ? parseFloat(instrumentData.markPrice || 0).toFixed(3).slice(0, -1) : ""}</a>
                        </Tooltip>
                    </span>
                </div>
            </div>
        )
    }
}
export default connect(({ instrument, orderList }) => {
    const { instrumentData, symbolCurrent } = instrument;
    const { positionHavaListData } = orderList;
    return {
        instrumentData,
        positionHavaListData,
        symbolCurrent
    }
})(
    LastPrice
)