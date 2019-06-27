import React, { Component } from 'react'
import { connect } from 'dva';
import ShowIcon from './showIcon';
import { language } from "quant-ui";
import { translationParameters } from '@/utils/utils';
import { Formula } from '@/utils/formula';
let { getLanguageData } = language;
let $ = getLanguageData;
const FormulaFuc = new Formula();//成本计算公式
class ButtonPrice extends Component {
    shouldComponentUpdate = (nextProps) => {
        if (this.props.instrumentData.askPrice !== nextProps.instrumentData.askPrice) {
            return true;
        }
        if (this.props.instrumentData.bidPrice !== nextProps.instrumentData.bidPrice) {
            return true;
        }
        if (this.props.orderQty !== nextProps.orderQty) {
            return true;
        }
        return false;
    }
    getLiquidationPrice = () => {
        const { instrumentData, positionHavaListData, symbolCurrent, dataSource } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent);
        let orderQty = this.props.orderQty;
        let arr = [];
        if (instrumentData.symbol && positionHold) {
            arr.push(FormulaFuc.getLiquidationPrice(instrumentData, positionHold, dataSource, orderQty * 1, instrumentData.bidPrice * 1, positionHold.leverage));
            arr.push(FormulaFuc.getLiquidationPrice(instrumentData, positionHold, dataSource, -orderQty * 1, instrumentData.askPrice * 1, positionHold.leverage));
        }
        return arr;
    }
    render() {
        const { instrumentData, positionHavaListData, symbolCurrent } = this.props;
        let positionHold = positionHavaListData.find(item => item.symbol === symbolCurrent)
        if (!positionHold) {
            positionHold = {};
        }
        let liqArr = this.getLiquidationPrice();
        if (liqArr.length === 0) {
            liqArr = ['', ''];
        }
        let forceCloseB = "<br /><br />" + translationParameters([liqArr[0]], $('你在操作后的预计强平价格是'));
        let forceCloseS = "<br /><br />" + translationParameters([liqArr[1]], $('你在操作后的预计强平价格是'));
        let text = "";
        if (this.props.flag === "askPrice") {
            text = " @ ≥ " + (instrumentData.askPrice || 0);
        } else if (this.props.flag === "bidPrice") {
            text = " @ ≤ " + (instrumentData.bidPrice || 0);
        }
        return (
            <div className="borderTop">
                {this.props.orderQty + text}
                <ShowIcon text="" forceClose={this.props.flag === "askPrice"?forceCloseB:forceCloseS} orderQty={this.props.orderQty} firstTitle={$('市价')} secondTitle={$('市价')} flag={this.props.flag} type={true} />
            </div>
        )
    }
}

export default connect(({ instrument, orderList, margin }) => {
    const { instrumentData, symbolCurrent } = instrument;
    const { positionHavaListData } = orderList;
    const { dataSource } = margin;
    return {
        instrumentData,
        symbolCurrent,
        positionHavaListData,
        dataSource
    }
})(
    ButtonPrice
)
