import React, { Component } from 'react'
import "./index.less";
import { connect } from 'dva';
import { Icon, Input, Row, Col, Radio, Button, InputNumber, Utils } from 'quant-ui';
const RadioGroup = Radio.Group;
const currency = Utils.currency;
const tick = 0.5;//最小变化单位
const lengthNum = 2;//对应长度
export class OrderLimitPrice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                ordType: "Limit",
            }
        }
    }
    positionFlag = (e, type) => {
        let dataSource = this.state.dataSource;
        dataSource[type] = e.target.value;
        this.setState({
            dataSource
        })
    }
    priceInput = (e, type) => {
        const { value } = e.target;
        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            let dataSource = this.state.dataSource;
            dataSource[type] = value;
            this.setState({
                dataSource
            })
        }
    }
    onChange = (value) => {
        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            let index = String(value).indexOf(".");
            let dataSource = this.state.dataSource;
            dataSource.price = value;
            if (index !== -1) {
                if (index <= String(value).length - lengthNum) {
                    let num = parseInt(value / tick);
                    num = (num * tick).toFixed(lengthNum - 1);
                    dataSource.price = num;
                }
            }
            this.setState({
                dataSource
            })
        }
    }
    orderCommit = (type) => {
        const { dispatch } = this.props;
        let obj = { side: type};
        if (type === "Buy") {
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
    render() {
        const { loading } = this.props;
        const flag = !this.state.dataSource.orderQty || !this.state.dataSource.price;
        return (
            <div className="orderLimitPrice">
                <div className="inputNAndP">
                    <Row className="marginB10">
                        <Col span={3}>
                            <span className="firstSpan">数量</span>
                        </Col>
                        <Col span={14} offset={1}>
                            <Input
                                value={this.state.dataSource.orderQty}
                                onChange={(e) => this.priceInput(e, "orderQty")}
                            ></Input>
                        </Col>
                        <Col span={4} offset={1}>
                            <div className="currency" >USD</div>
                        </Col>
                    </Row>
                    <Row className="marginB10">
                        <Col span={3}>
                            <span className="firstSpan">价格</span>
                        </Col>
                        <Col span={14} offset={1} className="priceInput">
                            <InputNumber
                                min={0}
                                formatter={(value) => {
                                    const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
                                    if (((!isNaN(value) && reg.test(value)) || value === '' || value === '-')) {
                                        let index = value.indexOf(".");
                                        if (index !== -1) {
                                            if (index <= value.length - lengthNum) {
                                                let num = parseInt(value / tick);
                                                num = (num * tick).toFixed(lengthNum - 1);
                                                return num;
                                            }
                                        }
                                        return value;
                                    } else {
                                        return value ? value.substring(0, value.length - 1) : value;
                                    }
                                }}
                                step={tick} onChange={this.onChange} />
                            {/* <Input
                                value={this.state.dataSource.price}
                                onChange={(e) => this.priceInput(e, "price")}
                            ></Input> */}
                        </Col>
                        <Col span={4} offset={1}>
                            <div className="currency" >USD</div>
                        </Col>
                    </Row>
                </div>
                <div className="buttonMid">
                    <Row>
                        <Col span={11}>
                            <Button disabled={flag} loading={loading} className="green" onClick={(e) => this.orderCommit("Buy")} block>买入/做多</Button>
                        </Col>
                        <Col span={11} offset={1}>
                            <Button disabled={flag} loading={loading} className="red" onClick={(e) => this.orderCommit("Sell")} block>卖出/做空</Button>
                        </Col>
                    </Row>
                </div>
                <div className="totalData">
                    <Row className="totalDataRow">
                        <Col span={12}>
                            <span className="specialSpan">成本：</span>
                            <span>0.0000 XBT</span>
                        </Col>
                        <Col span={12}>
                            <span className="specialSpan">总额：</span>
                            <span>0.0000 XBT</span>
                        </Col>
                    </Row>
                    <Row className="totalDataRowSecond">
                        <Col span={12}>
                            <span>可用余额：</span>
                            <span>0.0000 XBT</span>
                        </Col>
                    </Row>
                </div>
                <div className="riskLimit">
                    <Row>
                        <Col span={6}>
                            <span>风险限额</span>
                        </Col>
                        <Col span={12} offset={5} className="riskLimitRow">
                            <span className="riskLimitSpan">0.0000/50XBT</span>
                            <Icon style={{ cursor: "pointer" }} type="form" theme="outlined" />
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}
export default connect(({ loading }) => {
    return {
        loading: !!loading.effects["orderCommit/orderCommit"]
    }
})(
    OrderLimitPrice
)
