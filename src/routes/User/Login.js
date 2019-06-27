import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Icon, Login, language } from 'quant-ui';
import { getUserUserlogin } from "../../utils/authority";
import { createConnection } from 'net';
const { Tab, UserName, Password, Submit, Mobile, Captcha } = Login;
let { getLanguageData } = language;
let $ = getLanguageData;
let userdata = {}
class LoginPage extends Component {
    state = {
        type: 'account',
    };
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'login/getPublicKey',
        });
        if (!!this.props.remember) {
            userdata = getUserUserlogin() || {}
        } else {
            userdata = {}
        }
    }

    componentDidMount = () => {
        // this.createNC();
    }

    createNC = () => {
        let nc_token = ["CF_APP_1", (new Date()).getTime(), Math.random()].join(':');
        let NC_Opt = 
        {
            renderTo: "#your-dom-id",
            appkey: "CF_APP_1",
            scene: "register",
            token: nc_token,
            customWidth: 300,
            trans:{"key1":"code0"},
            elementID: ["usernameID"],
            is_Opt: 0,
            language: "cn",
            isEnabled: true,
            timeout: 3000,
            times:5,
            apimap: {
                // 'analyze': '//a.com/nocaptcha/analyze.jsonp',
                // 'get_captcha': '//b.com/get_captcha/ver3',
                // 'get_captcha': '//pin3.aliyun.com/get_captcha/ver3'
                // 'get_img': '//c.com/get_img',
                // 'checkcode': '//d.com/captcha/checkcode.jsonp',
                // 'umid_Url': '//e.com/security/umscript/3.2.1/um.js',
                // 'uab_Url': '//aeu.alicdn.com/js/uac/909.js',
                // 'umid_serUrl': 'https://g.com/service/um.json'
            },   
            callback: function (data) { 
                window.console && console.log(nc_token)
                window.console && console.log(data.csessionid)
                window.console && console.log(data.sig)
            }
        }
        var nc = new window.noCaptcha(NC_Opt)
        nc.reload();
        nc.upLang('cn', {
            _startTEXT: "请按住滑块，拖动到最右边",
            _yesTEXT: "验证通过",
            _error300: "哎呀，出错了，单击<a href=\"javascript:__nc.reset()\">刷新</a>再来一次",
            _errorNetwork: "网络不给力，请<a href=\"javascript:__nc.reset()\">单击刷新</a>",
        })
    }

    onTabChange = type => {
        this.setState({ type });
    };

    handleSubmit = (err, values) => {
        const { type } = this.state;
        const { dispatch } = this.props;
        if (!err) {
            if (values.email.indexOf("@") === -1) {
                values.telephone = values.email;
                values.email = null;
            }
            dispatch({
                type: 'login/login',
                payload: {
                    ...values,
                    type,
                },
            });
        }
    };

    changeCheckbox = e => {
        const { dispatch } = this.props;
        dispatch({
            type: "login/changeCheckbox",
            payload: {
                remember: e.target.checked
            }
        })
    };
    render() {
        const { remember, loading, password, user } = this.props;
        const { type } = this.state;
        return (
            <div className="js-login">
            <div className={'qdp-login-main'}>
                {/* <div id="your-dom-id" class="nc-container"></div>  */}
                <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
                    
                        {/* <Tab key="account" tab={$("账户密码登录")}>
                            <UserName defaultValue={user} name="email" placeholder={$("请输入邮箱名或手机号")} />
                            <Password defaultValue={password} name="password" placeholder={$("请输入密码")} />
                        </Tab> */}
                        <Tab key="account" tab={$("欢迎登录365MEX")}>
                            <UserName defaultValue={user} name="email" placeholder={$("请输入邮箱名或手机号")} />
                            <Password defaultValue={password} name="password" placeholder={$("请输入密码")} />
                        </Tab>
                    {/* <Tab key="mobile" tab="手机号登录">
                        <Mobile name="mobile" />
                        <Captcha name="captcha" />
                    </Tab> */}
                    {/* <div>
                        <Checkbox checked={remember} onChange={this.changeCheckbox}>
                            {$('记住密码')}
                        </Checkbox>
                        
                    </div> */}
                    <Submit loading={loading}>{$('登录')}</Submit>
                    <div className={'qdp-login-other'}>
                        
                        <Link className={'qdp-login-register'} to="/user/register">
                            {$('注册')}
                        </Link>
                        <Link  to="/user/forget" style={{ float: "right" }} >
                            {$('忘记密码')}
                        </Link>
                    </div>
                    <div className="js-clear-float"></div>
                </Login>
                
            </div>
            </div>
        );
    }
}
export default connect(({ login, loading, register }) => {
    const { userdata, remember } = login;
    const { user, password } = register;
    return {
        userdata,
        remember,
        user,
        password,
        loading: !!loading.effects['login/login']
    }
})(LoginPage)
