/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react'
import { connect } from 'dva';
import { Icon, Input, Row, Col, InputNumber, Checkbox, Tooltip, Dropdown, Menu } from 'quant-ui';
import { tooltipShow } from '@/utils/utils';
import AddModal from "./addModal.js"
import ButtonPriceLimit from "./buttonPriceLimit"
const InputGroup = Input.Group;
const lengthNum = 2;//对应长度
export class TrailingStop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                ordType: "Stop",
                orderQty:1,
                pegPriceType:"TrailingStopPeg",
                pegOffsetValue:0
            },
            timeInForce:"标记",
            closeFlag: false,//触发后平仓
        }
        this.execInst = "";
        this.checkFlag = true;
        this.changeFlag = true;
        this.type = "Buy";
    }
    componentWillReceiveProps = (props) => {
        if(props.sendVolum !== this.props.sendVolum){
            let dataSource = { ...this.state.dataSource };
            if(props.sendVolum !== this.props.sendVolum){
                dataSource.orderQty = props.sendVolum;
            }
            this.setState({
                dataSource
            })
        }
    }
    positionFlag = (e, type) => {
        let dataSource = this.state.dataSource;
        dataSource[type] = e.target.value;
        this.setState({
            dataSource
        })
    }
    priceInput = (value) => {
        const reg = /^[0-9]*[1-9][0-9]*$/;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            let dataSource = this.state.dataSource;
            dataSource.orderQty = value;
            this.setState({
                dataSource
            })
        } else if ((value && value.toString().length === 1) || value == "0") {
            let dataSource = this.state.dataSource;
            dataSource.orderQty = 0;
            this.setState({
                dataSource
            })
        }
    }
    onChange = (value) => {
        const { tickSize } = this.props;
        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            let index = String(value).indexOf(".");
            let dataSource = this.state.dataSource;
            dataSource.pegOffsetValue = value;
            if (index !== -1) {
                if (index <= String(value).length - lengthNum) {
                    let num = parseInt(value / tickSize);
                    num = (num * tickSize).toFixed(lengthNum - 1);
                    dataSource.pegOffsetValue = num;
                }
            }
            this.setState({
                dataSource
            })
        }
    }
    orderCommit = () => {
        const { dispatch } = this.props;
        let obj = { side: this.type };
        if (this.state.closeFlag && this.execInst !== "") {
            obj.execInst = "Close," + this.execInst;
        } else if (this.state.closeFlag) {
            obj.execInst = "Close";
        } else if(this.execInst !== ""){
            obj.execInst = this.execInst;
        }
        if (this.type === "Buy") {
            dispatch({
                type: "orderCommit/orderCommit",
                payload: { ...this.state.dataSource, ...obj }
            })
        } else {
            dispatch({
                type: "orderCommit/orderCommit",
                payload: { ...this.state.dataSource, ...obj }
            })
        }
    }
    orderButtonClick = (type) => {
        const { dispatch } = this.props;
        this.type = type;
        if (this.checkFlag) {
            dispatch({
                type: "orderCommit/save",
                payload: {
                    addVisible: { addVisibleMarketTrai: true },
                    title: "确认你的委托",
                    commitData:{ ...this.state.dataSource, type: type }
                }
            })
        } else {
            this.orderCommit();
        }
    }
    checkFlagChange = () => {
        this.checkFlag = !this.checkFlag;
    }
    onChangeCheckBox = (e, value) => {
        this.setState({
            [value]: e.target.checked
        })
    }
    tooltipShow = (value, title) => {
        if (title) {
            return <span style={{ fontSize: 12 }}>
                {value}
            </span>;
        } else {
            return <span style={{ fontSize: 12 }}>
                {value}
            </span>
        }
    }
    timeInForceChange = (value, title) => {
        this.execInst = value;
        this.setState({
            timeInForce: title
        })
    }
    menu = () => {
        return <Menu>
            <Menu.Item key="GoodTillCancel">
                <a onClick={() => this.timeInForceChange("","标记")}>标记</a>
            </Menu.Item>
            <Menu.Item key="ImmediateOrCancel">
                <a onClick={() => this.timeInForceChange("LastPrice","最新成交")}>最新成交</a>
                {/* ImmediateOrCancel */}
            </Menu.Item>
            <Menu.Item key="FillOrKill">
                <a onClick={() => this.timeInForceChange("IndexPrice","指数")}>指数</a>
                {/* FillOrKill */}
            </Menu.Item>
        </Menu>
    }
    render() {
        const { tickSize } = this.props;
        const flag = !this.state.dataSource.orderQty || !this.state.dataSource.pegOffsetValue || this.state.dataSource.orderQty == "0";
        return (
            <div className="orderLimitPrice">
                <div className="inputNAndP">
                    <Row className="marginB10">
                        <Col span={6}>
                            <span className="firstSpan">数量</span>
                        </Col>
                        <Col span={18} className="priceInput">
                            <InputGroup compact>
                                <Input disabled size="small" addonBefore="USD" style={{ width: '25%' }} />
                                <InputNumber
                                    size="small"
                                    style={{ textAlign: "right", width: "75%" }}
                                    value={this.state.dataSource.orderQty}
                                    min={0}
                                    formatter={(value) => {
                                        const reg = /^[0-9]*[1-9][0-9]*$/;
                                        if (((!isNaN(value) && reg.test(value)) || value === '' || value === '-')) {
                                            return value;
                                        } else {
                                            if (value === "0") {
                                                return "0";
                                            }
                                            return value ? value.substring(0, value.length - 1) : value;
                                        }
                                    }}
                                    step={1}
                                    onChange={this.priceInput}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="marginB10">
                        <Col span={6}>
                            <span className="firstSpan">追踪价距</span>
                        </Col>
                        <Col span={18} className="priceInput">
                            <InputGroup compact>
                                <Input disabled size="small" addonBefore="USD" style={{ width: '25%' }} />
                                <InputNumber
                                    size="small"
                                    style={{ textAlign: "right", width: "75%" }}
                                    value={this.state.dataSource.pegOffsetValue}
                                    formatter={(value) => {
                                        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
                                        if (((!isNaN(value) && reg.test(value)) || value === '' || value === '-')) {
                                            let index = value.toString().indexOf(".");
                                            if (index !== -1) {
                                                if (index <= value.length - lengthNum) {
                                                    let num = parseInt(value / tickSize);
                                                    num = (num * tickSize).toFixed(lengthNum - 1);
                                                    return num;
                                                }
                                            }
                                            return value;
                                        } else {
                                            return value ? value.substring(0, value.length - 1) : value;
                                        }
                                    }}
                                    step={tickSize} onChange={this.onChange} />
                            </InputGroup>
                        </Col>
                    </Row>
                </div>
                <ButtonPriceLimit 
                    textBuy="设置买入止损" 
                    textSell="设置卖出止损" 
                    orderQty={this.state.dataSource.orderQty || 1} stopPx={this.state.dataSource.pegOffsetValue || 0} 
                    flag={flag}
                    height="70px"
                    touchType={this.state.timeInForce}
                    marketStop="market"
                    stopBuyFlag={false}
                    stopSellFlag={true}
                    trailingStop={true}
                    orderButtonClick={this.orderButtonClick} />
                <div className="checkBoxData">
                    <Row style={{ marginBottom: 5 }}>
                        <Col span={14}>
                            <Tooltip mouseLeaveDelay={0} placement="right" 
                            title={tooltipShow(() => {
                                return <div style={{fontSize: "12px"}}>
                                    <div>请选择使用哪个价格触发止损：</div>
                                    <div>最新价格：365MEX的最新成交价格</div>
                                    <div>指数价格：参考交易所的最新价格</div>
                                    <div>标记价格：365MEX的标记价格（指数价格 + 基差）</div>
                                </div>;
                            },false)}>
                                    <span className="marketStop">触发类型</span>
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow("隐藏委托不会在市场委托上显示")}>
                                <Checkbox className='item_text_check'
                                    onChange={(e) => this.onChangeCheckBox(e, "closeFlag")}><span className="marketStop">触发后平仓</span></Checkbox>
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={17}>
                            <Tooltip mouseLeaveDelay={0} placement="right" 
                            title={tooltipShow(() => {
                                return <div style={{fontSize: "12px"}}>
                                    <div>请选择使用哪个价格触发止损：</div>
                                    <div>最新价格：365MEX的最新成交价格</div>
                                    <div>指数价格：参考交易所的最新价格</div>
                                    <div>标记价格：365MEX的标记价格（指数价格 + 基差）</div>
                                </div>;
                            },false)}>
                                <Dropdown overlay={this.menu()} trigger={['click']}>
                                    <a className="ant-dropdown-link" href="#">
                                        {this.state.timeInForce}<Icon type="caret-down" />
                                    </a>
                                </Dropdown>
                            </Tooltip>
                        </Col>
                    </Row>
                </div>
                <AddModal ordTypeTitle="追踪止损" ordTypeTitleFlag="addVisibleMarketTrai" checkFlagChange={this.checkFlagChange} orderCommit={this.orderCommit} />
            </div >
        )
    }
}
export default connect(({ loading, instrument, orderCommit }) => {
    const { tickSize, lastPrice } = instrument;
    const { sendVolum } = orderCommit;
    return {
        loading: !!loading.effects["orderCommit/orderCommit"],
        tickSize,
        lastPrice,
        sendVolum
    }
})(
    TrailingStop
)
