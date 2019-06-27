import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Tabs, Login, language } from 'quant-ui';
import { routerRedux } from 'dva/router';
import RegisterEmail from './RegisterEmail';
import RegisterMobile from './RegisterMobile';
const { Tab, UserName, Password, Submit, Mobile, Captcha } = Login;
const TabPane = Tabs.TabPane;
let { getLanguageData } = language;
let $ = getLanguageData;
class Register extends Component {
    constructor(props){
        super(props);
        this.state = {
            inviteCode:"",
            tabs: 'email'
        }
    }
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'login/getPublicKey',
        });
        let arr = this.props.location.pathname.split("/user/register/");
        if(arr.length > 1){
            this.setState({
                inviteCode:arr[1]
            })
            dispatch(routerRedux.push({
                pathname: '/user/register',
            }));
        }
    }
    
    componentWillReceiveProps = (props) => {
        const { dispatch, publickKey } = this.props;
        // if(!publickKey){
        //     dispatch({
        //         type: 'login/getPublicKey',
        //     });
        // }
        let arr = props.location.pathname.split("/user/register/");
        if(arr.length > 1){
            this.setState({
                inviteCode:arr[1]
            })
            dispatch(routerRedux.push({
                pathname: '/user/register',
            }));
        }
    }


    handleChange = (value) => {
        let { tabs } = this.state
        if( value == tabs ) {
            return false;
        }
        // this.props.form.resetFields();
        this.setState({
            tabs: value
        })
    }

    render() {
        const { tabs } = this.state;
        return (
            <div className="js-login">
                <Tabs onChange={this.handleChange} className="js-register" defaultActiveKey={tabs} animated={false}>
                    <TabPane key="mobile" tab={$("手机注册")}>
                        <RegisterMobile tabs={tabs} inviteCode={this.state.inviteCode}/>
                    </TabPane>
                    <TabPane key="email" tab={$("邮箱注册")}>
                        <RegisterEmail tabs={tabs} inviteCode={this.state.inviteCode} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
export default connect(({ login }) => {
    const { publickKey } = login;
    return {
        publickKey
    }
})(Form.create()(Register))