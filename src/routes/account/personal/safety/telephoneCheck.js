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
                addVisibleTel: false
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { dispatch, form: { validateFields } } = this.props;
        validateFields((error, values) => {
            if (!!error) return;
                values.telephoneCheck = true;
                dispatch({
                    type: "accountInfo/update",
                    payload: values
                })
        })
    }
    onGetCaptcha = () => {  //获取验证码
        const { dispatch, form } = this.props;
        dispatch({
            type: 'register/sendSms',
            payload:{
                number: form.getFieldValue('telephone'),
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
        const { loading, addVisibleTel, title, form: { getFieldDecorator } } = this.props;
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
                visible={addVisibleTel}
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
                        <FormItem label={"手机号"} {...formItemLayout}>
                            {getFieldDecorator('telephone', {
                                rules: [{ required: true, message: '请时输入手机号码' }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label={"短信验证码"} {...formItemLayout}>
                            {getFieldDecorator('verifyCode', {
                                rules: [{ required: true, message: '手机短信验证码' }],
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
    const { addVisibleTel, title } = accountInfo
    return {
        addVisibleTel,
        title,
        loading: !!loading.effects['accountInfo/update']
    }
})(
    Form.create()(AddModal)
)
