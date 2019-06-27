import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Form, Input, Button, Select, Row, Col, language, Progress, Checkbox } from 'quant-ui';
// import { getCountry } from '@/utils/countryCode';
import { getCountry, getCountryMoreUsed } from '@/utils/countryCodeTest';
const FormItem = Form.Item;
const { Option, OptGroup } = Select;
const InputGroup = Input.Group;
const { getCurrentLanguage } = language;
const currentLanguage = getCurrentLanguage();
const $ = language.getLanguageData;
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
const getCountryIndex = function generateBig_1(){
    let str = [];
    for(var i=65;i<91;i++){
        str.push(String.fromCharCode(i));
    }
    return str;
}
const country_index = getCountryIndex();

class RegisterMobile extends Component {
    state = {
        count: 0,
        visible: false,
        help: '',
        prefix: '0086',
        checked: true
    };

    componentWillUnmount() {  //清除倒计时
        clearInterval(this.interval);
        // this.props.form.resetFields();
    }

    componentWillReceiveProps(nextProps) {
        if( nextProps.tabs!=this.props.tabs && nextProps.tabs == 'email') {
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
        form.validateFields(['telephone'], (err, value) => {
            if(err) {
                flag = true;
            }
        })
        if(flag) { return}
        dispatch({
            type: 'register/sendSms',
            payload: {
                number: form.getFieldValue('telephone'),
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
        e.stopPropagation();
        const { form: { validateFields }, dispatch } = this.props;
        validateFields({ force: true }, (err, values) => {
            let arr = values.countryCode.split("_");
            values.countryCode = arr[1];
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
            //     help: '请输入密码！',
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
    handleChange = (value) => {
        let arr = value.split("_");
        this.props.form.setFieldsValue({
            countryCode: <span>
                <i className={'iti-flag cid' + arr[0]}></i>
                {arr[1]}
            </span>
        })
        // console.log(arr)
        // this.setState({
        //     prefix: arr[1]
        // })
    }

    handleCheck = (e) => {
        this.setState({
            checked: e.target.checked
        })
        // console.log(e.target.checked);
    }

    searchCountry = (e, value) => {
        window.event? window.event.cancelBubble = true : e.stopPropagation();
        // e.preventDefault()
        console.log(value);
    }

    countrySelect = (value) => {
        // return false;
        
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
        const { count, prefix, help, checked } = this.state;
        let languageType = currentLanguage=='zh_CN' ? 'name_cn' : 'name_en'
        return (
            <div className="register">
                <h2 className="js-register-title">{$("注册")}</h2>
                <Form onSubmit={this.handleSubmit}>
                    <Row gutter={8} className="js-register-select-country">
                        {/* <div className="select-country-content">
                            {country_index.map((item) => {
                                return <div key={`js-country-index-${item}`} onClick={(e) => this.searchCountry(e, item)} className="js-register-country-index">
                                    <p>{item}</p>
                                </div>})}
                        </div> */}
                        <Col span={9}>
                            <FormItem>
                                {getFieldDecorator('countryCode', {
                                    initialValue: "37_0086",
                                    rules: [
                                        {
                                            required: true,
                                            message: $('请选择国家地区'),
                                        },
                                    ],
                                })(
                                    <Select
                                        showSearch={true}
                                        onChange={this.handleChange}
                                        placeholder={$("请选择国家地区")}
                                        optionFilterProp="children"
                                        dropdownClassName="js-register-dropdown"
                                        // onFocus={() => this.countrySelect('block')}
                                        // onBlur={() => this.countrySelect('none')}
                                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                                    >
                                        {/* <div className='test-for-index'>
                                            {country_index.map((item) => {
                                                console.log(item);
                                                return <div key={`js-country-index-${item}`} onClick={(e) => this.searchCountry(e, item)} className="js-register-country-index">{item}</div>
                                            })}
                                        </div> */}
                                        <OptGroup label={$('常用')}>
                                            {getCountryMoreUsed().map((item) => {
                                                return <Option key={item.country_id + "_" + item.area_code}>
                                                    <i className={'iti-flag cid' + item.country_id}></i>
                                                    <span className="js-register-country-name">{item[languageType]}</span>
                                                    <span style={{ paddingLeft: '10px' }}>({item.area_code})</span>
                                                </Option>
                                            })}
                                        </OptGroup>
                                        <OptGroup label={$('全部国籍')}>
                                            {getCountry().map((item) => {
                                                return <Option key={item.country_id + "_" + item.area_code}>
                                                    <i className={'iti-flag cid' + item.country_id}></i>
                                                    <span className="js-register-country-name">{item[languageType]}</span>
                                                    <span style={{ paddingLeft: '10px' }}>({item.area_code})</span>
                                                </Option>
                                            })}
                                        </OptGroup>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={15}>
                            <FormItem>
                                {/* <InputGroup compact> */}
                                {/* <Select
                                        value={prefix}
                                        onChange={this.changePrefix}
                                        style={{ width: '30%' }}
                                    >
                                        <Option value={prefix}>+{prefix}</Option>
                                    </Select> */}
                                {getFieldDecorator('telephone', {
                                    rules: [
                                        {
                                            required: true,
                                            message: $('请输入手机号'),
                                        },
                                        {
                                            pattern: /^1\d{10}$/,
                                            message: $('手机号格式错误'),
                                        },
                                    ],
                                })(<Input placeholder={$("请输入手机号")} />)}
                                {/* </InputGroup> */}
                            </FormItem>
                        </Col>
                    </Row>


                    <FormItem>
                        <Row gutter={8}>
                            <Col span={16}>
                                {getFieldDecorator('verifyCode', {
                                    rules: [
                                        
                                        {validator: this.validatorVerifyCode}
                                    ],
                                })(<Input autocomplete="off" placeholder={$("请输入验证码")} />)}
                            </Col>
                            <Col span={8}>
                                <Button
                                    disabled={count}
                                    className={"register-getCaptcha"}
                                    onClick={this.onGetCaptcha}
                                    style={ count ? {borderColor: '#d9d9d9', color: '#d9d9d9'} : {borderColor: '#5D97FF', color: '#5D97FF'}}
                                >
                                    {count ? `${count} s` : $('发送')+ ' '}
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
                        })(<Input autocomplete="off" type="password" placeholder={$("8~20位密码，区分大小写")} />)}
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
                        })(<Input type="password" placeholder={$("确认密码")} />)}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('inviteCode', {
                            initialValue: this.props.inviteCode,
                        })(<Input placeholder={$("邀请码(选填)")} />)}
                    </FormItem>
                    {/* <Form.Item className="js-checkbox-item">
                        {getFieldDecorator('agreement', {
                            valuePropName: 'checked',
                            initialValue: false,
                        })(
                            <Checkbox onChange={this.handleCheck}>
                                {$("我已经阅读并同意")}<br /> <a href="" className="js-register-file">{$("用户协议及法律声明")}</a>
                            </Checkbox>
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
                            {$("注册") + ' '}
                        </Button>
                        {/* <Link className={"register-login"} to="/user/login">
                            使用已有账户登录
                        </Link> */}
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
})(Form.create()(RegisterMobile))