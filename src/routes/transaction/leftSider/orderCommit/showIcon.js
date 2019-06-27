import React, { Component } from 'react'
import { connect } from 'dva';
import { Tooltip, Icon, language } from "quant-ui";
import { tooltipShow , translationParameters} from '@/utils/utils';
let { getLanguageData } = language;
let $ = getLanguageData;
class ShowIcon extends Component {
    constructor(props){
        super(props);
        this.state = {
            volumn:0
        }
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.props.text !== nextProps.text) {
            return true;
        }
        if (this.props.orderQty !== nextProps.orderQty) {
            return true;
        }
        if (this.props.firstTitle !== nextProps.firstTitle) {
            return true;
        }
        if (this.props.secondTitle !== nextProps.secondTitle) {
            return true;
        }
        if (this.props.secondText !== nextProps.secondText) {
            return true;
        }
        if (this.props.flag !== nextProps.flag) {
            return true;
        }
        if (this.props.forceClose !== nextProps.forceClose) {
            return true;
        }
        if (this.state.volumn !== nextState.volumn) {
            return true;
        }
        return false;
    }
    componentWillReceiveProps = (props) => {
        let positionHold = props.positionHavaListData.find(item => item.symbol === props.symbolCurrent)
        if(positionHold){
            this.setState({
                volumn:positionHold.currentQty
            })
        }
    }
    render() {
        const { positionHavaListData, symbolCurrent } = this.props;
        let text = this.props.text;
        let forceClose = this.props.forceClose;
        let buyOrSell = $('买多委托');
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        if (!positionHold) {
            positionHold = {};
        }
        if(this.props.flag === "bidPrice"){
            buyOrSell = $('卖空委托');
        }
        let fisrt = translationParameters([this.props.orderQty,symbolCurrent,this.props.firstTitle,(this.props.secondTitle || ""),buyOrSell],$('点此提交x张x合约'))
        let subValue = ((positionHold.currentQty || 0) - (this.props.orderQty * 1));//
        if(this.props.flag !== "bidPrice"){
            subValue = ((positionHold.currentQty || 0) + (this.props.orderQty * 1));
        }
        let showAddOrSub = Math.abs(positionHold.currentQty || 0) - Math.abs(subValue);
        if(showAddOrSub > 0){
            fisrt = fisrt + translationParameters([(this.props.secondText || ""), (positionHold.currentQty || 0), subValue],$('它将使你的仓位从x张减少至x张合约'))
        }else{
            fisrt = fisrt + translationParameters([(this.props.secondText || ""), (positionHold.currentQty || 0), subValue],$('它将使你的仓位从x张增加至x张合约'))
        }
        if(subValue === 0){
            forceClose = '';
        }
        fisrt = fisrt + (text || "") + forceClose;
        return (
            <div className="orderShowIcon">
                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(fisrt)}>
                    <Icon theme="filled" width={10} height={10} type="question-circle" />
                </Tooltip>
            </div>
        )
    }
}

export default connect(({ instrument, orderList }) => {
    const { symbolCurrent } = instrument;
    const { positionHavaListData } = orderList;
    return {
        symbolCurrent,
        positionHavaListData
    }
})(
    ShowIcon
)
