import React, { Component } from 'react'
import { connect } from 'dva';
import { Button, Row, Col, Card, Form, Input, language } from 'quant-ui';
import "./index.less";
let { getLanguageData } = language;
let $ = getLanguageData;
const FormItem = Form.Item;
class Index extends Component {
    state = {
        count: 0,
        visible: false,
        help: '',
    };
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
    handleSubmit = e => {
        e.preventDefault();
        const { form: { validateFields }, userInfo } = this.props;
        validateFields({ force: true }, (err, values) => {
            if (!err) {
                userInfo(values,"1");//邮箱验证
            }
        });
    };
    render() {
        const { form, submitting } = this.props;
        const { getFieldDecorator } = form;
        const { count } = this.state;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 8 },
        };
        const buttonItemLayout  = {
            wrapperCol: { span: 8, offset: 3 },
        };
        return (
            <Card className="hover-shadow userInfo">
                <div className="titleLine">
                    <h4>{$('邮箱验证')}</h4>
                </div>
                <div className="line">
                    <p>{$('请到您的收件箱查看激活邮件，并点击其中的激活链接进行激活。如您未收到邮件，请点击「发送验证邮件」按钮重试。')}</p>
                </div>
                <Row>
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem label={$('电子邮箱地址')} {...formItemLayout}>
                            {getFieldDecorator('email', {
                                rules: [
                                    {
                                        required: true,
                                        message: $('请输入邮箱地址！'),
                                    },
                                    {
                                        type: 'email',
                                        message: $('邮箱地址格式错误！'),
                                    },
                                ],
                            })(<Input size="default" placeholder={$("邮箱")} />)}
                        </FormItem>
                        <FormItem label={$("验证码")} {...formItemLayout}>
                            <Row gutter={8}>
                                <Col span={16}>
                                    {getFieldDecorator('verifyCode', {
                                        rules: [
                                            {
                                                required: true,
                                                message: $('请输入验证码！'),
                                            },
                                        ],
                                    })(<Input size="default" placeholder={$("验证码")} />)}
                                </Col>
                                <Col span={8}>
                                    <Button
                                        size="default"
                                        disabled={count}
                                        className={"register-getCaptcha"}
                                        onClick={this.onGetCaptcha}
                                    >
                                        {count ? `${count} s` : $('获取验证码')}
                                    </Button>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem {...buttonItemLayout}>
                            <Button
                                size="default"
                                loading={submitting}
                                className={"register-submit"}
                                type="primary"
                                htmlType="submit"
                            >
                                {$('提交邮箱验证')}
                        </Button>
                        </FormItem>
                    </Form>
                </Row>
            </Card>
        )
    }
}

export default connect(({ safeSetting, loading }) => {
    return {
        submitting: !!loading.effects["accountInfo/update"],
    }
})(Form.create()(Index))
