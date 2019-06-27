import React, { Component } from 'react'
import { Row, Col, Switch, InputNumber, language } from 'quant-ui';
import { connect } from 'dva';
import { isNaNData, getTickLength } from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
const limitDecimals = (value) => {
    const reg = /^(\-)*(\d+)\.(\d).*$/;
    if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
    } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
    } else {
        return ''
    }
};
const limitDecimalsTwo = (value) => {
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
        let calFocusprice = window.localStorage.getItem("cal_focusprice") || "{}";
        calFocusprice = JSON.parse(calFocusprice);
        this.state = {
            dataSource: {
                leverage: calFocusprice.leverage || 100,
                price: calFocusprice.price || props.lastPrice,
                returnRate: calFocusprice.returnRate || 0,
                checked: calFocusprice.checked
            }
        }
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.state.dataSource.leverage !== nextState.dataSource.leverage) {
            return true;
        }
        if (this.state.dataSource.price !== nextState.dataSource.price) {
            return true;
        }
        if (this.state.dataSource.returnRate !== nextState.dataSource.returnRate) {
            return true;
        }
        if (this.state.dataSource.checked !== nextState.dataSource.checked) {
            return true;
        }
        if (this.props.leverage !== nextProps.currencyType) {
            return true;
        }
        return false;
    }
    onChange = (key, value) => {
        let dataSource = { ...this.state.dataSource };
        if (key === 'leverage') {
            if(value > 100){
                dataSource[key] = 100;
            }else{
                dataSource[key] = limitDecimalsTwo(value);
            }
            this.setState({
                dataSource
            })
        } else if(key === 'returnRate'){
            dataSource[key] = limitDecimals(value);
            this.setState({
                dataSource
            })
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
        }
        window.localStorage.setItem("cal_focusprice", JSON.stringify(dataSource))
    }

    onChangeSwitch = (checked) => {
        let dataSource = { ...this.state.dataSource };
        dataSource.checked = checked;
        this.setState({
            dataSource
        })
        window.localStorage.setItem("cal_focusprice", JSON.stringify(dataSource))
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
            window.localStorage.setItem("cal_focusprice", JSON.stringify(dataSource))
        }
    }
    // onChangeFormat = (value, key) => {
    //     const { tickSize } = this.props;
    //     let _tickSize = tickSize || 0.5;
    //     const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
    //     if ((!isNaN(value) && reg.test(value)) || value === '') {
    //         let index = String(value).indexOf(".");
    //         let dataSource = { ...this.state.dataSource };
    //         dataSource[key] = value;
    //         if (index !== -1) {
    //             if (index <= String(value).length - 2) {
    //                 let num = parseInt(value / _tickSize);
    //                 num = (num * _tickSize).toFixed(1);
    //                 dataSource[key] = num;
    //             }
    //         }
    //         this.setState({
    //             dataSource
    //         })
    //         window.localStorage.setItem("cal_focusprice", JSON.stringify(dataSource))
    //     }
    // }
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
        const { dataSource } = this.state;
        const { currencyType, tickSize } = this.props;
        let focusPrice = "--";
        let direction = -1;
        let profit = "0";
        if (dataSource.checked) {
            direction = 1;
        }
        if (dataSource.leverage && dataSource.leverage <= 100) {
            let returnRate = dataSource.returnRate || 0;
            // if (dataSource.returnRate !== 0) {
            if (!!dataSource.price) {
                focusPrice = "---";
            }
            let openPrice = Math.round((1 * 1 / dataSource.price) * 100000000) * direction;
            profit = (returnRate / dataSource.leverage).toFixed(2);
            focusPrice = direction / (Math.ceil(Math.abs(openPrice) * (returnRate / 100) / dataSource.leverage) + openPrice) * 100000000
            // focusPrice = (dataSource.price * dataSource.leverage) / (direction * dataSource.returnRate / 100 + dataSource.leverage);
            focusPrice = focusPrice.toFixed(1);
            let arr = focusPrice.split(".");
            if (arr[1] !== "0") {
                if (arr[1] < 3) {
                    focusPrice = parseInt(arr[0]);
                } else if (arr[1] < 8) {
                    focusPrice = parseInt(arr[0]) + 0.5;
                } else {
                    focusPrice = parseInt(arr[0]) + 1;
                }

            }
            // }
        }
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
                                    checked={dataSource.checked} />
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
                                {$('杠杆')}
                            </Col>
                            <Col offset={1} span={14}>
                                {/* <InputNumber
                                    style={{ width: '100%' }}
                                    value={dataSource.leverage}
                                    onChange={(value) => this.onChange("leverage", value)}
                                    min={0}
                                    max={100}
                                    formatter={limitDecimalsTwo}
                                    parser={limitDecimalsTwo}
                                    step={0.01}
                                /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100"
                                    min="0"
                                    value={dataSource.leverage}
                                    step={0.01}
                                    onKeyPress={(e) => this.onlyNumber(e)}
                                    onChange={(e) => this.onChange("leverage", e.target.value)}
                                />
                                <span className='input_qty_text'>{$('倍')}</span>
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
                                    // onChange={(value) => this.onChange("price" ,value)}
                                    onChange={(value) => this.onChangeFormat(value, "price")}
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
                                    value={dataSource.price}
                                    step={tickSize || 0.5}
                                    onKeyPress={this.onlyNumber}
                                    onWheel={(e) => {
                                        this.pressKey = 'scoll'
                                    }}
                                    onKeyDown={(e) => this.pressKey = e.keyCode}
                                    onChange={(value) => this.onChangeFormat(value, "price")}
                                />
                                <span className='input_qty_text'>USD</span>
                            </Col>
                        </Row>
                        <Row span={24}>
                            <Col className="calculateLeftLabel" span={8}>
                                {$('回报率')}(%)
                        </Col>
                            <Col offset={1} span={14}>
                                {/* <InputNumber
                                    style={{ width: '100%' }}
                                    value={dataSource.returnRate}
                                    onChange={(value) => this.onChange("returnRate", value)}
                                    min={0}
                                    formatter={limitDecimals}
                                    parser={limitDecimals}
                                    step={0.5}
                                /> */}
                                <input
                                    className='input_qty'
                                    type='number'
                                    max="100000000"
                                    min="0"
                                    value={dataSource.returnRate}
                                    step={0.1}
                                    onKeyPress={(e) => this.onlyNumber(e)}
                                    onChange={(e) => this.onChange("returnRate", e.target.value)}
                                />
                                <span className='input_qty_text'>{'%'}</span>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <div style={{height: 130}} className="calculateTable">
                            <table>
                                <tbody>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('开仓价格')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {dataSource.price}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('目标价格')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {isNaNData(focusPrice)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$(' 盈亏 ')}
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {profit + "%"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='calculateLabelColor' style={{ padding: 3, textAlign: "left" }}>
                                            {$('回报率')}(%)
                                        </td>
                                        <td style={{ padding: 3, textAlign: "right" }}>
                                            {(((dataSource.leverage || !!dataSource.price) ? (dataSource.returnRate || 0) : 0)) + "%"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default connect(({ loading, margin, instrument }) => {
    const { currencyType } = margin;
    const { lastPrice, tickSize } = instrument;
    return {
        loading: !!loading.effects["recentTrade/getTrade"],
        lastPrice,
        tickSize,
    }
})(
    Index
)

