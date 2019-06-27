/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react'
import { connect } from 'dva';
import { Icon, Input, Row, Col, InputNumber, language, Checkbox, Tooltip, Dropdown, Menu } from 'quant-ui';
import { tooltipShow, getTickLength } from '@/utils/utils';
import AddModal from "./addModal.js"
import ButtonPriceLimit from "./buttonPriceLimit";
import PlusMult from "./plusMult";
let { getLanguageData } = language;
let $ = getLanguageData;
const InputGroup = Input.Group;
const lengthNum = 2;//对应长度
export class OrderLimitPrice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                ordType: "Limit",
                orderQty: 1,
                price: ''
            },
            timeInForce: "GoodTillCancel",//该委托生效时间
            displayQty: 0,//隐藏单显示数量
            displayQtyFlag: false,//隐藏单显示标记
            ParticipateDoNotInitiate: false,//被动委托
            ReduceOnly: false,//只减仓
            showMoreSetting: false,//高级设置显示隐藏
        }
        this.checkFlag = true;
        this.changeFlag = true;
        this.type = "Buy";
        this.pressKey = "";
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.state.dataSource.ordType !== nextState.dataSource.ordType) {
            return true;
        }
        if (this.state.dataSource.orderQty !== nextState.dataSource.orderQty) {
            return true;
        }
        if (this.state.dataSource.price !== nextState.dataSource.price) {
            return true;
        }
        if (this.state.timeInForce !== nextState.timeInForce) {
            return true;
        }
        if (this.state.displayQty !== nextState.displayQty) {
            return true;
        }
        if (this.state.displayQtyFlag !== nextState.displayQtyFlag) {
            return true;
        }
        if (this.state.showMoreSetting !== nextState.showMoreSetting) {
            return true;
        }
        if (this.state.ParticipateDoNotInitiate !== nextState.ParticipateDoNotInitiate) {
            return true;
        }
        if (this.state.ReduceOnly !== nextState.ReduceOnly) {
            return true;
        }
        if (this.props.tickSize !== nextProps.tickSize) {
            return true;
        }
        if (this.props.showPlusMult !== nextProps.showPlusMult) {
            return true;
        }
        if (this.props.showChangeSendValue !== nextProps.showChangeSendValue) {
            return true;
        }
        if (this.props.lastPrice !== nextProps.lastPrice) {
            return true;
        }
        return false;
    }
    componentWillMount = () => {
        const { tickSize } = this.props;
        let props = this.props;
        let _tickSize = tickSize || 0.5;
        if (props.lastPrice && this.changeFlag) {
            let dataSource = { ...this.state.dataSource };
            dataSource.price = (props.lastPrice * 1).toFixed(getTickLength(_tickSize));
            this.setState({
                dataSource
            })
            this.changeFlag = false;
        }
        if (props.showChangeSendValue !== this.props.showChangeSendValue) {
            let dataSource = { ...this.state.dataSource };
            if (props.sendPrice) {
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
    componentWillReceiveProps = (props) => {
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        if (props.lastPrice && this.changeFlag) {
            let dataSource = { ...this.state.dataSource };
            dataSource.price = (props.lastPrice * 1).toFixed(getTickLength(_tickSize));
            this.setState({
                dataSource
            })
            this.changeFlag = false;
        }
        if (props.showChangeSendValue !== this.props.showChangeSendValue) {
            let dataSource = { ...this.state.dataSource };
            if (props.sendPrice) {
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
            let dataSource = { ...this.state.dataSource };
            dataSource.orderQty = value;
            this.setState({
                dataSource
            })
        } else if ((value && value.toString().length === 1) || value == "0") {
            let dataSource = { ...this.state.dataSource };
            dataSource.orderQty = 0;
            this.setState({
                dataSource
            })
        }
    }
    priceInputHide = (e) => {
        let value = e.target.value
        const reg = /^[0-9]*[1-9][0-9]*$/;
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
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const reg = /^(0|[1-9][0-9]*)(.[0-9]+)?$/;
        let value = e.target.value;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let dataSource = { ...this.state.dataSource };
            dataSource.price = value;
            if (index !== -1) {
                if (index <= String(value).length - lengthNum) {
                    let num = parseInt(value / _tickSize);
                    num = (num * _tickSize).toFixed(lengthNum - 1);
                    dataSource.price = num;
                }
            } else if (this.pressKey === 38 || this.pressKey === 40 || this.pressKey === 'scoll') {
                dataSource.price = (dataSource.price * 1).toFixed(getTickLength(_tickSize));
            }
            this.setState({
                dataSource
            })
        }
    }
    orderCommit = () => {
        const { dispatch } = this.props;
        let obj = { side: this.type };
        if (!this.state.ParticipateDoNotInitiate && this.state.timeInForce !== "GoodTillCancel") {
            obj.timeInForce = this.state.timeInForce;
        }
        if (this.state.ParticipateDoNotInitiate && this.state.ReduceOnly) {
            obj.execInst = "ParticipateDoNotInitiate,ReduceOnly";
        } else if (this.state.ParticipateDoNotInitiate) {
            obj.execInst = "ParticipateDoNotInitiate";
        } else if (this.state.ReduceOnly) {
            obj.execInst = "ReduceOnly";
        }
        if (this.state.displayQtyFlag) {
            obj.displayQty = this.state.displayQty;
        }
        if (this.type === "Buy") {
            obj.side = "Buy";
            dispatch({
                type: "orderCommit/orderCommit",
                payload: { ...this.state.dataSource, ...obj }
            })
        } else {
            obj.side = "Sell";
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
                    addVisible: { addVisibleLimit: true },
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
    timeInForceChange = (value) => {
        this.setState({
            timeInForce: value
        })
    }
    menu = () => {
        return <Menu style={{ padding: 0 }}>
            <Menu.Item disabled className="titleMenu" key="title">
                <span>{$('生效时间')}</span>
            </Menu.Item>
            <Menu.Item key="GoodTillCancel">
                <a onClick={() => this.timeInForceChange("GoodTillCancel")}>{$('一直有效直至取消')}</a>
            </Menu.Item>
            <Menu.Item key="ImmediateOrCancel">
                <a onClick={() => this.timeInForceChange("ImmediateOrCancel")}>{$('立刻成交或取消')}</a>
                {/* ImmediateOrCancel */}
            </Menu.Item>
            <Menu.Item key="FillOrKill">
                <a onClick={() => this.timeInForceChange("FillOrKill")}>{$('全部成交或取消')}</a>
                {/* FillOrKill */}
            </Menu.Item>
        </Menu>
    }
    sliderOnchange = (e) => {
        let dataSource = { ...this.state.dataSource };
        dataSource.price = e.target.value;
        this.setState({
            dataSource
        })
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
    changeSetting = () => {
        let showMoreSetting = this.state.showMoreSetting;
        this.setState({
            showMoreSetting: !showMoreSetting
        })
    }
    render() {
        const { showPlusMult, tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const flag = !this.state.dataSource.orderQty || !this.state.dataSource.price || this.state.dataSource.orderQty == "0";
        return (
            <div className="orderLimitPrice">
                <div className="inputNAndP">
                    <Row className="marginB10">
                        <span className='price_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('这是你希望买入或卖出的合约数量，下见合约详情。参阅“委托价值”了解此数量合约的总价值。'))}>
                                <span className="firstSpan">{$('仓位')}</span>
                            </Tooltip>
                        </span>
                        <span className="priceInput">
                            {/* <InputNumber
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
                                onInput={this.priceInput}
                            />
                            <span className='input_qty_text'>USD</span>
                        </span>
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
                        <span className='price_label'>
                            <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("你希望买入或卖出的价格。"))}>
                                <span className="firstSpan">{$('限价')}</span>
                            </Tooltip>
                        </span>
                        <span className="priceInput">
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
                                    step={tickSize} onChange={this.onChange} /> */}
                            <input
                                className='input_qty'
                                type='number'
                                max="100000000"
                                min="0"
                                value={this.state.dataSource.price}
                                step={_tickSize}
                                onKeyPress={this.onlyNumber}
                                onWheel={(e) => {
                                    this.pressKey = 'scoll'
                                }}
                                onKeyDown={(e) => this.pressKey = e.keyCode}
                                // onKeyUp={(e) => this.onlyNumber(e)}
                                onInput={this.onChange}
                            />
                            <span className='input_qty_text'>USD</span>
                        </span>
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
                        <Row className='rowFlex' style={{ marginBottom: 10 }}>
                            <Col className='rowItemFirst'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("被动委托不会立即在市场成交。使用该类型来确保获得做市返佣。如果委托会立刻与已有委托成交，那么该委托将被取消。"))}>
                                    <input disabled={this.state.displayQtyFlag || this.state.timeInForce !== "GoodTillCancel"} className='checkbox_class' id={"ParticipateDoNotInitiate"} onChange={(e) => this.onChangeCheckBox(e, "ParticipateDoNotInitiate")} type="checkbox"></input>
                                    <label style={{ cursor: "help" }} className={this.state.ParticipateDoNotInitiate ? "marketStop" : ''} htmlFor={"ParticipateDoNotInitiate"}>{$('被动委托')}</label>
                                    {/* <Checkbox disabled={this.state.displayQtyFlag || this.state.timeInForce !== "GoodTillCancel"} className='item_text_check'
                                onChange={(e) => this.onChangeCheckBox(e, "ParticipateDoNotInitiate")} ><span style={{ cursor: "help" }} className={this.state.ParticipateDoNotInitiate ? "marketStop" : ''}>{$('被动委托')}</span></Checkbox> */}
                                </Tooltip>
                            </Col>
                            <Col className='rowItemSecond'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('隐藏委托不会在市场委托列表上显示。'))}>
                                    <label style={{ cursor: "help" }} className={this.state.displayQtyFlag ? "marketStop" : ''} htmlFor={"displayQtyFlag"}>{$('隐藏')}</label>
                                    <input disabled={this.state.ParticipateDoNotInitiate} className='checkbox_class' id={"displayQtyFlag"} onChange={(e) => this.onChangeCheckBox(e, "displayQtyFlag")} type="checkbox"></input>

                                    {/* <Checkbox disabled={this.state.ParticipateDoNotInitiate} className='item_text_check'
                                onChange={(e) => this.onChangeCheckBox(e, "displayQtyFlag")}>
                                <span style={{ cursor: "help" }} className={this.state.displayQtyFlag ? "marketStop" : ''}>{$('隐藏')}</span>
                            </Checkbox> */}
                                </Tooltip>
                            </Col>
                        </Row>
                        {this.state.displayQtyFlag ?
                            <Row className="marginB10">
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('设此值为0 以建立隐藏委托，或者设任何少于总委托数量的数值建立冰山委托。'))}>
                                    <Col span={8} style={{ textAlign: "left" }}>
                                        <span style={{ cursor: "help" }}>
                                            {$('显示数量')}&nbsp;&nbsp;<Icon style={{ position: "absolute" }} type="question-circle" theme="filled" />
                                        </span>
                                    </Col>
                                </Tooltip>
                                <Col span={16}>
                                    <input
                                        className='input_qty'
                                        type='number'
                                        onKeyPress={(e) => this.onlyNumber(e, "qty")}
                                        max={this.state.dataSource.orderQty || 0}
                                        min="0"
                                        defaultValue={0}
                                        value={this.state.displayQty}
                                        step={1}
                                        onChange={this.priceInputHide}
                                    />
                                    <span className='input_qty_text'>USD</span>
                                </Col>
                            </Row>
                            : ""}
                        <Row className='rowFlex'>
                            <Col className='rowItemFirst'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(
                                    $("该委托的生效时间。默认值是一直有效直至取消。如果你的委托被设置为立刻成交或取消，任何未被成交的部分将立即取消。如果你的委托被设置为完全成交或取消，该委托只会立刻全部成交，否则将会被取消。"))}>
                                    <Dropdown disabled={this.state.ParticipateDoNotInitiate} overlay={this.menu()} trigger={['click']}>
                                        <a className="ant-dropdown-link" href="#">
                                            {$(this.state.timeInForce)}<Icon type="caret-down" />
                                        </a>
                                    </Dropdown>
                                </Tooltip>
                            </Col>
                            <Col className='rowItemSecond'>
                                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($("只减仓委托只会减少而不会增加你的仓位。系统有可能自动减少这类委托的数量，甚至自动取消它，来确保它不会增加你的仓位。"))}>
                                    <label style={{ cursor: "help" }} className={this.state.ReduceOnly ? "marketStop" : ''} htmlFor={"ReduceOnly"}>{$('只减仓')}</label>
                                    <input className='checkbox_class' id="ReduceOnly" onChange={(e) => this.onChangeCheckBox(e, "ReduceOnly")} type="checkbox"></input>
                                    {/* <Checkbox className='item_text_check'
                                checked={this.state.ReduceOnly}
                                    // onChange={(e) => this.onChangeCheckBox(e, "ReduceOnly")}
                                    >
                                </Checkbox> */}
                                </Tooltip>
                            </Col>
                        </Row>
                    </div>
                    : ''}
                <ButtonPriceLimit
                    textBuy="买入/做多"
                    textSell="卖出/做空"
                    displayQty={this.state.displayQty}
                    displayQtyFlag={this.state.displayQtyFlag}
                    orderQty={this.state.dataSource.orderQty || 0} price={this.state.dataSource.price || ""}
                    flag={flag}
                    orderType="orderLimitPrice"
                    stopBuyFlag={false}
                    stopSellFlag={false}
                    orderButtonClick={this.orderButtonClick} />
                <AddModal ordTypeTitle="限价" ordTypeTitleFlag="addVisibleLimit" checkFlagChange={this.checkFlagChange} orderCommit={this.orderCommit} />
            </div >
        )
    }
}
export default connect(({ loading, instrument, orderCommit, login }) => {
    const { tickSize, lastPrice } = instrument;
    const { showPlusMult } = login;
    const { sendPrice, sendVolum, showChangeSendValue } = orderCommit;
    return {
        loading: !!loading.effects["orderCommit/orderCommit"],
        tickSize,
        lastPrice,
        sendPrice,
        sendVolum,
        showChangeSendValue,
        showPlusMult,
    }
})(
    OrderLimitPrice
)
