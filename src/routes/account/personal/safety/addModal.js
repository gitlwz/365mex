import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, MoveModal, Card, Input, Radio, Button, Divider } from "quant-ui";
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
class AddModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            type: "0"
        };
    }

    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleCaptal: false,
                title: ""
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { dispatch, form: { validateFields }, dataSource } = this.props;
        validateFields((error, values) => {
            if (!!error) return;
            if (values.verifyType === "0") {
                dispatch({
                    type: "accountInfo/update",
                    payload: {
                        ...values,
                        applyStatus: "6",
                        telephone: dataSource.telephone
                    }
                })
            } else {
                dispatch({
                    type: "accountInfo/update",
                    payload: {
                        ...values,
                        applyStatus: "6"
                    }
                })
            }
        })
    }
    onGetCaptcha = () => {  //获取验证码
        const { dispatch, form, dataSource } = this.props;
        dispatch({
            type: 'register/sendSms',
            payload: {
                number: dataSource.telephone,
                functionType: "authentication"
            }
        });
        let count = 59;
        this.setState({ count });
        this.interval = setInterval(() => {
            count -= 1;
            this.setState({ count });
            if (count === 0) {
                clearInterval(this.interval);
            }
        }, 1000);
    };
    checkConfirm = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('accountPassword')) {
            callback('两次输入的密码不匹配!');
        } else {
            callback();
        }
    };
    onChangeType = (e) => {
        this.setState({
            type: e.target.value
        })
    }
    render() {
        const { dataSource, loading, addVisibleCaptal, title, form: { getFieldDecorator } } = this.props;
        const { count } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 24 },
                md: { span: 24 },
                lg: { span: 10 },
                xl: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 24 },
                md: { span: 24 },
                lg: { span: 14 },
                xl: { span: 16 },
            },
        };
        const formItemLayout2 = {
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 24 },
            },
            style: {
                textAlign: "center"
            }
        };
        console.log(dataSource)
        return (
            <MoveModal
                visible={addVisibleCaptal}
                title={title}
                onCancel={this.onCancel}
                onOk={this.onOk}
                maskClosable={false}
                okText="提交"
                confirmLoading={loading}
                width="30%"
            >
                <Card className="hover-shadow" style={{ width: '100%' }} headStyle={{ height: 20 }}>
                    <Form>
                        <FormItem label={"资金密码"} {...formItemLayout}>
                            {getFieldDecorator('accountPassword', {
                                rules: [{ required: true, message: '请设置资金密码' }],
                            })(
                                <Input type="password" />
                            )}
                        </FormItem>
                        <FormItem label={"密码确认"} {...formItemLayout}>
                            {getFieldDecorator('passwordComf', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请确认密码！',
                                    },
                                    {
                                        validator: this.checkConfirm,
                                    },
                                ],
                            })(
                                <Input type="password" />
                            )}
                        </FormItem>
                        <Divider>授权</Divider>
                        <FormItem
                            {...formItemLayout2}
                        >
                            {getFieldDecorator('verifyType', {
                                initialValue: "0",
                            })(
                                dataSource.googleStatus === "0" && dataSource.telephone ?
                                    <RadioGroup onChange={this.onChangeType}>
                                        <Radio value="0">手机短信验证</Radio>
                                    </RadioGroup>
                                    : (!dataSource.telephone && dataSource.googleStatus === "1" ? <RadioGroup onChange={this.onChangeType}>
                                        <Radio value="1">谷歌两步验证</Radio>
                                    </RadioGroup> : <RadioGroup onChange={this.onChangeType}>
                                            <Radio value="0">手机短信验证</Radio>
                                            <Radio value="1">谷歌两步验证</Radio>
                                        </RadioGroup>)

                            )}
                        </FormItem>
                        <FormItem label={"验证码"} {...formItemLayout}>
                            {getFieldDecorator('verifyCode', {
                                rules: [{ required: true, message: '请输入验证码' }],
                            })(
                                this.state.type === "0" ?
                                    <div>
                                        <Input style={{ width: 100, marginRight: 10 }} />
                                        <Button
                                            size="default"
                                            disabled={count}
                                            className={"register-getCaptcha"}
                                            onClick={this.onGetCaptcha}
                                        >
                                            {count ? `${count} s` : '获取验证码'}
                                        </Button>
                                    </div> :
                                    <div>
                                        <Input style={{ width: 100, marginRight: 10 }} />
                                    </div>

                            )}
                        </FormItem>
                    </Form>
                </Card>
            </MoveModal>
        )
    }
}
export default connect(({ accountInfo, loading }) => {
    const { addVisibleCaptal, title, dataSource } = accountInfo
    return {
        addVisibleCaptal,
        title,
        dataSource,
        loading: !!loading.effects['accountInfo/update']
    }
})(
    Form.create()(AddModal)
)
