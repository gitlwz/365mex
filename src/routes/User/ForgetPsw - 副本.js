import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Row, Col, Popover, Progress, Tabs } from 'quant-ui';
// import { getUserUserInfo } from '@/utils/authority';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

const passwordStatusMap = {
    ok: <div className={"register-success"}>强度：强</div>,
    pass: <div className={"register-warning"}>强度：中</div>,
    poor: <div className={"register-error"}>强度：太短</div>,
};

const passwordProgressMap = {
    ok: 'success',
    pass: 'normal',
    poor: 'exception',
};

class ForgetPsw extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            visible: false,
            help: '',
            prefix: '86',
        };
        this.firstShow = true;
    }
    componentDidMount() {
        if (this.firstShow) {
            const { dispatch } = this.props;
            dispatch({
                type: "login/getPublicKey",
            })
            this.firstShow = false;
        }
    }
    componentWillUnmount() {  //清除倒计时
        clearInterval(this.interval);
    }

    onGetCaptcha = () => {  //获取验证码
        const { dispatch, form } = this.props;
        if (form.getFieldValue('userID').indexOf("@") !== -1) {
            dispatch({
                type: 'register/sendEmail',
                payload: {
                    number: form.getFieldValue('userID'),
                    functionType: "changePassword"
                }
            });
        } else {
            dispatch({
                type: 'register/sendSms',
                payload: {
                    number: form.getFieldValue('userID'),
                    functionType: "changePassword"
                }
            });
        }
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

    getPasswordStatus = () => {
        const { form } = this.props;
        const value = form.getFieldValue('password');
        if (value && value.length > 9) {  //高
            return 'ok';
        }
        if (value && value.length > 5) {    //中
            return 'pass';
        }
        return 'poor';                      //低
    };

    handleSubmit = e => {
        e.preventDefault();
        const { form: { validateFields }, dispatch } = this.props;
        validateFields({ force: true }, (err, values) => {
            const { prefix } = this.state;
            if (!err) {
                dispatch({
                    type: 'accountInfo/updatePassword',
                    payload: {
                        ...values,
                        prefix,
                    },
                });
            }
        });
    };

    checkConfirm = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次输入的密码不匹配!');
        } else {
            callback();
        }
    };

    checkPassword = (rule, value, callback) => {
        if (!value) {
            this.setState({
                help: '请输入密码！',
                visible: !!value,
            });
            callback('error');
        } else {
            this.setState({
                help: '',
            });
            const { visible } = this.state;
            if (!visible) {
                this.setState({
                    visible: !!value,
                });
            }
            if (value.length < 6) {
                callback('error');
            } else {
                const { form } = this.props;
                if (value) {
                    form.validateFields(['confirm'], { force: true });
                }
                callback();
            }
        }
    };

    changePrefix = value => {
        this.setState({
            prefix: value,
        });
    };

    renderPasswordProgress = () => {
        const { form } = this.props;
        const value = form.getFieldValue('password');
        const passwordStatus = this.getPasswordStatus();
        return value && value.length ? (
            <div className={`register-progress-${passwordStatus}`}>
                <Progress
                    status={passwordProgressMap[passwordStatus]}
                    className={"register-progress"}
                    strokeWidth={6}
                    percent={value.length * 10 > 100 ? 100 : value.length * 10}
                    showInfo={false}
                />
            </div>
        ) : null;
    };

    render() {
        const { form, submitting } = this.props;
        const { getFieldDecorator } = form;
        const { count, help, visible } = this.state;
        // let userID = getUserUserInfo();
        return (
            <div className={"register"}>
                <Tabs defaultActiveKey="1" tabBarStyle={{textAlign:"center"}}>
                    <TabPane tab="重置密码" key="1">
                        <Form onSubmit={this.handleSubmit}>
                            <FormItem>
                                {getFieldDecorator('userID', {
                                    // initialValue: userID.email || userID.telephone,
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入邮箱地址或手机号！',
                                        },
                                    ],
                                })(<Input size="large" placeholder="输入邮箱或手机号" />)}
                            </FormItem>
                            <FormItem>
                                <Row gutter={8}>
                                    <Col span={16}>
                                        {getFieldDecorator('verifyCode', {
                                            rules: [
                                                {
                                                    required: true,
                                                    message: '请输入验证码！',
                                                },
                                            ],
                                        })(<Input size="large" placeholder="验证码" />)}
                                    </Col>
                                    <Col span={8}>
                                        <Button
                                            size="large"
                                            disabled={count}
                                            className={"register-getCaptcha"}
                                            onClick={this.onGetCaptcha}
                                        >
                                            {count ? `${count} s` : '获取验证码'}
                                        </Button>
                                    </Col>
                                </Row>
                            </FormItem>
                            <FormItem help={help}>
                                <Popover
                                    content={
                                        <div style={{ padding: '4px 5px' }}>
                                            {passwordStatusMap[this.getPasswordStatus()]}
                                            {this.renderPasswordProgress()}
                                            <div style={{ marginTop: 10 }}>
                                                请至少输入 6 个字符。请不要使用容易被猜到的密码。
                                    </div>
                                        </div>
                                    }
                                    overlayStyle={{ width: 240 }}
                                    placement="right"
                                    visible={visible}
                                >
                                    {getFieldDecorator('password', {
                                        rules: [
                                            {
                                                validator: this.checkPassword,
                                            },
                                        ],
                                    })(<Input size="large" type="password" placeholder="至少6位密码，区分大小写" />)}
                                </Popover>
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('confirm', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请确认密码！',
                                        },
                                        {
                                            validator: this.checkConfirm,
                                        },
                                    ],
                                })(<Input size="large" type="password" placeholder="确认密码" />)}
                            </FormItem>
                            <FormItem>
                                <Button
                                    size="large"
                                    loading={submitting}
                                    className={"register-getCaptcha"}
                                    type="primary"
                                    htmlType="submit"
                                >
                                    确认
                        </Button>
                            </FormItem>
                        </Form>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
export default connect(({ register, loading }) => {
    return {
        register,
        submitting: loading.effects['register/submit'],
    }
})(Form.create()(ForgetPsw))