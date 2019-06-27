import React, { Component } from 'react'
import { Row, Col, Switch, InputNumber, language } from 'quant-ui';
import { connect } from 'dva';
import { Formula } from '@/utils/formula';
import { getCurrencyType, getTickLength } from '@/utils/utils'
const FormulaFuc = new Formula();//成本计算公式
const getLiquidationPrice = FormulaFuc.getLiquidationPrice;
let { getLanguageData } = language;
let $ = getLanguageData;
const limitDecimals = (value) => {
    const reg = /^(\-)*(\d+)\.(\d\d).*$/;
    if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
    } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
    } else {
        return ''
    }
};
class Index extends Component {
    constructor(props) {
        super(props);
        let liquidationPrice = window.localStorage.getItem("cal_liquidationPrice") || "{}";
        liquidationPrice = JSON.parse(liquidationPrice);
        this.state = {
            entryPrice: liquidationPrice.entryPrice || props.lastPrice,//开仓价格
            lvg: liquidationPrice.lvg || 100,//杠杆
            marginBalance: liquidationPrice.marginBalance || props.dataSource.marginBalance,//保证金或钱包
            qty: liquidationPrice.qty || 1,//数量
            isMarginModeCross: liquidationPrice.isMarginModeCross,//逐仓或者全仓 默认逐仓
            isTradeTypeShort: liquidationPrice.isTradeTypeShort//买卖方向 默认做多
        }
    }
    onChange = (flag, key) => {
        let value = 0;
        if (flag) {
            value = 1;
        }
        this.setState({
            [key]: value
        })
        let liquidationPrice = window.localStorage.getItem("cal_liquidationPrice") || "{}";
        liquidationPrice = JSON.parse(liquidationPrice);
        liquidationPrice[key] = value;
        window.localStorage.setItem("cal_liquidationPrice", JSON.stringify(liquidationPrice))
    }
    onChangeFormat = (value, key) => {
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let entryPrice = value;
            if (index !== -1) {
                if (index <= String(value).length - 2) {
                    let num = parseInt(value / _tickSize);
                    num = (num * _tickSize).toFixed(1);
                    entryPrice = num;
                }
            } else if (this.pressKey === 38 || this.pressKey === 40 || this.pressKey === 'scoll') {
                entryPrice = (entryPrice * 1).toFixed(getTickLength(_tickSize));
            }
            this.setState({
                entryPrice
            })
            let liquidationPrice = window.localStorage.getItem("cal_liquidationPrice") || "{}";
            liquidationPrice = JSON.parse(liquidationPrice);
            liquidationPrice[key] = entryPrice;
            window.localStorage.setItem("cal_liquidationPrice", JSON.stringify(liquidationPrice))
        }
    }
    onChangeNumber = (value, key) => {
        if (key === 'qty') {
            let _value = value;
            const reg = /^0|[0-9]*[1-9][0-9]*$/;
            if ((!isNaN(value) && reg.test(value)) || value === '') {
                _value = value;
            } else {
                _value = 0;
            }
            this.setState({
                [key]: _value
            })
            let liquidationPrice = window.localStorage.getItem("cal_liquidationPrice") || "{}";
            liquidationPrice = JSON.parse(liquidationPrice);
            liquidationPrice[key] = _value;
            window.localStorage.setItem("cal_liquidationPrice", JSON.stringify(liquidationPrice))
        } else if(key === 'lvg'){
            if(value > 100){
                value = 100;
            }else{
                value = limitDecimals(value);
            }
            this.setState({
                [key]:value
            })
            let liquidationPrice = window.localStorage.getItem("cal_liquidationPrice") || "{}";
            liquidationPrice = JSON.parse(liquidationPrice);
            liquidationPrice[key] = value;
            window.localStorage.setItem("cal_liquidationPrice", JSON.stringify(liquidationPrice))
        } 
        else {
            this.setState({
                [key]: value
            })
            let liquidationPrice = window.localStorage.getItem("cal_liquidationPrice") || "{}";
            liquidationPrice = JSON.parse(liquidationPrice);
            liquidationPrice[key] = value;
            window.localStorage.setItem("cal_liquidationPrice", JSON.stringify(liquidationPrice))
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
    render() {
        const { isMarginModeCross, isTradeTypeShort, entryPrice, lvg, marginBalance, qty } = this.state;
        const { positionHavaListData, symbolCurrent, instrumentData, dataSource, currencyType, tickSize } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent) || {};
        let liqPrice = 0;
        let leaveNum = 0;
        let currentQty = positionHold.currentQty || 0;
        let _qty = qty;
        if (positionHold) {
            let _positionHold = { ...positionHold }
            let _dataSource = { ...dataSource }
            if (isTradeTypeShort) {//做空 卖
                leaveNum = currentQty - qty;
                _qty = -_qty * 1;
            } else {
                leaveNum = currentQty + qty;
            }
            _positionHold.initMarginReq = isMarginModeCross ? positionHold.initMarginReq : 1 / lvg;
            _positionHold.crossMargin = isMarginModeCross;
            _dataSource.walletBalance = marginBalance * 100000000 / getCurrencyType().value;
            _dataSource.initMargin = 0;
            _dataSource.maintMargin = 0;
            liqPrice = getLiquidationPrice(instrumentData, _positionHold, _dataSource, _qty, entryPrice * 1 || instrumentData.tickSize, lvg);
            liqPrice = isNaN(liqPrice) ? "---" : liqPrice;
        }
        return (
            <div className="calculate">
                <Row span={24} style={{ marginBottom: 10 }}>
                    <Col span={12}>
                        <Row span={24} style={{ marginBottom: 10 }}>
                            <Col className="calculateSwitchLabel calculateLabelColor" span={8}>
                                {$('方向') + ": "}
                            </Col>
                            <Col className={"calculateSwitchLabel " + (!isTradeTypeShort ? "green" : '')} offset={1} span={14}>
                                <span onClick={(e) => this.onChange(!isTradeTypeShort, 'isTradeTypeShort')} className="underLineTextH">{$('做多')}</span>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Row span={24} style={{ marginBottom: 10 }}>
                            <Col className="calculateSwitchLabel" span={8}>
                                <Switch checked={isTradeTypeShort} onChange={(e) => this.onChange(e, 'isTradeTypeShort')} size="small" />
                            </Col>
                            <Col className={"calculateSwitchLabel " + (isTradeTypeShort ? "red" : '')} offset={1} span={14}>
                                <span onClick={(e) => this.onChange(!isTradeTypeShort, 'isTradeTypeShort')} className="underLineTextH">{$('做空')}</span>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row span={24} style={{ marginBottom: 10 }}>
                    <Col span={12}>
                        <Row span={24} style={{ marginBottom: 10 }}>
                            <Col className="calculateSwitchLabel calculateLabelColor" span={8}>
                                {$('保证金') + ": "}
                            </Col>
                            <Col className={"calculateSwitchLabel " + (!isMarginModeCross ? "green" : '')} offset={1} span={14}>
                                <span onClick={(e) => this.onChange(!isMarginModeCross, 'isMarginModeCross')} className="underLineTextH">{$('逐仓')}</span>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Row span={24} style={{ marginBottom: 10 }}>
                            <Col className="calculateSwitchLabel" span={8}>
                                <Switch checked={isMarginModeCross} onChange={(e) => this.onChange(e, 'isMarginModeCross')} size="small" />
                            </Col>
                            <Col className={"calculateSwitchLabel " + (isMarginModeCross ? "red" : '')} offset={1} span={14}>
                                <span onClick={(e) => this.onChange(!isMarginModeCross, 'isMarginModeCross')} className="underLineTextH">{$('全仓')}</span>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row span={24}>
                    <Col span={12}>
                        <Row span={24} style={{ marginBottom: 20 }}>
                            <Col className="calculateLeftLabel" span={8}>
                                {$('仓位')}
                            </Col>
                            <Col offset={1} span={14}>
                                {/* <InputNumber
                                    style={{ width: '100%' }}
                                    onChange={(e) => { this.onChangeNumber(e, 'qty') }}
                                    min={0}
                                    max={10000000}
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
                                    value={qty} /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100000000"
                                    min="0"
                                    value={qty}
                                    step={1}
                                    onKeyPress={(e) => this.onlyNumber(e, "qty")}
                                    onChange={(e) => this.onChangeNumber(e.target.value, "qty")}
                                />
                                <span className='input_qty_text'>USD</span>
                            </Col>
                        </Row>
                        <Row span={24} style={{ marginBottom: 20 }}>
                            <Col className="calculateLeftLabel" span={8}>
                                {$('开仓价格')}
                            </Col>
                            <Col offset={1} span={14}>
                                {/* <InputNumber
                                    style={{ width: '100%' }}
                                    step={0.5}
                                    onChange={(value) => this.onChangeFormat(value, "entryPrice")}
                                    formatter={(value) => {
                                        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
                                        if (((!isNaN(value) && reg.test(value)) || value === '')) {
                                            let index = value.toString().indexOf(".");
                                            if (index !== -1) {
                                                if (index <= value.length - 2) {
                                                    let num = parseInt(value / 0.5);
                                                    num = (num * 0.5).toFixed(2 - 1);
                                                    return num;
                                                }
                                            }
                                            return value;
                                        } else {
                                            return value ? value.substring(0, value.length - 1) : value;
                                        }
                                    }}
                                    min={0}
                                    max={1000000}
                                    value={entryPrice} /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100000000"
                                    min="0"
                                    value={entryPrice}
                                    step={tickSize || 0.5}
                                    onKeyPress={this.onlyNumber}
                                    onWheel={(e) => {
                                        this.pressKey = 'scoll'
                                    }}
                                    onKeyDown={(e) => this.pressKey = e.keyCode}
                                    onChange={(e) => this.onChangeFormat(e.target.value, "entryPrice")}
                                />
                                <span className='input_qty_text'>USD</span>
                            </Col>
                        </Row>
                        {!isMarginModeCross ? <Row span={24}>
                            <Col className="calculateLeftLabel" span={8}>
                                {$('杠杆')}
                            </Col>
                            <Col offset={1} span={14}>
                                {/* <InputNumber
                                    style={{ width: '100%' }}
                                    onChange={(e) => { this.onChangeNumber(e, 'lvg') }}
                                    min={1}
                                    step={0.01}
                                    formatter={limitDecimals}
                                    parser={limitDecimals}
                                    max={100}
                                    value={lvg} /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100"
                                    min="0"
                                    value={lvg}
                                    step={0.01}
                                    onKeyPress={(e) => this.onlyNumber(e)}
                                    onChange={(e) => this.onChangeNumber(e.target.value, 'lvg')}
                                />
                                <span className='input_qty_text'>{$('倍')}</span>
                            </Col>
                        </Row> : <Row span={24}>
                                <Col className="calculateLeftLabel" span={8}>
                                    {$('钱包')}
                                </Col>
                                <Col offset={1} span={14}>
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        onChange={(e) => { this.onChangeNumber(e, 'marginBalance') }}
                                        precision={getCurrencyType().tick}
                                        min={0}
                                        value={marginBalance} />
                                </Col>
                            </Row>}

                    </Col>
                    <Col span={12}>
                        <div className="calculateTable" style={{ height: "130px" }}>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('当前仓位')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {currentQty}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('最终数量')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {leaveNum}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('强平价格')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {liqPrice}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: "center", opacity: '0.6', marginTop: 10 }}>{$('所有货币单位均为')} {getCurrencyType().key}</div>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default connect(({ loading, orderList, instrument, margin }) => {
    const { positionHavaListData } = orderList;
    const { dataSource, currencyType } = margin;
    const { symbolCurrent, instrumentData, lastPrice, tickSize } = instrument;
    return {
        symbolCurrent,
        instrumentData,
        dataSource,
        currencyType,
        tickSize,
        lastPrice,
        positionHavaListData,
        loading: !!loading.effects["recentTrade/getTrade"]
    }
})(
    Index
)

