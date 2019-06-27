import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, MoveModal, Card, Input, Radio, Button, Divider } from "quant-ui";
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
class UpdatePas extends Component {
    state = {
        count: 0,
    };
    componentWillReceiveProps = (nextProps) => {
        if (this.props.addVisible !== nextProps.addVisible) {
            this.props.form.resetFields();
        }
    }
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisible: false
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { dispatch, form: { validateFields } } = this.props;
        validateFields((error, values) => {
            if (!!error) return;
            dispatch({
                type: "accountInfo/updatePassword",
                payload: values
            })
        })
    }
    onGetCaptcha = () => {  //获取验证码
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
        const { loading, addVisible, form: { getFieldDecorator }, currentData } = this.props;
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
        return (
            <MoveModal
                visible={addVisible}
                title={"修改密码"}
                onCancel={this.onCancel}
                onOk={this.onOk}
                maskClosable={false}
                okText="提交"
                confirmLoading={loading}
                width="30%"
            >
                <Card className="hover-shadow" style={{ width: '100%' }} headStyle={{ height: 20 }}>
                    <Form>
                        <FormItem label={"旧密码"} {...formItemLayout}>
                            {getFieldDecorator('oldPassword', {
                                rules: [{ required: true, message: '请输入旧密码' }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label={"新密码"} {...formItemLayout}>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入新密码' }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label={"密码确认"} {...formItemLayout}>
                            {getFieldDecorator('passwordComf', {
                                rules: [{ required: true, message: '请再次输入新密码' }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                    </Form>
                </Card>
            </MoveModal>
        )
    }
}
export default connect(({ accountInfo, loading }) => {
    const { addVisible } = accountInfo;
    return {
        addVisible,
        loading: !!loading.effects['accountInfo/updatePassword']
    }
})(
    Form.create()(UpdatePas)
)
