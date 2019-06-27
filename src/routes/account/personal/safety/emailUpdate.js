import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, MoveModal, Card, Input, Button } from "quant-ui";
const FormItem = Form.Item;
class AddModal extends Component {
    state = {
        count: 0,
    };
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleEmail: false
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { dispatch, form: { validateFields } } = this.props;
        validateFields((error, values) => {
            if (!!error) return;
                dispatch({
                    type: "accountInfo/updateEmail",
                    payload: values
                })
        })
    }
    onGetCaptcha = () => {  //获取验证码
        const { dispatch, form } = this.props;
        dispatch({
            type: 'register/sendEmail',
            payload:{
                number: form.getFieldValue('email'),
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
    render() {
        const { loading, addVisibleEmail, title, form: { getFieldDecorator } } = this.props;
        const { count } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 24 },
                md: { span: 24},
                lg: { span: 10},
                xl: { span: 8},
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 24 },
                md: { span: 24},
                lg: { span: 14},
                xl: { span: 16},
            },
        };
        const formItemLayout2 = {
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 24 },
            },
            style: {
                textAlign:"center"
            }
        };
        return (
            <MoveModal
                visible={addVisibleEmail}
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
                        <FormItem label={"邮箱"} {...formItemLayout}>
                            {getFieldDecorator('email', {
                                rules: [{ 
                                    required: true, 
                                    message: '请时输入手机号码' },
                                    {
                                        type: 'email',
                                        message: '邮箱地址格式错误！',
                                    },],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label={"验证码"} {...formItemLayout}>
                            {getFieldDecorator('verifyCode', {
                                rules: [{ required: true, message: '邮箱验证码' }],
                            })(
                                <div>
                                    <Input style={{width:100,marginRight:10}}/>
                                    <Button
                                    size="default"
                                    disabled={count}
                                    className={"register-getCaptcha"}
                                    onClick={this.onGetCaptcha}
                                >
                                    {count ? `${count} s` : '获取验证码'}
                                </Button>
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
    const { addVisibleEmail, title } = accountInfo
    return {
        addVisibleEmail,
        title,
        loading: !!loading.effects['accountInfo/updateEmail']
    }
})(
    Form.create()(AddModal)
)
