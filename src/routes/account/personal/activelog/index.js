import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { language, Form, DatePicker, Collapse, Select, Card, Row, Col, Table, Button } from 'quant-ui';
import moment from 'moment';
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
let $ = language.getLanguageData;
const Option = Select.Option;
const Panel = Collapse.Panel;
const columns = [{
    title: $('日志类型'),
    dataIndex: 'operationType',
    key: 'operationType',
    render: (record) => {
        switch (record) {
            case "1":
                return <span>{$('注册')}</span>
                break;
            case "2":
                return <span>{$('登录')}</span>
                break;
            case "3":
                return <span>{$('重置密码')}</span>
                break;
            case "4":
                return <span>{$('邮箱验证')}</span>
                break;
            case "5":
                return <span>{$('修改邮箱')}</span>
                break;
            case "6":
                return <span>{$('修改邮箱')}</span>
                break;
            case "7":
                return <span>{$('设置手机绑定')}</span>
                break;
            case "8":
                return <span>{$('修改手机绑定')}</span>
                break;
            case "9":
                return <span>{$('google 绑定')}</span>
                break;
            case "10":
                return <span>{$('google 解除绑定')}</span>
                break;
            case "11":
                return <span>{$('设置资金密码')}</span>
                break;
            case "19":
                return <span>{$('登出')}</span>
                break;
            default:
                return <span>{$('未定义类型')}</span>
                break;
        }
    }
}, {
    title: $('操作时间'),
    dataIndex: 'operateTime',
    key: 'operateTime',
    render: (record, obj, index) => {
        return <span>{moment(record).format("YYYY-MM-DD a HH:mm:ss")}</span>
    }
}, {
    title: $('操作人'),
    dataIndex: 'userId',
    key: 'userId',
}];
class Index extends Component {
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findUserOperationLog",
            beginTime: moment('00:00:00', 'HH:mm:ss').valueOf(),
            endTime: moment('23:59:59', 'HH:mm:ss').valueOf(),
        })
    }
    findUserOperationLog = () => {
        const { form: { validateFields }, dispatch } = this.props;
        validateFields({ force: true }, (err, values) => {
            if (!err) {
                let obj = { ...values };
                obj.beginTime = obj.settleDate ? new Date(obj.settleDate[0]).getTime() : null;
                obj.endTime = obj.settleDate ? new Date(obj.settleDate[1]).getTime() : null;
                delete obj.settleDate;
                dispatch({
                    type: "margin/findUserOperationLog",
                    payload: {
                        ...obj,
                    },
                });
            }
        });
    }
    render() {
        let { form: { getFieldDecorator, getFieldsValue }, activeLogData } = this.props;
        return (
            <Card className="hover-shadow noties">
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
                    <Button onClick={this.findUserOperationLog} style={{ marginTop: 5 }} type="primary">查询</Button>
                </Form>
                <Table className="withdrawal" size="small" dataSource={activeLogData} columns={columns} />
            </Card>
        )
    }
}

export default connect(({ accountInfo }) => {
    const { activeLogData } = accountInfo;
    return {
        activeLogData
    }
})(
    Form.create()(Index)
)
