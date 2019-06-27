import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { language, Form, Tooltip, DatePicker, Card, Utils, Col, Table, Button, Select } from 'quant-ui';
import moment from 'moment';
import { tooltipShow, getCurrencyType } from '@/utils/utils';
const currency = Utils.currency;
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
let $ = language.getLanguageData;
const Option = Select.Option;
let calculate = Math.pow(10,getCurrencyType().tick);
let page = null;
const columns = [{
    title: $('时间'),
    dataIndex: 'operateTime',
    key: 'operateTime',
    align: 'left',
    render: (record, obj, index) => {
        return <span>{moment(record).format("YYYY-MM-DD a HH:mm:ss")}</span>
    }
}, {
    title: '币种',
    dataIndex: 'currency',
    key: 'currency',
    align: 'right',
}, {
    title: '交易类型',
    dataIndex: 'transactionType',
    key: 'transactionType',
    align: 'right',
    render: (record) => {
        let text = $('充值');
        if (record === "2") {
            text = $('提现')
        }
        return <span>{text}</span>
    }
}, {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    align: 'right',
}, {
    title: $('金额'),
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    render: (record, obj, arr) => {
        return <span>
            {currency(parseInt((record * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
        </span>
    }
}, {
    title: '手续费',
    dataIndex: 'withdrawFee',
    key: 'withdrawFee',
    align: 'right',
    render: (record, obj, arr) => {
        return <span>
            {currency(parseInt((record * getCurrencyType().value / 100000000) *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key}
        </span>
    }
}, {
    title: $('状态'),
    dataIndex: 'transactionStatus',
    key: 'transactionStatus',
    width:150,
    align: 'right',
    render: (record, obj, arr) => {
        const { loading } = page.props;
        let text = "";
        if (record == "0") {
            text = $('提现申请已提交');
            return <span>
                {text + " "}
                <Tooltip mouseLeaveDelay={0} placement="right" title={$('点此取消未发送的提现')}>
                    <Button loading={loading} onClick={() => page.cancelWithdrawal(obj.id)} type="danger" size="small" shape="circle" icon="close"></Button>
                </Tooltip>
            </span>
        } else if (record == "1") {
            text = $('提现申请已拒绝');
        } else if (record == "2") {
            text = $('提现申请已通过');
        } else if (record == "3") {
            text = $('充值中');
        } else if (record == "4") {
            text = $('充值成功');
        } else if (record == "5") {
            text = $('充值成功');
        } else if (record == "6") {
            text = $('充值失败');
        } else if (record == "7") {
            text = $('提现失败');
        } else if (record == "8") {
            text = $('提现取消');
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
            dataSource: []
        }
        page = this;
    }
    cancelWithdrawal = (id) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/cancelWithdrawal",
            payload: {
                id
            }
        })
    }
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findTransactionHistory",
            payload: {
                beginTime: moment('00:00:00', 'HH:mm:ss').valueOf(),
                endTime: moment('23:59:59', 'HH:mm:ss').valueOf(),
                currency: "XBT",
                transactionType: null
            }
        })
    }
    findTransactionHistory = () => {
        const { form: { validateFields }, dispatch } = this.props;
        validateFields({ force: true }, (err, values) => {
            if (!err) {
                let obj = { ...values };
                obj.beginTime = obj.settleDate ? new Date(obj.settleDate[0]).getTime() : null;
                obj.endTime = obj.settleDate ? new Date(obj.settleDate[1]).getTime() : null;
                obj.transactionType = obj.transactionType === "0" ? null : obj.transactionType;
                delete obj.settleDate;
                dispatch({
                    type: "accountInfo/findTransactionHistory",
                    payload: {
                        ...obj,
                    },
                });
            }
        });
    }
    render() {
        let { form: { getFieldDecorator, getFieldsValue } } = this.props;
        let { transactionHistory } = this.props;
        console.log('这个是refresh哦，不要担心',   transactionHistory);
        return (
            <Card className="hover-shadow withdrawal">
                <Form layout="inline" style={{ marginBottom: 10 }}>
                    <FormItem label={$("日期")}>
                        {getFieldDecorator('settleDate', {
                            initialValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
                        })(
                            <RangePicker
                                showTime={{
                                    hideDisabledOptions: true,
                                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                                }}
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        )}
                    </FormItem>
                    <FormItem label={$("币种")} >
                        {getFieldDecorator('currency', {
                            initialValue: "XBT"
                        })(
                            <Select defaultValue="XBT" style={{ width: 80 }}>
                                <Option value="XBT">XBT</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label={$("交易类型")} >
                        {getFieldDecorator('transactionType', {
                            initialValue: "0"
                        })(
                            <Select style={{ width: 80 }}>
                                <Option value="0">{$('全部')}</Option>
                                <Option value="1">{$('充值')}</Option>
                                <Option value="2">{$('提现')}</Option>
                            </Select>
                        )}
                    </FormItem>
                    <Button onClick={this.findTransactionHistory} style={{ marginTop: 5 }} type="primary">查询</Button>
                </Form>
                <Table className="withdrawal" pagination={false} dataSource={transactionHistory} size="small" columns={columns} />
            </Card>
        )
    }
}

export default connect(({ accountInfo, loading }) => {
    const { currencyType, transactionHistory } = accountInfo;
    return {
        currencyType,
        transactionHistory,
        loading: !!loading.effects['accountInfo/cancelWithdrawal']
    }
})(
    Form.create()(Index)
)
