/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react'
import { connect } from 'dva';
import { Form, Modal, Slider, Icon, Button, Row, Col, Divider, language } from "quant-ui";
import { translationParameters, tooltipShow } from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
const styleMask = {
    backgroundColor: "rgba(0, 0, 0, 0.35)"
}
class AddModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            value: 1,
            titleValue: "请选择新的风险限额",
            dataSource: [{
                key: "limit1",
                value: "",
                riskLimit: $("风险限额"),
                holdMargin: $("维持保证金"),
                startMargin: $("起始保证金"),
            }, {
                key: "limit2",
                value: "当前值",
                riskLimit: "300 XBT",
                holdMargin: "1 %",
                startMargin: "1.5%",
            }, {
                key: "limit3",
                value: "新值",
                riskLimit: "300 XBT",
                holdMargin: "1 %",
                startMargin: "1.5%",
            }]
        };
        this.value = "";
        this.flag = true;
    }
    //modal取消事件
    onCancel = () => {
        const { dispatch } = this.props;
        this.changeLimitValue(2);
        dispatch({
            type: "orderList/save",
            payload: {
                addVisible: false
            }
        })
    }
    componentWillReceiveProps = (props) => {
        if(!props.addVisible){
            this.flag = true;
            this.setState({
                titleValue:"请选择新的风险限额"
            })
        }
    }
    changeLimitValue = (index) => {
        const { positionHavaListData, symbolCurrent, riskStep, riskLimit, initMargin, maintMargin } = this.props;
        let { dataSource } = this.state;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        let currentRisk = riskLimit;
        if (positionHold && positionHold.riskLimit) {
            currentRisk = positionHold.riskLimit;
        }
        let num = (currentRisk - riskLimit) / riskStep;
        dataSource[index].holdMargin = ((maintMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
        dataSource[index].riskLimit = currentRisk / 100000000 + " XBT";
        dataSource[index].startMargin = ((initMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
        this.setState({
            dataSource,
            titleValue:"请选择新的风险限额"
        })
        this.flag = true;
    }
    //modal确定事件
    onOk = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/riskLimitSet",
            payload: {
                riskLimit: this.value
            }
        })
    }
    footer = (title) => {
        const { loading } = this.props;
        return <div className="commit_footer">
            <Button onClick={this.onCancel} className="commit_footer_cancel">{$('取消')}</Button>
            <Button disabled={this.state.titleValue === "请选择新的风险限额"} loading={loading} onClick={this.onOk} type="primary" className="commit_footer_ok">{
                title === "请选择新的风险限额"?$('请选择新的风险限额'):title
            }</Button>
        </div>
    }
    onChange = (value) => {
        let { dataSource } = this.state;
        let { riskStep, riskLimit, initMargin, maintMargin } = this.props;
        let num = 0;
        riskLimit = !!riskLimit ? riskLimit : 20000000000;
        riskStep = !!riskStep ? riskStep : 10000000000;
        num = (value - riskLimit) / riskStep;
        dataSource[2].holdMargin = ((maintMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
        dataSource[2].riskLimit = value / 100000000 + " XBT";
        dataSource[2].startMargin = ((initMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
        this.flag = false;
        this.value = value;
        let titleValue = this.state.titleValue;
        if (dataSource[1].riskLimit !== dataSource[2].riskLimit) {
            titleValue = translationParameters([dataSource[2].riskLimit], $('确认新的限额'));
        } else {
            titleValue = "请选择新的风险限额";
        }
        this.setState({
            dataSource,
            titleValue
        })
    }
    render() {
        const { addVisible, positionHavaListData, symbolCurrent, riskStep, riskLimit, initMargin, maintMargin } = this.props;
        let { dataSource } = this.state;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        let min = riskLimit || 20000000000;
        let Step = riskStep || 10000000000;
        let max = (min + Step * 9) || 110000000000;
        let marks = {};
        let num = 0;
        let currentRisk = !!riskLimit ? riskLimit : 20000000000;
        if (!positionHold) {
            positionHold = {};
        } else {
            currentRisk = positionHold.riskLimit;
        }
        num = (currentRisk - min) / Step;
        dataSource[1].holdMargin = ((maintMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
        dataSource[1].riskLimit = currentRisk / 100000000 + " XBT";
        dataSource[1].startMargin = ((initMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
        if (this.flag) {
            this.value = currentRisk;
            dataSource[2].holdMargin = ((maintMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
            dataSource[2].riskLimit = currentRisk / 100000000 + " XBT";
            dataSource[2].startMargin = ((initMargin * 1 + num * maintMargin) * 100).toFixed(2) + "%";
        }
        for (let i = 0; i < 10; i++) {
            let value = min + Step * i;
            marks[value] = value / 100000000;
        }
        return (
            <Modal
                className="moveModal_commit"
                visible={addVisible}
                destroyOnClose={true}
                title={translationParameters([symbolCurrent], $('调整 xx 合约的风险限额'))}
                onCancel={this.onCancel}
                maskStyle={styleMask}
                onOk={this.onOk}
                maskClosable={false}
                footer={this.footer(this.state.titleValue)}
                width="30%"
            >
                <h4>{$('更改风险限额')}（XBT）</h4>
                <div className="modal_position">
                    <Row>
                        <Col span={23}>
                            <Slider tipFormatter={null} range={false} onChange={this.onChange} defaultValue={currentRisk}
                                included={false} min={min} marks={marks} max={max} step={Step} />
                        </Col>
                    </Row>
                </div>
                <div className="moveModal_acountrisk_table">
                    {<table cellSpacing="0" rules="cols">
                        <tbody>
                            {dataSource.map((ele, index, arr) => {
                                let style = {}
                                if (ele.value === "新值") {
                                    style.fontWeight = "bold";
                                }
                                return (
                                    <tr style={style} key={ele.key} >
                                        <td key={ele.key}>
                                            <div>{$(ele.value)}</div>
                                        </td>
                                        <td>
                                            <div>{ele.riskLimit}</div>
                                        </td>
                                        <td>
                                            <div>{ele.holdMargin}</div>
                                        </td>
                                        <td>
                                            <div>{ele.startMargin}</div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {$('365MEX 使用滑动递增的风险限额。')}
                        {tooltipShow(translationParameters([symbolCurrent, (marks[riskLimit] || 200)], $('调整风险限额提示信息一')))}
                        {tooltipShow(translationParameters([(riskStep / 100000000), (maintMargin * 100).toFixed(2)], $('调整风险限额提示信息二')))}
                    <div style={{ margin: 10 }}>
                        {$('更多详情请参阅')} <a href='#'>{$('风险限额说明。')}</a>
                    </div>
                </div>
            </Modal>
        )
    }
}
export default connect(({ orderList, instrument, loading }) => {
    const { positionHavaListData, addVisible } = orderList;
    const { symbolCurrent, riskStep, riskLimit, initMargin, maintMargin } = instrument;
    return {
        addVisible,
        positionHavaListData,
        symbolCurrent,
        riskStep,
        riskLimit,
        maintMargin,
        initMargin,
        loading: !!loading.effects["orderList/riskLimitSet"]
    }
})(
    Form.create()(AddModal)
)
