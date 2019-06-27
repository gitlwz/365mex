import React, { Component } from 'react'
import { connect } from 'dva';
import { Icon, Input, Row, Col, Radio, language, Utils, Ellipsis, Checkbox, Tooltip, Dropdown, Menu } from 'quant-ui';
import { tooltipShow, translationParameters, getTickLength } from '@/utils/utils';
import AddModal from "./addModal.js";
import ButtonPriceLimit from "./buttonPriceLimit";
import PlusMult from "./plusMult";
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;
const currency = Utils.currency;
const tick = 0.5;//最小变化单位
const lengthNum = 2;//对应长度
let { getLanguageData } = language;
let $ = getLanguageData;
export class MarketStopLose extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                ordType: "Stop",
                orderQty: 1,
            },
            timeInForce: "最新成交",
            closeFlag: false,//触发后平仓
            showMoreSetting: false,//高级设置显示隐藏
        }
        this.execInst = "LastPrice";
        this.checkFlag = true;
        this.changeFlag = true;
        this.type = "Buy";
    }
    positionFlag = (e, type) => {
        let dataSource = this.state.dataSource;
        dataSource[type] = e.target.value;
        this.setState({
            dataSource
        })
    }
    componentDidMount = () => {
        const { lastPrice, tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        let dataSource = this.state.dataSource;
        try {
            dataSource.stopPx = (lastPrice - _tickSize).toFixed(getTickLength(_tickSize));
        } catch (error) {

        }
        this.setState({
            dataSource
        })
    }
    componentWillReceiveProps = (props) => {
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        if (props.showChangeSendValue !== this.props.showChangeSendValue) {
            let dataSource = { ...this.state.dataSource };
            if (props.sendPrice) {
                dataSource.stopPx = (props.sendPrice * 1).toFixed(getTickLength(_tickSize));
            }
            if (props.sendVolum) {
                dataSource.orderQty = props.sendVolum;
            }
            this.setState({
                dataSource
            })
        }
    }
    priceInput = (e) => {
        let value = e.target.value;
        const reg = /^[0-9]*[1-9][0-9]*$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
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
    priceInputHide = (value) => {
        const reg = /^[0-9]*[1-9][0-9]*$/;
        let displayQty = this.state.displayQty;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            displayQty = value;
            this.setState({
                displayQty
            })
        } else if (value == "0") {
            displayQty = 0;
            this.setState({
                displayQty
            })
        }
    }
    onlyNumber = (e, key) => {
        if (key === "qty" && e.charCode === 46) {
            e.preventDefault();
            return false;
        }
        if (e.charCode === 45) {
            e.preventDefault();
            return false;
        }
    }
    onChange = (e) => {
        let value = e.target.value;
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const reg = /^(0|[1-9][0-9]*)(.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let dataSource = this.state.dataSource;
            dataSource.stopPx = value;
            if (index !== -1) {
                if (index <= String(value).length - lengthNum) {
                    let num = parseInt(value / tickSize);
                    num = (num * tickSize).toFixed(lengthNum - 1);
                    dataSource.stopPx = num;
                }
            } else if (this.pressKey === 38 || this.pressKey === 40 || this.pressKey === 'scoll') {
                dataSource.stopPx = (dataSource.stopPx * 1).toFixed(getTickLength(_tickSize));
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
        } else if (this.execInst !== "") {
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
                    addVisible: { addVisibleMarketStop: true },
                    title: $("确认你的委托"),
                    commitData: { ...this.state.dataSource, type: type }
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
                <a onClick={() => this.timeInForceChange("", "标记")}>{$('标记')}</a>
            </Menu.Item>
            <Menu.Item key="ImmediateOrCancel">
                <a onClick={() => this.timeInForceChange("LastPrice", "最新成交")}>{$('最新成交')}</a>
                {/* ImmediateOrCancel */}
            </Menu.Item>
            <Menu.Item key="FillOrKill">
                <a onClick={() => this.timeInForceChange("IndexPrice", "指数")}>{$('指数')}</a>
                {/* FillOrKill */}
            </Menu.Item>
        </Menu>
    }
    clickFunctionQty = (value) => {
        let dataSource = { ...this.state.dataSource };
        dataSource.orderQty = value + dataSource.orderQty * 1;
        if (dataSource.orderQty <= 0) {
            dataSource.orderQty = 0;
        }
        this.setState({
            dataSource
        })
    }
    clickFunctionPrice = (value) => {
        let dataSource = { ...this.state.dataSource };
        dataSource.stopPx = value + (dataSource.stopPx * 1);
        if (dataSource.stopPx <= 0) {
            dataSource.stopPx = 0;
        }
        this.setState({
            dataSource
        })
    }
    changeSetting = () => {
        let showMoreSetting = this.state.showMoreSetting;
        this.setState({
            showMoreSetting: !showMoreSetting
        })
    }
    render() {
        const { tickSize, showPlusMult, symbolCurrent } = this.props;
        let _tickSize = tickSize || 0.5;
        const flag = !this.state.dataSource.orderQty || !this.state.dataSource.stopPx || this.state.dataSource.orderQty == "0";
        return (
            <div className="orderLimitPrice">
                <div className="inputNAndP">
                    <Row className="marginB10">
                        <Col className='price_label' span={8}>
                            <span className="firstSpan">{$('仓位')}</span>
                        </Col>
                        <Col span={16} className="priceInput">
                            {/* <Input disabled addonBefore="USD" style={{ width: '25%' }} />
                                <InputNumber
                                    style={{ textAlign: "right", width: "75%" }}
                                    value={this.state.dataSource.orderQty}
                                    min={0}
                                    formatter={(value) => {
                                        const reg = /^[0-9]*[1-9][0-9]*$/;
                                        if (((!isNaN(value) && reg.test(value)) || value === '')) {
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
                                /> */}
                            <input
                                className='input_qty'
                                type='number'
                                max="100000000"
                                min="0"
                                value={this.state.dataSource.orderQty}
                                step={1}
                                onKeyPress={(e) => this.onlyNumber(e, "qty")}
                                onChange={this.priceInput}
                            />
                            <span className='input_qty_text'>USD</span>
                        </Col>
                    </Row>
                    {showPlusMult ?
                        <Row className="marginB10">
                            <PlusMult
                                clickFunction={this.clickFunctionQty}
                                plusLeftF={-100}
                                plusLeftS={-10}
                                multRightF={10}
                                multRightS={100} />
                        </Row> : ""}
                    <Row className="marginB10">
                        <Col className='price_label' span={8}>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('当前价格达到触发价格时，您的止损委托将被激活。例如：') + '<br/>' + $('卖空止损：当前价格<=触发价格') + '<br/>' + $('买多止损：当前价格>=触发价格'))}>
                                <span className="firstSpan">{$('触发价格')}</span>
                            </Tooltip>
                        </Col>
                        <Col span={16} className="priceInput">
                            {/* <Input disabled addonBefore="USD" style={{ width: '25%' }} />
                                <InputNumber
                                    style={{ textAlign: "right", width: "75%" }}
                                    min={0}
                                    value={this.state.dataSource.stopPx}
                                    formatter={(value) => {
                                        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
                                        if (((!isNaN(value) && reg.test(value)) || value === '')) {
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
                                    step={tickSize} onChange={this.onChange} /> */}
                            <input
                                className='input_qty'
                                type='number'
                                max="100000000"
                                min="0"
                                value={this.state.dataSource.stopPx}
                                step={_tickSize}
                                onKeyPress={this.onlyNumber}
                                onWheel={(e) => {
                                    this.pressKey = 'scoll'
                                }}
                                onKeyDown={(e) => this.pressKey = e.keyCode}
                                onChange={this.onChange}
                            />
                            <span className='input_qty_text'>USD</span>
                        </Col>
                    </Row>
                    {showPlusMult ?
                        <Row className="marginB10">
                            <PlusMult
                                clickFunction={this.clickFunctionPrice}
                                plusLeftF={-12.5}
                                plusLeftS={-0.5}
                                multRightF={+0.5}
                                multRightS={+12.5} />
                        </Row> : ""}
                </div>
                <Row className="marginB10" style={{ fontSize: 12 }}>
                    <a style={{ float: 'right' }} onClick={this.changeSetting} className="ant-dropdown-link" href="#">
                        {this.state.showMoreSetting ? $('隐藏设置') : $('高级设置')}
                    </a>
                </Row>
                {this.state.showMoreSetting ?
                    <div className="checkBoxData">
                        <Row className='rowFlex' style={{ marginBottom: 5 }}>
                            <Col className='rowItemFirst'>
                                <Tooltip mouseLeaveDelay={0} placement="right"
                                    title={tooltipShow(() => {
                                        return <div style={{ fontSize: "12px" }}>
                                            <div>{$('请选择使用哪个价格触发止损：')}</div>
                                            <div>{$('最新价格：365MEX的最新成交价格')}</div>
                                            <div>{$('指数价格：参考交易所的最新价格')}</div>
                                            <div>{$('标记价格：365MEX的标记价格（指数价格+基差）')}</div>
                                        </div>;
                                    }, false)}>
                                    <span style={{ cursor: 'help', marginRight: 10 }} className="marketStop">{$('触发类型')}</span>
                                </Tooltip>
                                <Tooltip mouseLeaveDelay={0} placement="right"
                                    title={tooltipShow(() => {
                                        return <div style={{ fontSize: "12px" }}>
                                            <div>{$('请选择使用哪个价格触发止损：')}</div>
                                            <div>{$('最新价格：365MEX的最新成交价格')}</div>
                                            <div>{$('指数价格：参考交易所的最新价格')}</div>
                                            <div>{$('标记价格：365MEX的标记价格（指数价格+基差）')}</div>
                                        </div>;
                                    }, false)}>
                                    <Dropdown overlay={this.menu()} trigger={['click']}>
                                        <a className="ant-dropdown-link" href="#">
                                            {$(this.state.timeInForce)}<Icon type="caret-down" />
                                        </a>
                                    </Dropdown>
                                </Tooltip>
                            </Col>
                            <Col className='rowItemSecond'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(translationParameters([symbolCurrent], $('触发后平仓提示信息')) + '<br/><br/>' + $('使用它以你的平仓委托只会减少你的仓位。'))}>
                                    {/* <Checkbox className='item_text_check'
                                onChange={(e) => this.onChangeCheckBox(e, "closeFlag")}><span style={{cursor:'help'}} className={this.state.closeFlag?"marketStop":''}>{$('触发后平仓')}</span></Checkbox> */}
                                    <label style={{ cursor: "help" }} className={this.state.closeFlag ? "marketStop" : ''} htmlFor={"closeFlag"}>{$('触发后平仓')}</label>
                                    <input className='checkbox_class' id={"closeFlag"} onChange={(e) => this.onChangeCheckBox(e, "closeFlag")} type="checkbox"></input>
                                </Tooltip>
                            </Col>
                        </Row>
                        {/* <Row>
                    <Col span={17}>
                        <Tooltip mouseLeaveDelay={0} placement="right"
                            title={tooltipShow(() => {
                                return <div style={{ fontSize: "12px" }}>
                                    <div>{$('请选择使用哪个价格触发止损：')}</div>
                                    <div>{$('最新价格：365MEX的最新成交价格')}</div>
                                    <div>{$('指数价格：参考交易所的最新价格')}</div>
                                    <div>{$('标记价格：365MEX的标记价格（指数价格+基差）')}</div>
                                </div>;
                            }, false)}>
                            <Dropdown overlay={this.menu()} trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    {$(this.state.timeInForce)}<Icon type="caret-down" />
                                </a>
                            </Dropdown>
                        </Tooltip>
                    </Col>
                </Row> */}
                    </div>
                    : ''}
                <ButtonPriceLimit
                    textBuy="设置买入止损"
                    textSell="设置卖出止损"
                    orderQty={this.state.dataSource.orderQty || 0} stopPx={this.state.dataSource.stopPx || 0}
                    flag={flag}
                    touchType={this.state.timeInForce}
                    orderType="marketStopLose"
                    height="70px"
                    marketStop="market"
                    stopBuyFlag={false}
                    stopSellFlag={true}
                    orderButtonClick={this.orderButtonClick} />

                <AddModal closeFlag={this.state.closeFlag} timeInForce={this.state.timeInForce} ordTypeTitle="市价止损" ordTypeTitleFlag="addVisibleMarketStop" checkFlagChange={this.checkFlagChange} orderCommit={this.orderCommit} />
            </div >
        )
    }
}
export default connect(({ loading, instrument, orderCommit, login }) => {
    const { tickSize, lastPrice, symbolCurrent } = instrument;
    const { sendPrice, sendVolum, showChangeSendValue } = orderCommit;
    const { showPlusMult } = login;
    return {
        loading: !!loading.effects["orderCommit/orderCommit"],
        tickSize,
        sendPrice,
        sendVolum,
        lastPrice,
        showPlusMult,
        showChangeSendValue,
        symbolCurrent
    }
})(
    MarketStopLose
)
