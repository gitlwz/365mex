import React, { Component } from 'react'
import { connect } from 'dva';
import { Select, Card, Row, Col, Divider, Utils, Tooltip, Button, language } from 'quant-ui';
import TotalRight from "./totalRight";
import TradeHis from "./tradeHis";
import { getCurrencyType, tooltipShow } from '@/utils/utils';
import { routerRedux } from 'dva/router';
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
const Option = Select.Option;

class Index extends Component {
    constructor(props){
        super(props);
        this.currentPage = 0
    }
    redirection = (inOutType) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                inOutType
            }
        })
        window.localStorage.setItem("in_out_type", inOutType);
        dispatch(routerRedux.replace("/account/account-iomanage"));
    }
    render() {
        let calculate = Math.pow(10,getCurrencyType().tick);
        // eslint-disable-next-line no-unused-vars
        const { dataSource, currencyType } = this.props;
        return (
            <Card className="hover-shadow captialTotal">
                <Row>
                    <Col offset={11}>
                        <span style={{ fontSize: 24, fontWeight: 'bold'}}>{$('我的账户')}</span>
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col offset={12}>
                        <span style={{ fontSize: 22, fontWeight: 4 }}>
                            {$('资产总览')} &nbsp;
                        </span>
                        <span>
                            <Select defaultValue="BTC" style={{ width: 80 }}>
                                <Option value="BTC">BTC</Option>
                                <Option value="USD">USD</Option>
                                <Option value="ETH">ETH</Option>
                                <Option value="CNY">CNY</Option>
                            </Select>
                        </span>
                        <span> {$('估值')}</span>
                    </Col>
                </Row>
                <Row className="spacilRow">
                    <Col span={11}>
                        <Card
                            style={{ width: "100%", float: "left" }}
                            actions={[<Button className="button-color-green" icon="dollar" onClick={(e) => this.redirection("1")}>充值</Button>,
                            <Button type="primary" icon="upload" onClick={(e) => this.redirection("2")}>{$('提现')}</Button>]}
                        >
                            <Row className="rowRemain">
                                <Col style={{ borderRight: "1px solid #bbb" }} className="colRemain" span={12}>
                                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow("钱包余额=（存款 - 提款 + 已实现盈亏）")}>
                                        <span className="left">钱包余额</span>
                                    </Tooltip>
                                </Col>
                                <Col className="colRemain" span={12}>{
                                    currency(parseInt(((dataSource.walletBalance || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                                }</Col>
                            </Row>
                            <Row className="rowRemain">
                                <Col style={{ borderRight: "1px solid #bbb" }} className="colRemain" span={12}>
                                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow("钱包余额=（存款 - 提款 + 已实现盈亏）")}>
                                        <span className="left">保证金余额</span>
                                    </Tooltip>
                                </Col>
                                <Col className="colRemain" span={12}>{
                                    currency(parseInt(((dataSource.marginBalance || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                                }</Col>
                            </Row>
                            <Row className="rowRemain">
                                <Col style={{ borderRight: "1px solid #bbb" }} className="colRemain" span={12}>
                                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow("钱包余额=（存款 - 提款 + 已实现盈亏）")}>
                                        <span className="left">可用余额</span>
                                    </Tooltip>
                                </Col>
                                <Col className="colRemain" span={12}>{
                                    currency(parseInt(((dataSource.availableMargin || 0) * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                                }</Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col offset={12}>
                        <TotalRight dataSource={dataSource} />
                    </Col>
                </Row>
                <Divider />
                <div className="capitalTitle" style={{ fontSize: 22, fontWeight: 4 }}>
                    交易历史
                </div>
                <TradeHis />
            </Card>
        )
    }
}

export default connect(({ margin, loading }) => {
    const { dataSource, currencyType } = margin;
    return {
        dataSource,
        currencyType,
    }
})(
    Index
)
