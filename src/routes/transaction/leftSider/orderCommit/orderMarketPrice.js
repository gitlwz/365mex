/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import { connect } from 'dva';
import ButtonPrice from './buttonPrice.js';
import { Input, Row, Col, Button, InputNumber, language, Tooltip } from 'quant-ui';
import { tooltipShow } from '@/utils/utils';
import AddModal from "./addModal.js";
import MarketOrderValue from "./marketOrderValue.js";
import PlusMult from "./plusMult";
const InputGroup = Input.Group;
let { getLanguageData } = language;
let $ = getLanguageData;
export class OrderLimitPrice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                ordType: "Market",
                orderQty: "1"
            },
        }
        this.checkFlag = true;
        this.type = "Buy";
    }
    shouldComponentUpdate = (nextProps, nextState) => {//s
        if (this.state.dataSource.ordType !== nextState.dataSource.ordType) {
            return true;
        }
        if (this.state.dataSource.orderQty !== nextState.dataSource.orderQty) {
            return true;
        }
        if (nextProps.showChangeSendValue !== this.props.showChangeSendValue) {
            return true;
        }
        if (this.props.showPlusMult !== nextProps.showPlusMult) {
            return true;
        }
        if (this.props.showMarket !== nextProps.showMarket) {
            return true;
        }
        return false;
    }
    componentWillReceiveProps = (props) => {
        if (props.showChangeSendValue !== this.props.showChangeSendValue) {
            let dataSource = { ...this.state.dataSource };
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
            let dataSource = { ...this.state.dataSource };
            dataSource.orderQty = value;
            this.setState({
                dataSource
            })
        } else if ((value && value.toString().length === 1) || value == "0") {
            let dataSource = { ...this.state.dataSource };
            dataSource.orderQty = "";
            this.setState({
                dataSource
            })
        }
    }
    orderCommit = () => {
        const { dispatch } = this.props;
        let obj = { side: this.type };
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
    orderButtonClick = (type) => {
        const { dispatch } = this.props;
        this.type = type;
        if (this.checkFlag) {
            dispatch({
                type: "orderCommit/save",
                payload: {
                    addVisible: { addVisibleMarket: true },
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
    clickFunctionQty = (value) => {
        let dataSource = { ...this.state.dataSource };
        dataSource.orderQty = value * 1 + dataSource.orderQty * 1;
        if (dataSource.orderQty <= 0) {
            dataSource.orderQty = 0;
        }
        this.setState({
            dataSource
        })
    }
    onlyNumber = (e) => {
        if (e.charCode === 45 || e.charCode === 46) {
            e.preventDefault();
            return false;
        }
    }
    render() {
        const { showPlusMult } = this.props;
        const flag = !this.state.dataSource.orderQty || this.state.dataSource.orderQty == "0" || this.state.dataSource.orderQty > 10000000;
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
                                    min={0}
                                    value={this.state.dataSource.orderQty}
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
                                max="10000000"
                                min="0"
                                value={this.state.dataSource.orderQty}
                                step={1}
                                onKeyPress={this.onlyNumber}
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
                </div>
                <div className="buttonMid">
                    <Row>
                        <Col span={12} >
                            <Button disabled={flag}
                                // loading={loading} 
                                className="green" onClick={(e) => this.orderButtonClick("Buy")} block>
                                <span>
                                    {$('市价买入')}
                                </span>
                                <ButtonPrice flag="askPrice" orderQty={this.state.dataSource.orderQty} />
                            </Button>
                            <div style={{ width: "100%" }} className="fillPcnt"></div>
                        </Col>
                        <Col span={11} offset={1}>
                            <Button disabled={flag}
                                // loading={loading} 
                                className="red" onClick={(e) => this.orderButtonClick("Sell")} block>
                                <span>
                                    {$('市价卖出')}
                                </span>
                                <ButtonPrice flag="bidPrice" orderQty={this.state.dataSource.orderQty} />
                            </Button>
                            <div style={{ width: "100%" }} className="fillPcnt"></div>
                        </Col>
                    </Row>
                </div>
                <MarketOrderValue showMarket={this.props.showMarket} orderQty={this.state.dataSource.orderQty} />
                <AddModal ordTypeTitle="市价" ordTypeTitleFlag="addVisibleMarket" checkFlagChange={this.checkFlagChange} orderCommit={this.orderCommit} />
            </div >
        )
    }
}
export default connect(({ orderCommit, loading, login }) => {
    const { sendVolum, showChangeSendValue } = orderCommit;
    const { showPlusMult } = login;
    return {
        loading: !!loading.effects["orderCommit/orderCommit"],
        sendVolum,
        showPlusMult,
        showChangeSendValue
    }
})(
    OrderLimitPrice
)
