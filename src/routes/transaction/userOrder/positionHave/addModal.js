import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, MoveModal, Checkbox, Icon, Button, language } from "quant-ui";
import { translationParameters, getTickLength } from "@/utils/utils"
let { getLanguageData } = language;
let $ = getLanguageData;
const styleMask = {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    top: "3%"
}
class AddModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            value: 1,
            showInput: false
        }
    }
    onClick = () => {
        this.setState({
            showInput: !this.state.showInput
        })
    }
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                addVisiblePosition: false
            }
        })
    }
    //modal确定事件
    onOk = () => {
        const { positionAlertData } = this.props;
        this.props.closePosition(positionAlertData, positionAlertData.alertPrice)
    }
    footer = (title) => {
        return <div className="commit_footer">
            <Button onClick={this.onCancel} className="commit_footer_cancel"><Icon
                style={{ fontSize: 15, fontWeight: "bold" }}
                type="close" />{$('取消')}</Button>
            <Button onClick={this.onOk} type="primary" className="commit_footer_ok">{$(title)}</Button>
        </div>
    }
    render() {
        const { loading, addVisiblePosition, positionAlertData, tickSize } = this.props;
        let _positionAlertData = {};
        let className = "green";
        let title = $('限价平仓') + '?';
        let titleSide = $("买入");
        let titleFirst = '';
        let ordType = "限价买入平仓";
        let titleLast = $('在执行时，将平掉你的整个仓位。');
        if (!!positionAlertData.alertPrice) {
            _positionAlertData = positionAlertData;
            let price = _positionAlertData.alertPrice;
            try {
                price = _positionAlertData.alertPrice.toFixed(getTickLength(tickSize));
            } catch (error) {

            }
            if (_positionAlertData.alertPrice === 'Market') {
                title = $('市价平仓') + '?';
                ordType = ordType.replace('限价', '市价');
                titleLast = $('这将使你的仓位在可能的市场价格平仓。')
                titleFirst = translationParameters([$('市价'), Math.abs(_positionAlertData.currentQty), positionAlertData.symbol,], $('在 xx 价格 x 张 x 合约'));
            } else {
                titleFirst = translationParameters([price, Math.abs(positionAlertData.currentQty), positionAlertData.symbol,], $('在 xx 价格 x 张 x 合约'));
            }
            if (_positionAlertData.currentQty > 0) {
                className = 'red';
                titleSide = $('卖出');
                ordType = ordType.replace('买入', '卖出');
            }
        }
        return (
            <MoveModal
                className="moveModal_commit"
                visible={addVisiblePosition}
                destroyOnClose={true}
                title={$(title)}
                onCancel={this.onCancel}
                maskStyle={styleMask}
                onOk={this.onOk}
                maskClosable={false}
                footer={this.footer(title.substring(0, title.length - 1))}
                confirmLoading={loading}
                width="30%"
            >
                <div className={"title_first " + className}>{$(ordType) + " "}</div>
                <div className="title_second">
                    <span className={className}>{titleSide + " "}</span>
                    <span>{titleFirst}</span>
                    <br />
                    <span style={{ fontSize: 12 }}>{$(titleLast)}</span>
                </div>
                {_positionAlertData.alertPrice !== 'Market' ?
                    <div style={{ textAlign: "right" }}>
                        <Checkbox style={{ color: "black", fontSize: 12 }}
                            onChange={this.onChangeCheckBox}>{$('不要再显示')}
                        </Checkbox>
                    </div> : ""}
            </MoveModal>
        )
    }
}
export default connect(({ orderCommit, instrument, loading }) => {
    const { addVisiblePosition, positionAlertData } = orderCommit
    const { tickSize } = instrument;
    return {
        addVisiblePosition,
        positionAlertData,
        tickSize,
        loading: !!loading.effects["orderCommit/orderCommit"]
    }
})(
    Form.create()(AddModal)
)
