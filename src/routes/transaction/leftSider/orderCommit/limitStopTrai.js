import React, { Component } from 'react'
import { connect } from 'dva';
import { Icon, Input, Row, Col, Radio, language, InputNumber, Utils, Ellipsis, Checkbox, Tooltip, Dropdown, Menu } from 'quant-ui';
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
export class LimitStopLoss extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                ordType: "LimitIfTouched",
                orderQty: 1,
            },
            touchType: "最新成交",
            timeInForce: "GoodTillCancel",//该委托生效时间
            displayQty: 0,//隐藏单显示数量
            displayQtyFlag: false,//隐藏单显示数量
            ParticipateDoNotInitiate: false,//被动委托
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
        const { instrumentData } = this.props;
        let dataSource = this.state.dataSource;
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        dataSource.price = (instrumentData.lastPrice * 1 || 0).toFixed(getTickLength(_tickSize));
        try {
            dataSource.stopPx = ((instrumentData.bidPrice * 1 - _tickSize) || 0).toFixed(getTickLength(_tickSize));
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
                dataSource.price = (props.sendPrice * 1).toFixed(getTickLength(_tickSize));
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
        const reg = /^[0-9]*[1-9][0-9]*$/;
        let value = e.target.value;
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
    onChange = (e, key) => {
        let value = e.target.value;
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const reg = /^(0|[1-9][0-9]*)(.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let dataSource = this.state.dataSource;
            dataSource[key] = value;
            if (index !== -1) {
                if (index <= String(value).length - lengthNum) {
                    let num = parseInt(value / tickSize);
                    num = (num * tickSize).toFixed(lengthNum - 1);
                    dataSource[key] = num;
                }
            } else if (this.pressKey === 38 || this.pressKey === 40 || this.pressKey === 'scoll') {
                dataSource[key] = (dataSource[key] * 1).toFixed(getTickLength(_tickSize));
            }
            this.setState({
                dataSource
            })
        }
    }
    orderCommit = () => {
        const { dispatch } = this.props;
        let obj = { side: this.type };
        let arr = [];
        if (this.state.closeFlag) {
            arr.push("Close")
        }
        if (this.state.ParticipateDoNotInitiate) {
            arr.push("ParticipateDoNotInitiate")
        } else if (this.state.timeInForce !== "GoodTillCancel") {
            obj.timeInForce = this.state.timeInForce;
        }
        if (this.execInst !== "") {
            arr.push(this.execInst);
        }
        if (arr.length > 0) {
            let str = "";
            for (let i = 0; i < arr.length; i++) {
                if (i === arr.length - 1) {
                    str += arr[i];
                } else {
                    str += arr[i] + ",";
                }
            }
            obj.execInst = str;
        }
        if (this.state.displayQtyFlag) {
            obj.displayQty = this.state.displayQty;
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
                    addVisible: { addVisibleLimitTrai: true },
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
    touchTypeChange = (value, title) => {
        this.execInst = value;
        this.setState({
            touchType: title
        })
    }
    timeInForceChange = (value) => {
        this.setState({
            timeInForce: value
        })
    }
    priceInputHide = (e) => {
        const reg = /^[0-9]*[1-9][0-9]*$/;
        let value = e.target.value;
        let displayQty = this.state.displayQty;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            if (value * 1 >= this.state.dataSource.orderQty * 1) {
                displayQty = this.state.dataSource.orderQty;
            } else {
                displayQty = value;
            }
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
    touchMenu = () => {
        return <Menu>
            <Menu.Item key="mask">
                <a onClick={() => this.touchTypeChange("", "标记")}>{$('标记')}</a>
            </Menu.Item>
            <Menu.Item key="LastPrice">
                <a onClick={() => this.touchTypeChange("LastPrice", "最新成交")}>{$('最新成交')}</a>
                {/* ImmediateOrCancel */}
            </Menu.Item>
            <Menu.Item key="IndexPrice">
                <a onClick={() => this.touchTypeChange("IndexPrice", "指数")}>{$('指数')}</a>
                {/* FillOrKill */}
            </Menu.Item>
        </Menu>
    }
    menu = () => {
        return <Menu style={{ textAlign: 'center' }}>
            <Menu.Item key="GoodTillCancel">
                <a onClick={() => this.timeInForceChange("GoodTillCancel")}>{$('一直有效直至取消')}</a>
            </Menu.Item>
            <Menu.Item key="ImmediateOrCancel">
                <a onClick={() => this.timeInForceChange("ImmediateOrCancel")}>{$('立即成交或取消')}</a>
                {/* ImmediateOrCancel */}
            </Menu.Item>
            <Menu.Item key="FillOrKill">
                <a onClick={() => this.timeInForceChange("FillOrKill")}>{$('全部成交或取消')}</a>
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
        dataSource.price = value + (dataSource.price * 1);
        if (dataSource.price <= 0) {
            dataSource.price = 0;
        }
        this.setState({
            dataSource
        })
    }
    clickFunctionStop = (value) => {
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
        const { loading, tickSize, showPlusMult, symbolCurrent } = this.props;
        let _tickSize = tickSize || 0.5;
        const flag = !this.state.dataSource.orderQty || !this.state.dataSource.price || this.state.dataSource.orderQty == "0";
        return (
            <div className="orderLimitPrice">
                <div className="inputNAndP">
                    <Row className="marginB10">
                        <Col className='price_label' span={8}>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('这是你希望买入或卖出的合约数量，下见合约详情。参阅“委托价值”了解此数量合约的总价值。'))}>
                                <span className="firstSpan">{$('仓位')}</span>
                            </Tooltip>
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
                                onKeyPress={(e) => this.onlyNumber(e, "qty")}
                                value={this.state.dataSource.orderQty}
                                step={1}
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
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("你希望买入或卖出的价格。"))}>
                                <span className="firstSpan">{$('限价')}</span>
                            </Tooltip>
                        </Col>
                        <Col span={16} className="priceInput">
                            {/* <Input disabled addonBefore="USD" style={{ width: '25%' }} />
                                <InputNumber
                                    style={{ textAlign: "right", width: "75%" }}
                                    min={0}
                                    value={this.state.dataSource.price}
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
                                    step={tickSize} onChange={(e) => this.onChange(e, "price")} /> */}
                            <input
                                className='input_qty'
                                type='number'
                                max="100000000"
                                min="0"
                                value={this.state.dataSource.price}
                                step={_tickSize}
                                onWheel={(e) => {
                                    this.pressKey = 'scoll'
                                }}
                                onKeyPress={this.onlyNumber}
                                onKeyDown={(e) => this.pressKey = e.keyCode}
                                onChange={(e) => this.onChange(e, "price")}
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
                    <Row className="marginB10">
                        <Col className='price_label' span={8}>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('止盈委托的触发类似于止损, 但是是相反的。例如: ') + '<br/>' + $('卖空止盈: 当前价格>=触发价格') + '<br/>' + $('买多止盈：当前价格<=触发价格'))}>
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
                                    step={tickSize} onChange={(e) => this.onChange(e, "stopPx")} /> */}
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
                                onChange={(e) => this.onChange(e, "stopPx")}
                            />
                            <span className='input_qty_text'>USD</span>
                        </Col>
                    </Row>
                    {showPlusMult ?
                        <Row className="marginB10">
                            <PlusMult
                                clickFunction={this.clickFunctionStop}
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
                                    <Dropdown overlay={this.touchMenu()} trigger={['click']}>
                                        <a className="ant-dropdown-link" href="#">
                                            {$(this.state.touchType)}<Icon type="caret-down" />
                                        </a>
                                    </Dropdown>
                                </Tooltip>
                            </Col>
                            <Col className='rowItemSecond'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(translationParameters([symbolCurrent], $('触发后平仓提示信息')) + '<br/><br/>' + $('使用它以你的平仓委托只会减少你的仓位。'))}>
                                    {/* <Checkbox className='item_text_check'
                                onChange={(e) => this.onChangeCheckBox(e, "closeFlag")}><span style={{ cursor: 'help' }} className={this.state.closeFlag ? "marketStop" : ''}>{$('触发后平仓')}</span></Checkbox> */}
                                    <label style={{ cursor: "help" }} className={this.state.closeFlag ? "marketStop" : ''} htmlFor={"closeFlag"}>{$('触发后平仓')}</label>
                                    <input className='checkbox_class' id={"closeFlag"} onChange={(e) => this.onChangeCheckBox(e, "closeFlag")} type="checkbox"></input>
                                </Tooltip>
                            </Col>
                        </Row>
                        {/* <Row style={{ marginBottom: 5 }}>
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
                            <Dropdown overlay={this.touchMenu()} trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    {$(this.state.touchType)}<Icon type="caret-down" />
                                </a>
                            </Dropdown>
                        </Tooltip>
                    </Col>
                </Row> */}
                        <Row className='rowFlex' style={{ marginBottom: 5 }}>
                            <Col className='rowItemFirst'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("被动委托不会立即在市场成交。使用该类型来确保获得做市返佣。如果委托会立刻与已有委托成交，那么该委托将被取消。"))}>
                                    {/* <Checkbox disabled={this.state.displayQtyFlag} className='item_text_check'
                                onChange={(e) => this.onChangeCheckBox(e, "ParticipateDoNotInitiate")} ><span style={{ cursor: 'help' }}>{$('被动委托')}</span></Checkbox> */}
                                    <input disabled={this.state.displayQtyFlag || this.state.timeInForce !== "GoodTillCancel"} className='checkbox_class' id={"ParticipateDoNotInitiateTrai"} onChange={(e) => this.onChangeCheckBox(e, "ParticipateDoNotInitiate")} type="checkbox"></input>
                                    <label style={{ cursor: "help" }} htmlFor={"ParticipateDoNotInitiateTrai"}>{$('被动委托')}</label>
                                </Tooltip>
                            </Col>
                            <Col className='rowItemSecond'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("隐藏委托不会在市场委托列表上显示。"))}>
                                    {/* <Checkbox disabled={this.state.ParticipateDoNotInitiate} className='item_text_check'
                                onChange={(e) => this.onChangeCheckBox(e, "displayQtyFlag")}><span style={{ cursor: 'help' }}>{$('隐藏')}</span></Checkbox> */}
                                    <label style={{ cursor: "help" }} htmlFor={"displayQtyFlagTrai"}>{$('隐藏')}</label>
                                    <input disabled={this.state.ParticipateDoNotInitiate} className='checkbox_class' id={"displayQtyFlagTrai"} onChange={(e) => this.onChangeCheckBox(e, "displayQtyFlag")} type="checkbox"></input>
                                </Tooltip>
                            </Col>
                        </Row>
                        {this.state.displayQtyFlag ?
                            <Row>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow("设此值为0以建立隐藏委托，或者设任何少于总委托数量的数值建立冰山委托。")}>
                                    <Col span={8} style={{ textAlign: "left" }}>
                                        <span>
                                            <span style={{ cursor: 'help' }}>{$('显示数量')}&nbsp;&nbsp;<Icon type="question-circle" theme="filled" /></span>
                                        </span>
                                    </Col>
                                </Tooltip>
                                <Col span={16}>
                                    <input
                                        className='input_qty'
                                        type='number'
                                        max={this.state.dataSource.orderQty || 0}
                                        min="0"
                                        defaultValue={0}
                                        onKeyPress={(e) => this.onlyNumber(e, "qty")}
                                        value={this.state.displayQty}
                                        step={1}
                                        onChange={this.priceInputHide}
                                    />
                                    <span className='input_qty_text'>USD</span>
                                </Col>
                            </Row>
                            : ""}
                        <Row>
                            <Col span={17}>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(
                                    $("该委托的生效时间。默认值是一直有效直至取消。如果你的委托被设置为立刻成交或取消，任何未被成交的部分将立即取消。如果你的委托被设置为完全成交或取消，该委托只会立刻全部成交，否则将会被取消。"))}>
                                    <Dropdown disabled={this.state.ParticipateDoNotInitiate} overlay={this.menu()} trigger={['click']}>
                                        <a className="ant-dropdown-link" href="#">
                                            {$(this.state.timeInForce)}<Icon type="caret-down" />
                                        </a>
                                    </Dropdown>
                                </Tooltip>
                            </Col>
                        </Row>
                    </div>
                    : ''}
                <ButtonPriceLimit
                    textBuy="止盈买入"
                    textSell="止盈卖出"
                    displayQtyFlag={this.state.displayQtyFlag}
                    displayQty={this.state.displayQty}
                    orderQty={this.state.dataSource.orderQty || 0}
                    price={this.state.dataSource.price || 0}
                    stopPx={this.state.dataSource.stopPx || 0}
                    flag={flag}
                    touchType={this.state.touchType}
                    height="70px"
                    marketStop="limitStopTrai"
                    stopBuyFlag={true}
                    stopSellFlag={true}
                    orderButtonClick={this.orderButtonClick} />
                <AddModal closeFlag={this.state.closeFlag} timeInForce={this.state.touchType} ordTypeTitle="限价止盈" ordTypeTitleFlag="addVisibleLimitTrai" checkFlagChange={this.checkFlagChange} orderCommit={this.orderCommit} />
            </div >
        )
    }
}
export default connect(({ loading, instrument, orderCommit, login }) => {
    const { tickSize, lastPrice, instrumentData, symbolCurrent } = instrument;
    const { sendPrice, sendVolum, showChangeSendValue } = orderCommit;
    const { showPlusMult } = login;
    return {
        loading: !!loading.effects["orderCommit/orderCommit"],
        tickSize,
        instrumentData,
        lastPrice,
        sendVolum,
        sendPrice,
        showPlusMult,
        symbolCurrent,
        showChangeSendValue,
    }
})(
    LimitStopLoss
)
