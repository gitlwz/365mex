import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Input, Button, Select, Row, Col, Popover, Progress, language, Checkbox } from 'quant-ui';
import { getCountry } from '@/utils/countryCode';
let { getLanguageData, getCurrentLanguage } = language;
const currentLanguage = getCurrentLanguage();
let $ = getLanguageData;
const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
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

class Register extends Component {
    state = {
        count: 0,
        visible: false,
        help: '',
        checked: true
    };

    componentWillUnmount() {  //清除倒计时
        clearInterval(this.interval);
    }

    componentWillReceiveProps(nextProps) {
        if( nextProps.tabs!=this.props.tabs && nextProps.tabs == 'mobile') {
            this.props.form.resetFields();
            this.setState({
                visible: false,
                help: '',
                checked: true
            })
        }
    }

    onGetCaptcha = () => {  //获取验证码
        const { dispatch, form } = this.props;
        let flag = false;
        form.validateFields(['email'], (err, value) => {
            if(err) {
                flag = true;
            }
        })
        if(flag) { return}
        dispatch({
            type: 'register/sendEmail',
            payload:{
                number: form.getFieldValue('email'),
                functionType: "register"
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
            if (!err) {
                dispatch({
                    type: 'register/submit',
                    payload: {
                        ...values,
                    },
                });
            }
        });
    };

    checkConfirm = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback($('两次输入的密码不匹配'));
        } else {
            callback();
        }
    };

    checkPassword = (rule, value, callback) => {
        if (!value) {
            // this.setState({
            //     help: $('请输入密码'),
            //     visible: !!value,
            // });
            callback($('请输入密码'));
        } else {
            // this.setState({
            //     help: '',
            // });
            // const { visible } = this.state;
            // if (!visible) {
            //     this.setState({
            //         visible: !!value,
            //     });
            // }
            if (value.length < 8 || value.length > 20) {
                callback($('请输入适合的长度'));
            } else {
                const { form } = this.props;
                if (value) {
                    form.validateFields(['confirm'], { force: true });
                }
                callback();
            }
        }
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
    renderCountry = () => {
        let arr = [];
        arr = getCountry().map((item) => {
            return <Option key={item.en + "email"} value={item.en}>{item.cn}</Option>
        })
        return arr;
    }

    handleCheck = (e) => {
        this.setState({
            checked: e.target.checked
        })
        // console.log(e.target.checked);
    }

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
        const { form, submitting } = this.props;
        const { getFieldDecorator } = form;
        const { count, help, visible, checked } = this.state;
        return (
            <div className={"register"}>
                <h2 className="js-register-title">{$("注册")}</h2>
                <Form onSubmit={this.handleSubmit}>
                    {/* <FormItem>
                        {getFieldDecorator('countryCode', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择国家地区',
                                },
                            ],
                        })(
                            <Select
                                showSearch
                                placeholder="请选择国家地区"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.renderCountry()}
                            </Select>
                        )}
                    </FormItem> */}
                    <FormItem>
                        {getFieldDecorator('email', {
                            rules: [
                                {
                                    required: true,
                                    message: $('输入邮箱地址'),
                                },
                                {
                                    type: 'email',
                                    message: $('邮箱地址格式错误'),
                                },
                            ],
                        })(<Input placeholder={$("输入邮箱地址")} />)}
                    </FormItem>
                    <FormItem>
                        <Row gutter={8}>
                            <Col span={16}>
                                {getFieldDecorator('verifyCode', {
                                    rules: [
                                        {validator: this.validatorVerifyCode}
                                    ],
                                })(<Input placeholder={$('请输入验证码')} />)}
                            </Col>
                            <Col span={8}>
                                <Button
                                    disabled={count}
                                    className={"register-getCaptcha"}
                                    onClick={this.onGetCaptcha}
                                    style={ count ? {borderColor: '#d9d9d9', color: '#d9d9d9'} : {borderColor: '#5D97FF', color: '#5D97FF'}}
                                >
                                    {count ? `${count} s` : $('发送') + ' '}
                                </Button>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        {/* <Popover
                            content={
                                <div style={{ padding: '4px 0' }}>
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
                        > */}
                        {getFieldDecorator('password', {
                            rules: [
                                {
                                    validator: this.checkPassword,
                                },
                            ],
                        })(<Input type="password"  placeholder={$("8~20位密码，区分大小写")}/>)}
                        {/* </Popover> */}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('confirm', {
                            rules: [
                                {
                                    required: true,
                                    message: $('确认密码'),
                                },
                                {
                                    validator: this.checkConfirm,
                                },
                            ],
                        })(<Input type="password" placeholder={$('确认密码')} />)}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('inviteCode', {
                            initialValue: this.props.inviteCode,
                        })(<Input placeholder={$('邀请码(选填)')} />)}
                    </FormItem>
                    {/* <Form.Item className="js-checkbox-item">
                        {getFieldDecorator('agreement', {
                            valuePropName: 'checked',
                            initialValue: false,
                        })(
                            
                        )}
                    </Form.Item> */}
                    <Row style={{marginBottom: '20px'}}>
                        <Col>
                            <Checkbox checked={checked} onChange={this.handleCheck}>
                                {$("我已经阅读并同意")} {currentLanguage !='zh_CN' ? <br /> : ''} <a href="" className="js-register-file" style={{paddingLeft: currentLanguage =='zh_CN' ? '5px' :'24px' }}>{$("用户协议及法律声明")}</a>
                            </Checkbox>
                        </Col>
                    </Row>
                    <FormItem>
                        <Button
                            loading={submitting}
                            className={"register-submit"}
                            type="primary"
                            htmlType="submit"
                            disabled={!checked}
                        >
                            {$('注册') + ' '}
                        </Button>
                    </FormItem>
                    <div className="js-have-register">
                        <span style={{color: '#B3BED5'}}>{$('已经注册？')}</span>
                        <Link className={"register-login"} to="/user/login">
                            {$('登录')}
                        </Link>
                    </div>
                    
                </Form>
            </div>
        );
    }
}
export default connect(({ register, loading }) => {
    return {
        register,
        submitting: loading.effects['register/submit'],
    }
})(Form.create()(Register))