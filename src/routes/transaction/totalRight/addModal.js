import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, Modal, language, Spin } from "quant-ui";
let { getLanguageData } = language;
let $ = getLanguageData;
const styleMask = {
    backgroundColor: "rgba(0, 0, 0, 0.35)"
}
class AddModal extends Component {
    //modal取消事件
    showConect = true;
    onCancel = () => {
        const { dispatch } = this.props;
        this.showConect = false;
        dispatch({
            type: "login/save",
            payload: {
                showReConecting: false
            }
        })
    }
    render() {
        const { showReConecting } = this.props;
        return (
            <Modal
                className="moveModal_commit moveModal_connecting"
                visible={showReConecting === true && this.showConect}
                destroyOnClose={true}
                title={$('正在重新连接到 365MEX')}
                // centered
                style={{
                    top:'10% !important'
                }}
                onCancel={this.onCancel}
                maskStyle={styleMask}
                footer={null}
                maskClosable={false}
                width="30%"
            >
                <div>
                    {$('未能够保持与365MEX系统的实时连接。')}
                </div>
                <div class="spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
                <div>
                    {$('已离线，等待重新连接...')}
                </div>
            </Modal>
        )
    }
}
export default connect(({ login, loading }) => {
    const { showReConecting } = login;
    return {
        showReConecting,
        loading: !!loading.effects["orderList/riskLimitSet"]
    }
})(
    Form.create()(AddModal)
)
