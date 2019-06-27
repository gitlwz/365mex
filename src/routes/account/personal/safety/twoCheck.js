/* eslint-disable eqeqeq */
import React, { Component } from 'react'
import { connect } from 'dva';
import { Button, Row, Col } from 'quant-ui';
import "./index.less";
class Index extends Component {
    onClick = (title) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisible: true,
                title: title
            }
        })
    }
    cancelGoogleCheck = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/cancelGoogleCheck",
        })
    }
    updateTelephone = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/updateTelephone",
        })
    }
    onClickTel = (title) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleTel: true,
                title: title
            }
        })
    }
    render() {
        const { dataSource } = this.props;
        // let isCheck = dataSource.googleStatus == "1" || dataSource.telephone;
        return (
            <div className="userInfo">
                <div className="titleLine">
                    <h4>两步验证</h4>
                </div>
                <div className="line">
                    <p>两步验证是使用动态密码，在设备隔离的情况下进行验证，使用将增加您账户的安全性。</p>
                </div>
                {dataSource.googleStatus == "1" ?
                    <Row className="lineSelect">
                        <Col span={18}>
                            <span className="greenColor">已开启谷歌验证</span>
                        </Col>
                        <Button onClick={this.cancelGoogleCheck} type="danger">关闭谷歌两步验证</Button>
                    </Row>
                    :
                    <Row className="lineSelect">
                        <Col span={18}>
                            <span className="redColor">未开启谷歌验证</span>
                        </Col>
                        <Button onClick={(e) => this.onClick("开启谷歌两步验证")} type="primary">开启谷歌两步验证</Button>
                    </Row>}
                {dataSource.telephone ?
                    <Row className="lineSelect">
                        <Col span={18}>
                            <span className="greenColor">已开启手机验证</span>
                        </Col>
                        <Button type="danger" onClick={this.updateTelephone}>关闭手机短信验证</Button>
                    </Row> :
                    <Row className="lineSelect">
                    <Col span={18}>
                        <span className="redColor">未开启手机验证</span>
                    </Col>
                    <Button onClick={(e) => this.onClickTel("开启手机验证")} type="primary">开启手机短信验证</Button>
                </Row>}

                {/* <Row className="lineSelect">
                    <Button loading={loading} disabled={!isCheck} onClick={() => this.props.twoCheck({},"5")} type="primary">提交两步验证</Button>
                </Row> */}
            </div>
        )
    }
}

export default connect(({ accountInfo ,loading}) => {
    const { dataSource } = accountInfo;
    return {
        dataSource,
        loading: !!loading.effects["accountInfo/update"]
    }
})(
    Index
)
