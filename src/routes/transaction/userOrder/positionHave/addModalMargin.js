import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, Modal, Radio, Icon, Button, InputNumber, Input, Utils, Tooltip, Divider, language } from "quant-ui";
import { getCurrencyType, tooltipShow } from "@/utils/utils"
let { getLanguageData } = language;
const InputGroup = Input.Group;
const RadioGroup = Radio.Group;
let $ = getLanguageData;
let page = null;
const currency = Utils.currency;
const styleMask = {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    top: "3%"
}
class AddModal extends Component {
    constructor(props) {
        super(props);
        page = this;
        this.state = {
            margin: 10000 * getCurrencyType().value / 100000000,
            addOrSub: 1,
            isCheck: false //输入金额是否大于最大可移除金额
        }
    }
    componentWillReceiveProps = (props) => {
        if (!props.addVisibleAddMargin) {
            this.setState({
                margin: 10000 * getCurrencyType().value / 100000000
            })
        }
    }
    onChange = (e) => {
        this.setState({
            addOrSub: e.target.value,
        });
    }
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                addVisibleAddMargin: false
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { dispatch, positionSymbol } = this.props;
        let margin = this.state.margin * (100000000 / getCurrencyType().value);
        dispatch({
            type: "orderCommit/transferMargin",
            payload: {
                amount: this.state.addOrSub == "1" ? margin : -margin,
                symbol: positionSymbol
            }
        })
    }
    footer = (title) => {
        const { loading } = this.props;
        let isCheck = this.state.isCheck;
        let value = 10000;
        // if (!this.state.isCheck) {
        if (this.state.margin == value) {
            value = 10000 * getCurrencyType().value / 100000000;
        } else {
            value = this.state.margin;
        }
        // }
        if (this.checkAvalible(value) || value == 0) {
            isCheck = true;
        } else {
            isCheck = false;
        }
        return <div className="commit_footer">
            <Button onClick={this.onCancel} className="commit_footer_cancel"><Icon
                style={{ fontSize: 15, fontWeight: "bold" }}
                type="close" />{$('取消')}</Button>
            <Button disabled={isCheck} loading={loading} onClick={this.onOk} type="primary" className="commit_footer_ok">{$(title)}</Button>
        </div>
    }
    checkAvalible = (value) => {
        const { maxMoveMargin, currencyType, dataSource } = this.props;
        let isCheck = this.state.isCheck;
        let calculate = Math.pow(10, getCurrencyType().tick);
        let max = parseInt(((maxMoveMargin || 0) * getCurrencyType().value / 100000000) * calculate) / calculate;
        if (this.state.addOrSub == 1) {
            let _dataSource = dataSource || {};
            max = parseInt(((_dataSource.availableMargin || 0) * getCurrencyType().value / 100000000) * calculate) / calculate;
        }
        if (value > max) {
            isCheck = true;
        } else {
            isCheck = false;
        }
        return isCheck;
    }
    priceInput = (e) => {
        let value = e.target.value;
        const reg = /^-?(0|[1-9][0-9]*)(.[0-9]*)?$/;
        const { currencyType } = this.props;
        if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
            let isCheck = this.checkAvalible(value);
            this.setState({
                margin: value,
                isCheck
            })
        } else if ((value && value.toString().length === 1) || value == "0") {
            this.setState({
                margin: 0
            })
        }
    }
    inputChange = (value) => {
        this.setState({
            margin: value
        })
    }
    render() {
        const { currencyType, addVisibleAddMargin, positionCurrentQty, dataSource, positionMaintMargin, maxMoveMargin, leverageCal } = this.props;
        let calculate = Math.pow(10, getCurrencyType().tick);
        let _dataSource = dataSource || {};
        return (
            <Modal
                className="moveModal_commit"
                visible={addVisibleAddMargin}
                destroyOnClose={true}
                title={<span style={{ fontWeight: 'bold' }}>{$('增加/减少仓位保证金')}</span>}
                onCancel={this.onCancel}
                maskStyle={styleMask}
                centered
                onOk={this.onOk}
                maskClosable={false}
                footer={this.footer(this.state.addOrSub == 1 ? $('增加保证金') : $('减少保证金'))}
                width="30%"
            >
                <div className="marginAdd" style={{ textAlign: "center", fontSize: 12 }}>
                    <div>
                        <RadioGroup value={this.state.addOrSub} onChange={this.onChange}>
                            <Radio className='radio_color' value={1}>{$('增加保证金')}</Radio>
                            <Radio className='radio_color' value={2}>{$('减少保证金')}</Radio>
                        </RadioGroup>
                        <div style={{ width: 350, margin: "10px auto", position: 'relative', height: "32px", lineHeight: "32px" }}>
                            <span style={{ fontSize: 14, marginBottom: 10 }}>{this.state.addOrSub == 1 ? $('增加保证金') : $('减少保证金')}</span>
                            <Input
                                size="small"
                                className='input_qty'
                                style={{ textAlign: "left", borderRadius: 0 }}
                                min={0}
                                value={this.state.margin}
                                type='number'
                                precision={getCurrencyType().tick}
                                step={Math.pow(10, -getCurrencyType().tick).toFixed(getCurrencyType().tick)}
                                onChange={this.priceInput}
                            />
                            <span className='input_qty_text'>USD</span>
                        </div>
                        <div className="moveModal_commit_table">
                            {<table cellSpacing="0" rules="cols">
                                <tbody>
                                    <tr>
                                        <td className="moveModal_commit_table_borderR">
                                            <div>{$('你的当前仓位') + ": "}</div>
                                        </td>
                                        <td style={{ width: "50%" }}>
                                            <div style={{ fontWeight: 'bold' }}>{positionCurrentQty + " " + $('张合约') + "(" + leverageCal + "x)"}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="moveModal_commit_table_borderR">
                                            <div>{$('当前已分配的保证金')}</div>
                                        </td>
                                        <td style={{ width: "50%" }}>
                                            <div style={{ fontWeight: 'bold' }}>{currency(parseInt((positionMaintMargin * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="moveModal_commit_table_borderR">
                                            {this.state.addOrSub == 1 ? <div>{$('可用保证金')}</div> : <div style={{ cursor: 'help', borderBottom: "1px dotted #000" }}>{$('最大可移除金额') + ": "}</div>}
                                        </td>
                                        <td style={{ width: "50%" }}>
                                            <div className='linkify'>
                                                {this.state.addOrSub == 1 ?
                                                    <span>
                                                        <span onClick={() => this.inputChange(parseInt(((_dataSource.availableMargin || 0) * getCurrencyType().value / 100000000) * calculate) / calculate)} style={{ fontWeight: 'bold' }}>
                                                            {currency(parseInt(((_dataSource.availableMargin || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
                                                        </span>
                                                    </span> :
                                                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('你可以将未使用的保证金从此仓位移除, 但是未实现利润无法被移除。'))}>
                                                        <span onClick={() => this.inputChange(parseInt(((maxMoveMargin || 0) * getCurrencyType().value / 100000000) * calculate) / calculate)} style={{ fontWeight: 'bold' }}>
                                                            {currency(parseInt(((maxMoveMargin || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
                                                        </span>
                                                    </Tooltip>}

                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>}
                        </div>
                        {/* <div>
                            <span>{$('你的当前仓位') + ": "}</span>
                            <span style={{ fontWeight: 'bold' }}>{positionCurrentQty + " "}</span>
                            <span>{$('张合约') + "(" + leverageCal + "x)"}</span>
                        </div>
                        <div>
                            <span>{$('当前已分配的保证金') + ": "}</span>
                            <span style={{ fontWeight: 'bold' }}>{currency(parseInt((positionMaintMargin * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}</span>
                        </div> */}
                    </div>
                </div>
            </Modal>
        )
    }
}
export default connect(({ orderCommit, instrument, margin, loading, orderList }) => {
    const { addVisibleAddMargin, positionSymbol, positionCurrentQty, positionMaintMargin, maxMoveMargin, leverageCal } = orderCommit
    const { tickSize } = instrument
    const { dataSource, currencyType } = margin
    return {
        addVisibleAddMargin,
        currencyType,
        positionCurrentQty,
        positionMaintMargin,
        positionSymbol,
        tickSize,
        dataSource,
        maxMoveMargin,
        loading: !!loading.effects["orderCommit/transferMargin"],
        leverageCal
    }
})(
    Form.create()(AddModal)
)
