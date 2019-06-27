/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import './index.less';
import { Card, Form, Row, Col, InputNumber, Input, Button, Utils, Select, language, Table, message } from 'quant-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { getCurrencyType } from '@/utils/utils'
let { getLanguageData } = language;
let $ = getLanguageData;
const Option = Select.Option;
const currency = Utils.currency;
const FormItem = Form.Item;
let calculate = Math.pow(10, getCurrencyType().tick);
const columns = [{
    title: $('时间'),
    dataIndex: 'operateTime',
    key: 'operateTime',
    className: "textLeft",
    render: (record, obj, index) => {
        return <span>{moment(record).format("YYYY-MM-DD HH:mm:ss")}</span>
    }
}, {
    title: $('地址'),
    dataIndex: 'address',
    key: 'address',
    className: "textRight",
}, {
    title: $('金额'),
    dataIndex: 'amount',
    key: 'amount',
    className: "textRight",
    render: (record, obj, arr) => {
        return <span>
            {currency(parseInt((record * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
        </span>
    }
}, {
    title: $('状态'),
    dataIndex: 'withdrawStatus',
    key: 'withdrawStatus',
    className: "textRight",
    render: (record, obj, arr) => {
        let text = "";
        if (record == "0") {
            text = "已提交";
        } else if (record == "1") {
            text = "已拒绝";
        } else if (record == "3") {
            text = "已通过";
        } else {
            text = "已撤销";
        }

        return <span>
            {text}
        </span>
    }
}];
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectCurrency: {},
        };
        this.renderData = true;
    }
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findCurrencyInfo"
        })
        dispatch({
            type: "accountInfo/findLatelyWithdraw"
        })
    }
    isCheckTwp = (dataSource) => {
        let length = 0;
        if (dataSource.email) {
            length++;
        }
        if (dataSource.telephone) {
            length++;
        }
        if (dataSource.googleStatus === "1") {
            length++;
        }
        return length;
    }
    componentWillReceiveProps = (nextProps) => {
        const { dispatch, form: { setFieldsValue, validateFields } } = this.props;
        if (!!nextProps.dataSource) {
            if (this.isCheckTwp(nextProps.dataSource) < 2) {
                message.error($('请先进行邮箱验证与两步验证, 再进行提现操作!'));
                dispatch(routerRedux.push({
                    pathname: '/account/personal-safety',
                }));
            }
        }
        if (nextProps.currencyData.length > 0 && this.renderData) {
            let selectCurrency = nextProps.currencyData.filter(item => item.currency === "XBT")[0];
            if (selectCurrency && selectCurrency != this.props.selectCurrency) {
                setFieldsValue({ withdrawFee: selectCurrency.recommendWithdrawFee })
            }
            this.setState({
                selectCurrency
            })
            this.renderData = false;
        }
    }
    handleSubmit = e => {
        e.preventDefault();
        const { dispatch, form: { validateFields } } = this.props;
        validateFields({ force: true }, (err, values) => {
            if (!err) {
                values.amount *= 100000000;
                values.withdrawFee *= 100000000;
                dispatch({
                    type: "accountInfo/requestWithdrawal",
                    payload: {
                        ...values,
                        withdrawStatus: "0"
                    }
                })
            }
        });
    };
    renderCurrency = () => {
        const { currencyData } = this.props;
        let arr = [];
        for (let value of currencyData) {
            arr.push(
                <Option key={value.currency} value={value.currency}>{value.currency}</Option>
            )
        }
        return arr;
    }
    selectCurrency = (value) => {
        const { currencyData } = this.props;
        this.setState({
            selectCurrency: currencyData.filter(item => item.currency === value)[0]
        })
    }
    checkStdNum = (val) => {
        try {
            const e = String(val)
            let rex = /^([0-9])\.?([0-9]*)e-([0-9])/
            if (!rex.test(e)) return val
            const numArr = e.match(rex)
            const n = Number('' + numArr[1] + (numArr[2] || ''))
            const num = '0.' + String(Math.pow(10, Number(numArr[3]) - 1)).substr(1) + n
            return num.replace(/0*$/, '')
        } catch (e) {
            return 0;
        }
    }
    render() {
        // eslint-disable-next-line no-unused-vars
        const { form, currencyType, currencyData, latelyWithdraw, dataSource } = this.props;
        const { selectCurrency } = this.state;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };
        let precision = 1;
        if (selectCurrency.minWithdrawTick) {
            let arr = selectCurrency.minWithdrawTick.toString().split(".");
            if (arr.length === 2) {
                precision = arr[1].length;
            }
        }
        let calculate = Math.pow(10, getCurrencyType().tick);
        const buttonItemLayout = {
            wrapperCol: { span: 8, offset: 8 },
        };
        return (
            <Card className="outMoney">
                <Row>
                    <Col span={12}>
                        <Form onSubmit={this.handleSubmit}>
                            <FormItem label={"币种"} {...formItemLayout}>
                                {getFieldDecorator('currency', {
                                    initialValue: currencyData.length > 0 ? currencyData[0].currency : "XBT",
                                    rules: [
                                        {
                                            required: true,
                                        },
                                    ],
                                })(<Select onSelect={this.selectCurrency}>
                                    {this.renderCurrency()}
                                </Select>)}
                            </FormItem>
                            <FormItem label={"目标地址"} {...formItemLayout}>
                                {getFieldDecorator('address', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入目标地址',
                                        },
                                    ],
                                })(<Input size="default" />)}
                            </FormItem>
                            <FormItem label={"金额(XBT)"} {...formItemLayout}>
                                {getFieldDecorator('amount', {
                                    // initialValue: selectCurrency.minWithdrawAmount,
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入金额',
                                        },
                                    ],
                                })(
                                    <div>
                                        <InputNumber
                                            min={selectCurrency.minWithdrawAmount}
                                            step={selectCurrency.minWithdrawTick}
                                            precision={precision}
                                            style={{ width: "100%" }} size="default" />
                                        <div>最小提现额为{selectCurrency.minWithdrawAmount} XBT</div>
                                    </div>
                                )}
                            </FormItem>
                            <FormItem label={"比特币网络费用 (XBT)"} {...formItemLayout}>
                                {getFieldDecorator('withdrawFee', {
                                    // initialValue: Number(selectCurrency.recommendWithdrawFee) || 0.001,
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入费用',
                                        },
                                    ],
                                })(
                                    <InputNumber
                                        min={selectCurrency.minWithdrawFee}
                                        step={selectCurrency.minWithdrawTick}
                                        style={{ width: "100%" }}
                                        // defaultValue={1}
                                        size="default" />
                                )}
                            </FormItem>
                            <Row className="ant-form-item" >
                                <Col offset={8}>
                                    <div>比特币交易在比特币网络中会根据交易费被优先处理。</div>
                                    <div>我们推荐的交易费是 {this.checkStdNum(selectCurrency.recommendWithdrawFee)}，最低交易费是 {this.checkStdNum(this.state.selectCurrency.minWithdrawFee)}。</div>
                                </Col>

                            </Row>
                            <Row className="ant-form-item">
                                <Col className="ant-form-item-label" span={4}>
                                    <label className="ant-form-item-required" style={{ fontSize: 14, fontWeight: 500 }}>确认: </label>
                                </Col>
                                <Col offset={8}>
                                    <div className="comfirm">
                                        <div>
                                            目标地址: {form.getFieldValue('address')}
                                        </div>
                                        <div>
                                            发送金额: {
                                                currency(parseInt((((form.getFieldValue('amount') || 0) * getCurrencyType().value)) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                                            }
                                        </div>
                                        <div>
                                            比特币网络费用: {currency(parseInt(((form.getFieldValue('withdrawFee')) * getCurrencyType().value) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                                            }
                                        </div>
                                        <div>
                                            总扣账: {currency(parseInt((form.getFieldValue('withdrawFee') + (form.getFieldValue('amount') || 0) * getCurrencyType().value) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                                            }
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            {dataSource.accountPassword === '1' ? <FormItem label={"资金密码"} {...formItemLayout}>
                                {getFieldDecorator('accountPassword', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入资金密码',
                                        },
                                    ],
                                })(<Input type="password" size="default" />)}
                            </FormItem> : ''}
                            <FormItem {...buttonItemLayout}>
                                <Button
                                    size="default"
                                    className={"register-submit"}
                                    type="primary"
                                    htmlType="submit"
                                >提交
                        </Button>
                            </FormItem>
                        </Form>
                    </Col>
                    <Col offset={1} span={11}>
                        <strong>{$('这是您最近20次提现记录, 双击记录自动填入提现数据。')}</strong>
                        <Table className="withdrawal" pagination={false} dataSource={latelyWithdraw} size="small" columns={columns} />
                    </Col>
                </Row>
                <ul>
                    <li>基于安全理由，365MEX 每日只会人工审核并处理提现一次，有关我们的政策请参阅 钱包安全页.</li>
                    <li>在 13:00 UTC (大约 {Math.abs(20 - new Date().getHours())} 小时) 前提交的提款请求，会进入当天的批处理队列。</li>
                </ul>
            </Card>
        )
    }
}
export default connect(({ margin, accountInfo }) => {
    const { currencyType } = margin;
    const { currencyData, latelyWithdraw, dataSource } = accountInfo;
    return {
        currencyType,
        currencyData,
        latelyWithdraw,
        dataSource,
    }
})(Form.create()(Index))