import React, { Component } from 'react'
import { Button, language } from 'quant-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
let $ = language.getLanguageData;
export class Index extends Component {
    login = () => {
        const { dispatch, symbolCurrent } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/login',
        }));
    }
    register = () => {
        const { dispatch, symbolCurrent } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/register',
        }));
    }
    render() {
        return (
            <div className="unlogin">
                <div style={{marginBottom:10}}>{$('您必须先登录才能查看此内容')}</div>
                <div>
                    <Button className='loginBack' style={{marginRight:15}} onClick={this.login}>{$("登录")}</Button>
                    <Button className='loginOutBack' onClick={this.register}>{$("注册")}</Button>
                </div>
            </div>
        )
    }
}

export default connect(() => {
    return {
    }
})(
    Index
)
