import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { Button, DatePicker, Row, Col, Card, Input, copy, language, message, QRCode, Table, Divider, Form, Utils } from 'quant-ui';
import moment from 'moment';
import { getCurrencyType } from '@/utils/utils'
const currency = Utils.currency;
const RangePicker = DatePicker.RangePicker;
let { getLanguageData } = language;
const FormItem = Form.Item;
let $ = getLanguageData;
const rakeBackType = { "1": "邀请返币", "2": "交易返币", };

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adviceCode: "",
            adviceAddress: "",
            registeredRakeBack:""
        }
    }
    findUserInvitation = () => {
        const { form: { validateFields }, dispatch } = this.props;
        validateFields({ force: true }, (err, values) => {
            if (!err) {
                let obj = {
                    beginTime:values.settleDate[0].valueOf(),
                    endTime:values.settleDate[1].valueOf(),
                    firstAdvicer:values.firstAdvicer,
                }
                dispatch({
                    type: "accountInfo/findUserInvitation",
                    payload: {
                        ...obj
                    }
                });
            }
        });
    }
    componentWillReceiveProps = (props) => {
        const { dataSource } = props;
        if (dataSource) {
            this.setState({
                registeredRakeBack:dataSource.registeredRakeBack,
                adviceCode: dataSource.applicationId,
                adviceAddress: document.location.host + "/user/register/" + dataSource.applicationId
            })
        }
    }
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findUserInfo",
        });
    }
    copyClick = (value) => {
        copy(value);
        message.success($('复制成功'));
    }
    render() {
        const { form: { getFieldDecorator }, myAdviceDataList, currencyType } = this.props;
        let calculateS = Math.pow(10, getCurrencyType().tick);
        const columns = [{
            title: '返币类型',
            dataIndex: 'rakeBackType',
            key: 'rakeBackType',
            render: (record, obj, index) => {
                return <span>{rakeBackType[record]}</span>
            }
        }, {
            title: '一级被邀请人',
            dataIndex: 'beuserId',
            key: 'beuserId',
        }, {
            title: '次级邀请次数(限3级)',
            dataIndex: 'beuserCount',
            key: 'beuserCount',
        }, {
            title: `一级返币(${getCurrencyType().key})`,
            dataIndex: 'firstInvitationValue',
            key: 'firstInvitationValue',
            render: (text) => {
                return text * getCurrencyType().value/100000000
            }
        }, {
            title: `次级返币(${getCurrencyType().key})`,
            dataIndex: 'secondInvitationValue',
            key: 'secondInvitationValue',
            render: (text) => {
                return text * getCurrencyType().value/100000000
            }
        }, {
            title: '时间',
            dataIndex: 'transactionTime',
            key: 'transactionTime',
            render: (record, obj, index) => {
                return <span>{moment(record).format("lll")}</span>
            }
        }];
        console.log('asdasdasdsadasdasdasdsada', getCurrencyType().value/100000000);
        return (
            <Card className="hover-shadow advicePage">
                <Row type="flex" justify="start">
                    <Col span={3}>
                        <span>我的邀请码: </span>
                    </Col>
                    <Col span={6}>
                        <Input disabled value={this.state.adviceCode}></Input>
                    </Col>
                    <Col offset={1} span={2}>
                        <Button onClick={() => this.copyClick(this.state.adviceCode)}>复制</Button>
                    </Col>
                </Row>
                <Row type="flex" justify="start">
                    <Col span={3}>
                        <span>我的推广链接: </span>
                    </Col>
                    <Col span={6}>
                        <Input disabled value={this.state.adviceAddress}></Input>
                    </Col>
                    <Col offset={1} span={2}>
                        <Button onClick={() => this.copyClick(this.state.adviceAddress)}>复制</Button>
                    </Col>
                </Row>
                <Row type="flex" justify="start">
                    <Col span={3}>
                        <span>我的推广二维码: </span>
                    </Col>
                    <Col>
                        <QRCode value={this.state.adviceAddress}></QRCode>
                    </Col>
                </Row>
                <Row type="flex" justify="start">
                    <Col span={3}>
                        <span>我的返币: </span>
                    </Col>
                    <Col>
                        <span>(我的注册返币: {currency(parseInt(((this.state.registeredRakeBack || 0) * getCurrencyType().value / 100000000) * calculateS) / calculateS, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key})</span>
                    </Col>
                </Row>
                <Divider />
                <Form layout="inline" style={{ marginBottom: 10 }}>
                    <FormItem label={$("日期")}>
                        {getFieldDecorator('settleDate', {
                            initialValue: [moment(new Date(), "YYYY-MM-DD"), moment(new Date(), "YYYY-MM-DD")],
                        })(
                            <RangePicker width="100%"
                                placeholder={[new Date().toString(), new Date().toString()]}
                            />
                        )}
                    </FormItem>
                    <FormItem label={$("一级被邀请人")}>
                        {getFieldDecorator('beuserId', {
                        })(
                            <Input></Input>
                        )}
                    </FormItem>
                    <FormItem >
                        <Button 
                        onClick={this.findUserInvitation}
                        style={{ marginTop: 5 }} 
                        htmlType="submit"
                        type="primary">查询</Button>
                    </FormItem>
                </Form>
                <Table size="small" dataSource={myAdviceDataList} columns={columns} />
            </Card>
        )
    }
}

export default connect(({ accountInfo, margin }) => {
    const { dataSource, myAdviceDataList } = accountInfo;
    const { currencyType } = margin;
    return {
        dataSource,
        myAdviceDataList,
        currencyType
    }
})(
    Form.create()(Index)
)
