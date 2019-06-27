import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Row, Col, Popover, Progress, Tabs, language } from 'quant-ui';
import { Link } from 'dva/router';
import './forgetPsw.less';
// import { getUserUserInfo } from '@/utils/authority';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
let { getLanguageData } = language;
let $ = getLanguageData;

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
            tabs: 'email',
            type: 0,
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
        // this.props.dispatch({
        //     type: 'register/findUserInfo',
        // })

    }
    componentWillUnmount() {  //清除倒计时
        clearInterval(this.interval);
        this.props.dispatch({
            type:'accountInfo/resetType',
            payload: {}
        })
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
        // let type = this.state.type;
        // console.log(type);
        // if(type < 2) {
        //     type+=1
        //     this.setState({
        //         type
        //     })
        //     return
        // }
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
        if(!value) {
            callback($('确认密码'));
        }else if (value && value !== form.getFieldValue('password')) {
            callback($('两次输入的密码不匹配'));
        } else {
            callback();
        }
    };

    // checkPassword = (rule, value, callback) => {
    //     if (!value) {
    //         // this.setState({
    //         //     help: '请输入密码！',
    //         //     visible: !!value,
    //         // });
    //         callback('请输入密码！');
    //     } else {
    //         // this.setState({
    //         //     help: '',
    //         // });
    //         // const { visible } = this.state;
    //         // if (!visible) {
    //         //     this.setState({
    //         //         visible: !!value,
    //         //     });
    //         // }
    //         if (value.length < 8 || value.length > 20) {
    //             callback('请输入适合的长度');
    //         } else {
    //             const { form } = this.props;
    //             if (value) {
    //                 form.validateFields(['confirm'], { force: true });
    //             }
    //             callback();
    //         }
    //     }
    // };

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

    tabsChange = (value) => {
        let { tabs } = this.state
        if( value == tabs ) {
            return false;
        }
        this.props.form.resetFields();
        this.setState({
            tabs: value
        })
    }

    onGetCaptcha =() => {
        const { dispatch, form } = this.props;
        let flag = false, formKey = this.state.tabs == 'email' ? 'email' : 'telephone';
        form.validateFields([formKey], (err, value) => {
            if(err) {
                flag = true;
            }
        })
        if(flag) { return}
        if ( this.state.tabs == 'email') {
            dispatch({
                type: 'register/sendEmail',
                payload: {
                    number: form.getFieldValue('email'),
                    functionType: "changePassword"
                }
            });
        } else {
            dispatch({
                type: 'register/sendSms',
                payload: {
                    number: form.getFieldValue('telephone'),
                    functionType: "changePassword",
                    templateCode:"261030",
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
    }

    // checkConfirm = (rule, value, callback) => {
    //     const { form } = this.props;
    //     if (value && value !== form.getFieldValue('password')) {
    //         callback('两次输入的密码不匹配!');
    //     } else {
    //         callback();
    //     }
    // };

    checkPassword = (rule, value, callback) => {
        if(!value) {
            callback($('请输入密码'));
        } else if (value.length < 8 || value.length > 20) {
            callback($('请输入适合的长度'));
        } else {
            const { form } = this.props;
            if (value) {
                form.validateFields(['confirmPassword'], { force: true });
            }
            callback();
        }
        
    };


    validatorVerifyCode(rule, value, callback) {
        // const { form } = this.props;
        let reg = new RegExp(/^\d{6}$/);
        if (!value) {
            callback($('请输入验证码'));
        } else if(value.length!=6 || !reg.test(value)) {
            callback($('验证码为六位数字'));
        } else {
            callback();
        }
    }

    render() {
        const { form, submitting, dataSource, type, needIdentificationId, needGoogleCode,hash } = this.props;
        const { getFieldDecorator } = form;
        const { count, help, visible, tabs, } = this.state;
        let titleText = type < 2 ? $("重置密码") : $("重置密码-设置新密码");
        let buttonText = type < 2 ? $("下一步") : $("确认");
        // let userID = getUserUserInfo();
        return (
            <div className='js-login'>
            <div className="js-update-password">
               <Row className="updatepsd-title">
                    <Col className="updatepsd-title-text" span={ type == 0 ? 10 : 24}>
                        <h2>{titleText}</h2>
                    </Col>
                    {type == 0 ? <Col className="updatepsd-tabs" span={14}>
                        <Tabs onChange={this.tabsChange} defaultActiveKey="email">
                            <TabPane  key="mobile" tab={$("手机修改")} />
                            <TabPane  key="email" tab={$("邮箱修改")} />
                        </Tabs>
                    </Col> : ''
                    }
                    
                </Row>
                <Row className="updatepsd-container">
                    <Form onSubmit={this.handleSubmit}>
                        
                        { type == 0 && tabs == 'email' ? 
                            <FormItem>
                                {getFieldDecorator('email', {
                                    rules: [
                                        {
                                            required: true,
                                            message: $('输入有效的邮箱地址'),
                                        },
                                        {
                                            type: 'email',
                                            message: $('邮箱地址格式错误'),
                                        },
                                    ],
                                })(<Input size="large" placeholder={$("输入有效的邮箱地址")} />)}
                            </FormItem> :  tabs == 'mobile' && type == 0  ?
                            <FormItem>
                                {getFieldDecorator('telephone', {
                                    rules: [
                                        {
                                            required: true,
                                            message: $('请输入正确的手机号'),
                                        },
                                        {
                                            pattern: /^1\d{10}$/,
                                            message: $('手机号格式错误'),
                                        },
                                    ],
                                })(<Input size="large" placeholder={$("请输入正确的手机号")} />)}
                            </FormItem> : ''}
                            { type == 1 && needGoogleCode ? <FormItem>
                                {getFieldDecorator('googleCode', {
                                    rules: [
                                        {
                                            required: true,
                                            message: $('请输入Google验证码'),
                                        },
                                    ],
                                })(<Input size="large" placeholder={$("请输入Google验证码")} />)}
                            </FormItem> : ''}

                            { type == 1 && needIdentificationId ? <FormItem>
                                {getFieldDecorator('identificationId', {
                                    rules: [
                                        {
                                            required: true,
                                            message: $('请输入身份证ID或者护照ID'),
                                        },
                                    ],
                                })(<Input size="large" placeholder={$("请输入身份证ID或者护照ID")} />)}
                            </FormItem> : ''}
                            { type == 2 ? <FormItem>
                                {getFieldDecorator('password', {
                                    rules: [
                                        {
                                            required: true,
                                            message: $('8~20位密码，区分大小写'),
                                            validator: this.checkPassword
                                        },
                                    ],
                                })(<Input type="password" size="large" placeholder={$("8~20位密码，区分大小写")} />)}
                            </FormItem> : ''}
                            { type == 2 ? <FormItem>
                                {getFieldDecorator('confirmPassword', {
                                    rules: [
                                        {
                                            required: true,
                                            // message: '请再次输入密码',
                                            validator: this.checkConfirm
                                        },
                                    ],
                                })(<Input type="password" size="large" placeholder={$("确认密码")} />)}
                            </FormItem> : ''}
                        { type == 0 ?<FormItem>
                            <Row gutter={8}>
                                <Col span={16}>
                                    {getFieldDecorator('verifyCode', {
                                        rules: [
                                            {validator: this.validatorVerifyCode}
                                        ],
                                    })(<Input size="large" placeholder={$("验证码")} />)}
                                </Col>
                                <Col span={8}>
                                    <Button
                                        size="large"
                                        disabled={count}
                                        className={"updatepsd-send"}
                                        onClick={this.onGetCaptcha}
                                        style={ count ? {borderColor: '#d9d9d9', color: '#d9d9d9'} : {borderColor: '#5D97FF', color: '#5D97FF'}}
                                    >
                                        {count ? `${count} s` : $('发送') + ' '}
                                    </Button>
                                </Col>
                            </Row>
                        </FormItem> : ''}
                        <FormItem>
                            <Button
                                size="large"
                                loading={submitting}
                                className={"updatepsd-submit"}
                                type="primary"
                                htmlType="submit"
                            >
                                {buttonText}
                            </Button>
                        </FormItem>
                    </Form>
                </Row>
                <Row className="go-back-login">
                    <Link className={"register-login"} to="/user/login">
                        {$('返回登录')}
                    </Link>
                </Row>
            </div>
            </div>
        );
    }
}
export default connect(({ register, loading, accountInfo}) => {
    const { dataSource } = register;
    const {type, needGoogleCode, needIdentificationId, hash} = accountInfo;
    return {
        register,
        dataSource,
        type,
        hash,
        needIdentificationId,
        needGoogleCode,
        submitting: loading.effects['accountInfo/updatePassword'],
    }
})(Form.create()(ForgetPsw))