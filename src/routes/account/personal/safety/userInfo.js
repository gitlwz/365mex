import React, { Component } from 'react'
import { connect } from 'dva';
import { Button, Row, Col, Card } from 'quant-ui';
import "./index.less";
import { routerRedux } from 'dva/router';
class Index extends Component {
    onClick = () => {
        const { dispatch } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/forget',
        }));
    }
    render() {
        let userInfo = this.props.dataSource || {};
        return (
            <Card className="hover-shadow userInfo">
                <Row className="line">
                    <Col span={2}>
                        <span>姓名：</span>
                    </Col>
                    <Col >
                        <span>{userInfo.applyStatus === '4' ? userInfo.userName : "未完成身份验证"}</span>
                    </Col>
                </Row>
                <Row className="line">
                    <Col span={2}>
                        <span>用户ID：</span>
                    </Col>
                    <Col >
                        <span>{userInfo.userId}</span>
                    </Col>
                </Row>
                <Row className="line">
                    <Col span={2}>
                        <span>注册账号：</span>
                    </Col>
                    <Col >
                        <span>{userInfo.email || userInfo.telephone}</span>
                    </Col>
                </Row>
                <Row className="line">
                    <Col span={2}>
                        <span>登录密码：</span>
                    </Col>
                    <Col span={4}>
                        <span>*******</span>
                    </Col>
                        <Button onClick={this.onClick} type="primary">修改</Button>
                </Row>
            </Card>
        )
    }
}

export default connect(({ accountInfo }) => {
    const { dataSource } = accountInfo;
    return {
        dataSource
    }
})(
    Index
)
