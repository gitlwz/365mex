import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, Modal, language, Button } from "quant-ui";
import moment from 'moment';
import { tooltipShow, translationParameters } from '@/utils/utils';
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
                unTradeUserStatus: false
            }
        })
    }
    footer = (title) => {
        return <div className="commit_footer">
            <Button onClick={this.onCancel} type="primary" className="commit_footer_ok">{$(title)}</Button>
        </div>
    }
    renderTitle = () => {
        return <strong>{$('警告: 你的账户已标记为垃圾账户')}</strong>
    }
    render() {
        const { unTradeUserStatus } = this.props;
        return (
            <Modal
                className="moveModal_commit"
                visible={unTradeUserStatus && this.showConect}
                destroyOnClose={true}
                title={this.renderTitle()}
                centered
                onCancel={this.onCancel}
                maskStyle={styleMask}
                footer={this.footer($('好的，我知道了'))}
                maskClosable={false}
            >
                <div style={{marginBottom: 10}}>
                    {tooltipShow($('垃圾用户提示信息一'),undefined,14)}
                </div>
                <div>
                    {tooltipShow(translationParameters([moment().hour()], $('垃圾用户提示信息二')),undefined,14)}
                </div>
            </Modal>
        )
    }
}
export default connect(({ login, loading }) => {
    const { unTradeUserStatus } = login;
    return {
        unTradeUserStatus,
        loading: !!loading.effects["orderList/riskLimitSet"]
    }
})(
    Form.create()(AddModal)
)
