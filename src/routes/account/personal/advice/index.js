import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { Button, Row, Col, Card } from 'quant-ui';
import TopAdviceUser from './topAdviceUser';
import MyAdviceCode from './myAdviceCode';
class Index extends Component {
    componentWillMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findInvitationTop",
        })
        dispatch({
            type: "accountInfo/findUserInvitation",
        })
    }
    render() {
        return (
            <div>
                <TopAdviceUser />
                <MyAdviceCode />
            </div>
        )
    }
}

export default connect(({ accountInfo }) => {
    return {
    }
})(
    Index
)
