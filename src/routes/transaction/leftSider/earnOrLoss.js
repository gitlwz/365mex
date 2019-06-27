import React, { Component } from 'react'
import { Row, Col, Switch, InputNumber, Utils, language } from 'quant-ui';
import { connect } from 'dva';
import { getCurrencyType, isNaNData, getTickLength } from '@/utils/utils';
import { Formula } from '@/utils/formula';
const FormulaFuc = new Formula();//计算公式
let { getLanguageData } = language;
let $ = getLanguageData;
const currency = Utils.currency;
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
        let calEarnOrLoss = window.localStorage.getItem("cal_earnOrLoss") || "{}";
        calEarnOrLoss = JSON.parse(calEarnOrLoss);
        this.state = {
            dataSource: {
                position: calEarnOrLoss.position || 1,
                price: calEarnOrLoss.price || props.lastPrice,
                closePrice: calEarnOrLoss.closePrice || props.lastPrice,
                leverage: calEarnOrLoss.leverage || 100,
                checked: calEarnOrLoss.checked
            }
        }
    }
    // priceInput = (e) => {
    //     const reg = /^[0-9]*[1-9][0-9]*$/;
    //     let value = e.target.value;
    //     if ((!isNaN(value) && reg.test(value)) || value === '') {
    //         let dataSource = { ...this.state.dataSource };
    //         dataSource.orderQty = value;
    //         this.setState({
    //             dataSource
    //         })
    //     } else if ((value && value.toString().length === 1) || value == "0") {
    //         let dataSource = { ...this.state.dataSource };
    //         dataSource.orderQty = 0;
    //         this.setState({
    //             dataSource
    //         })
    //     }
    // }
    onChange = (key, value) => {
        let dataSource = this.state.dataSource;
        if (key === 'leverage') {
            if(value > 100){
                dataSource[key] = 100;
            }else{
                dataSource[key] = limitDecimals(value);
            }
            this.setState({
                dataSource
            })
            window.localStorage.setItem("cal_earnOrLoss", JSON.stringify(dataSource))
        } else {
            const reg = /^0|[0-9]*[1-9][0-9]*$/;
            if ((!isNaN(value) && reg.test(value)) || value === '') {
                dataSource[key] = value;
            } else {
                dataSource[key] = 0;
            }
            this.setState({
                dataSource
            })
            window.localStorage.setItem("cal_earnOrLoss", JSON.stringify(dataSource))
        }
    }
    onChangeFormat = (e, key) => {
        const { tickSize } = this.props;
        let _tickSize = tickSize || 0.5;
        let value = e.target.value;
        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            let index = String(value).indexOf(".");
            let dataSource = { ...this.state.dataSource };
            dataSource[key] = value;
            if (index !== -1) {
                if (index <= String(value).length - 2) {
                    let num = parseInt(value / _tickSize);
                    num = (num * _tickSize).toFixed(1);
                    dataSource[key] = num;
                }
            } else if (this.pressKey === 38 || this.pressKey === 40 || this.pressKey === 'scoll') {
                dataSource[key] = (dataSource[key] * 1).toFixed(getTickLength(_tickSize));
            }
            this.setState({
                dataSource
            })
            window.localStorage.setItem("cal_earnOrLoss", JSON.stringify(dataSource))
        }
    }
    onChangeSwitch = (checked) => {
        let { dataSource } = this.state;
        dataSource.checked = checked;
        this.setState({
            dataSource
        })
        window.localStorage.setItem("cal_earnOrLoss", JSON.stringify(dataSource))
    }
    getMarginRequirement = (direction) => {
        const _dataSource = this.state.dataSource;
        const { instrumentData, positionHavaListData, symbolCurrent, dataSource } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        let _positionHold = {};
        if (positionHold) {
            _positionHold = { ...positionHold };
            _positionHold.leverage = _dataSource.leverage;
        }
        let marginRequire = FormulaFuc.getMarginRequirement(instrumentData, _positionHold, direction === -1 ? _dataSource.position * 1 : -_dataSource.position * 1, _dataSource.price, dataSource);
        if (marginRequire) {
            return marginRequire;
        } else {
            return 0;
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
        let { dataSource } = this.state;
        const { tickSize } = this.props;
        let direction = -1;
        if (dataSource.checked) {
            direction = 1;
        }
        let calculate = Math.pow(10, getCurrencyType().tick);
        let price = Math.round((1 * 1 / dataSource.price) * 100000000) * dataSource.position;
        let closePrice = Math.round((1 * 1 / dataSource.closePrice) * 100000000) * dataSource.position;
        let earn = ((closePrice - price) === Infinity) || isNaN(closePrice - price) ? 0 : (closePrice - price);
        let earnRate = ((earn * direction * 100 / price) || 0).toFixed(2) + "%";
        let returnRate = ((earn * direction * 100 * dataSource.leverage / price) || 0).toFixed(2) + "%";
        return (
            <div className="calculate">
                <Row span={24} style={{ marginBottom: 10 }}>
                    <Col span={12}>
                        <Row span={24} style={{ marginBottom: 10 }}>
                            <Col className="calculateSwitchLabel calculateLabelColor" span={8}>
                                {$('方向') + ": "}
                            </Col>
                            <Col className={"calculateSwitchLabel " + (direction === -1 ? "green" : '')} offset={1} span={14}>
                                <span onClick={() => this.onChangeSwitch(!dataSource.checked)} className="underLineTextH">{$('做多')}</span>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Row span={24} style={{ marginBottom: 10 }}>
                            <Col className="calculateSwitchLabel" span={8}>
                                <Switch
                                    onChange={this.onChangeSwitch}
                                    size="small"
                                    checked={dataSource.checked}
                                />
                            </Col>
                            <Col className={"calculateSwitchLabel " + (direction === 1 ? "red" : '')} offset={1} span={14}>
                                <span onClick={() => this.onChangeSwitch(!dataSource.checked)} className="underLineTextH">{$('做空')}</span>
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
                                    value={dataSource.position}
                                    onChange={(value) => this.onChange("position", value)}
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
                                    step={1}
                                /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100000000"
                                    min="0"
                                    value={dataSource.position}
                                    step={1}
                                    onKeyPress={(e) => this.onlyNumber(e, "qty")}
                                    onChange={(e) => this.onChange("position", e.target.value)}
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
                                    value={dataSource.price}
                                    onChange={(value) => this.onChangeFormat(value, "price")}
                                    min={0}
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
                                    max={1000000}
                                    step={0.5}
                                /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100000000"
                                    min="0"
                                    value={dataSource.price}
                                    step={tickSize || 0.5}
                                    onKeyPress={this.onlyNumber}
                                    onWheel={(e) => {
                                        this.pressKey = 'scoll'
                                    }}
                                    onKeyDown={(e) => this.pressKey = e.keyCode}
                                    // onKeyUp={(e) => this.onlyNumber(e)}
                                    onChange={(value) => this.onChangeFormat(value, "price")}
                                />
                                <span className='input_qty_text'>USD</span>
                            </Col>
                        </Row>
                        <Row span={24} style={{ marginBottom: 20 }}>
                            <Col className="calculateLeftLabel" span={8}>
                                {$('平仓价格')}
                            </Col>
                            <Col offset={1} span={14}>
                                {/* <InputNumber
                                    style={{ width: '100%' }}
                                    value={dataSource.closePrice}
                                    onChange={(value) => this.onChangeFormat(value, "closePrice")}
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
                                    step={0.5}
                                /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100000000"
                                    min="0"
                                    value={dataSource.closePrice}
                                    step={tickSize || 0.5}
                                    onKeyPress={this.onlyNumber}
                                    onWheel={(e) => {
                                        this.pressKey = 'scoll'
                                    }}
                                    onKeyDown={(e) => this.pressKey = e.keyCode}
                                    onChange={(value) => this.onChangeFormat(value, "closePrice")}
                                />
                                <span className='input_qty_text'>USD</span>
                            </Col>
                        </Row>
                        <Row span={24}>
                            <Col className="calculateLeftLabel" span={8}>
                                {$('杠杆')}
                            </Col>
                            <Col offset={1} span={14}>
                                {/* <InputNumber
                                    style={{ width: '100%' }}
                                    value={dataSource.leverage}
                                    onChange={(value) => this.onChange("leverage", value)}
                                    min={0}
                                    max={100}
                                    formatter={limitDecimals}
                                    parser={limitDecimals}
                                    step={0.01}
                                /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100000000"
                                    min="0"
                                    value={dataSource.leverage}
                                    step={0.01}
                                    onKeyPress={(e) => this.onlyNumber(e)}
                                    onChange={(e) => this.onChange("leverage", e.target.value)}
                                />
                                <span className='input_qty_text'>{$('倍')}</span>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <div className='calculateTable'>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('保证金')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {currency(parseInt(((this.getMarginRequirement(direction) * getCurrencyType().value / 100000000)) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() || "---"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('开仓价值')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {dataSource.price ? currency(parseInt(((price * getCurrencyType().value * direction / 100000000)) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() : "---"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('平仓价值')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {dataSource.closePrice ? currency(parseInt(((closePrice * getCurrencyType().value * direction / 100000000)) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() : "---"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$(' 盈亏 ')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {currency(isNaNData(parseInt(((earn * (getCurrencyType().value / 100000000) * direction)) * calculate) / calculate), { separator: ',', precision: getCurrencyType().tick }).format()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$(' 盈亏 ') + "(%)"}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {earnRate || "---"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('回报率') + "(%)"}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {returnRate || "---"}
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

export default connect(({ margin, loading, instrument, orderList, }) => {
    const { currencyType, dataSource } = margin;
    const { instrumentData, symbolCurrent, lastPrice, tickSize } = instrument;
    const { positionHavaListData } = orderList;
    return {
        currencyType,
        dataSource,
        tickSize,
        lastPrice,
        positionHavaListData,
        symbolCurrent,
        instrumentData,
        loading: !!loading.effects["recentTrade/getTrade"]
    }
})(
    Index
)

