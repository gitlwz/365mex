import React, { Component } from 'react'
import { Icon, Spin, screenfull, Tooltip, language } from 'quant-ui';
import { connect } from 'dva';
import LeftPriceTable from './leftPriceTable';
import { tooltipShow, showLastTickDirection, getTickLength } from '@/utils/utils';
import RightPriceTable from './rightPriceTable';
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastPrice: "",
            render: true
        }
        this.className = "PlusTick";
    }
    componentWillMount() {
        screenfull.on('change', (a, b, c, d) => {
            if (screenfull.isFullscreen) {
                window.localStorage.setItem("recent_data_height_second", JSON.stringify(70))
                // window._worker.postMessage({
                //     method: "title", data: {
                //         recent_data_height_second: JSON.stringify(70),
                //     }
                // })
            } else {
                let clientHeight = (a.srcElement.clientHeight - 58) / 20;
                window.localStorage.setItem("recent_data_height_second", JSON.stringify(clientHeight))
                // window._worker.postMessage({
                //     method: "title", data: {
                //         recent_data_height_second: JSON.stringify(clientHeight),
                //     }
                // })
            }
            this.setState({
                render: !this.state.render
            })
        });
    }
    componentWillReceiveProps(props) {
        if (props.instrumentData) {
            this.setState({
                lastPrice: props.instrumentData.lastPrice
            })
        }
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.state.lastPrice > nextState.lastPrice) {
            this.className = "MinusTick";
        } else if (this.state.lastPrice < nextState.lastPrice) {
            this.className = "PlusTick";
        } else if (this.state.lastPrice == nextState.lastPrice) {
            if (this.className === "MinusTick" || this.className === "ZeroMinusTick") {
                this.className = "ZeroMinusTick";
            } else {
                this.className = "ZeroPlusTick";
            }
        }
        return true;
    }
    showLight = (deleveragePercentile) => {
        let showLight = [<div key='leverageLight1' className="leverageLight inactive statusGreen"></div>,
        <div key='leverageLight2' className="leverageLight inactive statusGreen"></div>,
        <div key='leverageLight3' className="leverageLight inactive statusGreen"></div>,
        <div key='leverageLight4' className="leverageLight inactive statusGreen"></div>,
        <div key='leverageLight5' className="leverageLight inactive statusGreen"></div>];
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
        const { instrumentData, symbolCurrent } = this.props;
        const { positionHavaListData } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        if (!positionHold) {
            positionHold = {}//
        }
        let positionSetting = parseInt(window.localStorage.getItem("recent_data_height_second"));
        if (positionSetting <= 0) {
            positionSetting = 1;
        }
        let icon = showLastTickDirection(instrumentData.lastTickDirection);
        return (
            <div className="orderListSecond">
                {/* {instrumentData.lastPrice ? */}
                    <div className="resizesensor-wrapper">
                        <div className="orderBook">
                            <div className="lastPriceWidget">
                                <span className={"lastTick " + icon}>
                                    {instrumentData.lastPrice ? instrumentData.lastPrice.toFixed(getTickLength(instrumentData.tickSize)) : "--"}
                                    <Icon type={icon} theme="outlined" />
                                </span>
                                <div className="limits">
                                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('指数价格: 标的资产的价格') + '<br />' + $('这是.365XBT的价格，点此查看历史价格。'))}>
                                        <a className="indicativeSettlePrice">
                                            {/* <Icon style={{ marginRight: 1 }} type="global" /> */}
                                            <i style={{ marginRight: 1 }}  className={'all-icon-img earth'}></i>
                                            <i>{instrumentData.indicativeSettlePrice ? parseFloat(instrumentData.indicativeSettlePrice || 0).toFixed(3).slice(0,-1) : ""}</i>
                                        </a>
                                    </Tooltip>

                                    <span className="fairPrice">
                                        /
                                        <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('标记价格') + ": " + $("这是现在的标记价格, 点此了解更多"))}>
                                            <i style={{ marginRight: 1 }}  className={'all-icon-img earthMark'}></i>
                                            <a>{instrumentData.markPrice ? parseFloat(instrumentData.markPrice || 0).toFixed(3).slice(0,-1) : ""}</a>
                                        </Tooltip>
                                    </span>
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
                            </div>
                            <div className="flexBody">
                                <div className="table-container">
                                    <LeftPriceTable />
                                </div>
                                <div className="table-container">
                                    <RightPriceTable />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* // :
                    // <div className="example">
                    //     <Spin />
                    // </div>} */}
            </div>
        )
    }
}

export default connect(({ instrument, orderList }) => {
    const { instrumentData, symbolCurrent } = instrument;
    const { positionHavaListData } = orderList;
    return {
        instrumentData,
        symbolCurrent,
        positionHavaListData
    }
})(
    Index
)
