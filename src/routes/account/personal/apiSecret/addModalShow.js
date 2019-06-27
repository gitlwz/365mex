import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, MoveModal, Card, Row, Col, Button, copy, message, language  } from "quant-ui";
import "./index.less";
let { getLanguageData } = language;
let $ = getLanguageData;
class AddModal extends Component {
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleApiShow: false,
                title: ""
            }
        })
    }
    copyClick = (value) => {
        copy(value);
        message.success($('复制成功'));
    }
    render() {
        const { loading, addVisibleApiShow, currentApiData } = this.props;
        return (
            <MoveModal
                visible={addVisibleApiShow}
                title={"API密钥设置"}
                onCancel={this.onCancel}
                maskClosable={false}
                confirmLoading={loading}
                footer={null}
                width="50%"
            >
                <Card className="hover-shadow apiCard" style={{ width: '100%' }} headStyle={{ height: 20 }}>
                    <Row style={{color:"red"}}>
                        <Col span={4}>注意:</Col>
                        <Col span={20}>请保管好你的密钥! 密钥在你关闭本界面后将不会再见到.</Col>
                    </Row>
                    <Row>
                        <Col span={4}>名称:</Col>
                        <Col span={20}>{currentApiData.keyName}</Col>
                    </Row>
                    <Row>
                        <Col span={4}>ID:</Col>
                        <Col span={16}>{currentApiData.keyId}</Col>
                        <Col offset={1} span={2}>
                            <Button onClick={(e) => this.copyClick(currentApiData.keyId)}>复制ID</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={4}>密钥:</Col>
                        <Col span={16}>{currentApiData.secretKey}</Col>
                        <Col offset={1} span={2}>
                            <Button onClick={(e) => this.copyClick(currentApiData.secretKey)}>复制密钥</Button>
                        </Col>
                    </Row>
                </Card>
            </MoveModal>
        )
    }
}
export default connect(({ accountInfo, loading }) => {
    const { addVisibleApiShow, title, currentApiData } = accountInfo
    return {
        addVisibleApiShow,
        title,
        currentApiData,
        loading: !!loading.effects['accountInfo/update']
    }
})(
    Form.create()(AddModal)
)
