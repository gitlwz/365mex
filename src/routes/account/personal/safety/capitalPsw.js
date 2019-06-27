import React, { Component } from 'react'
import { connect } from 'dva';
import { Button, Row, Col, language, Icon } from 'quant-ui';
import "./index.less";
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    onClick = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleCaptal: true,
                title: "设置资金密码"
            }
        })
    }
    render() {
        const { dataSource } = this.props;
        return (
            <Row style={{ marginBottom: 20, lineHeight: "32px" }} className={dataSource.accountPassword === '1' ? "ant-steps-item-finish" : "ant-steps-item-error"}>
                <Col span={4}>
                    <span className="ant-steps-item-icon">
                        <span className="ant-steps-icon">
                            <Icon type={dataSource.accountPassword === '1' ? "check" : "close"} />
                        </span>
                    </span>
                    <span style={{ fontSize: 16, color: dataSource.accountPassword === '1' ? "#1890ff" : "#f5222d" }}>{$('资金密码')}</span>
                </Col>
                <Col span={20}>
                    <span>{dataSource.accountPassword === '1' ? "********" : "未设置"}</span>
                    <Button onClick={this.onClick} className="flR">{$('设置密码')}</Button>
                </Col>
            </Row>
            // <div className="userInfo">
            //     <Row className="line">
            //         <Col span={2}>
            //             <span>资金密码：</span>
            //         </Col>
            //         <Col span={4}>
            //             <span>{dataSource.accountPassword === '1' ? "********":"未设置"}</span>
            //         </Col>
            //             <Button onClick={this.onClick} type="primary">设置密码</Button>
            //     </Row>
            // </div>
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
