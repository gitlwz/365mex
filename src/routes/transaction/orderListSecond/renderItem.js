import React, { Component } from 'react'
import { connect } from 'dva';
import { Utils , Tooltip, language} from 'quant-ui';
import { translationParameters } from '@/utils/utils'
const currency = Utils.currency;
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            size: props.size,
            leavesQty: props.leavesQty
        }
        this.className = "";
    }
    componentWillReceiveProps(props) {
        this.setState({
            size: props.size,
            leavesQty: props.leavesQty,
        })
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.size !== nextState.size) {
            if (this.state.size > nextState.size) {
                this.className = "up";
            } else {
                this.className = "down";
            }
            return true;
        }
        if(this.state.leavesQty !== nextState.leavesQty){
            return true;
        }
        return false;
    }
    sendOrderPrice = (size) => {
        const { dispatch, price } = this.props;
        dispatch({
            type: "orderCommit/save",
            payload: {
                sendVolum: size,
                sendPrice: price,
                showChangeSendValue:(new Date()).getTime()
            }
        })
    }
    render() {
        let title = translationParameters([currency(this.state.leavesQty, { separator: ',', precision: 0 }).format()],$('这是xx张合约的强平委托'))
        return (
            this.props.className !== ""?<Tooltip mouseLeaveDelay={0} placement="right" title={title}>
            <td onClick={() => this.sendOrderPrice(this.state.size)} key={this.state.size} className={"size " + this.className}>
                <div className={this.props.className}>
                    {currency(this.state.size, { separator: ',', precision: 0 }).format()}</div>
            </td>
        </Tooltip>:<td onClick={() => this.sendOrderPrice(this.state.size)} key={this.state.size} className={"size " + this.className}>
                <div>
                    {currency(this.state.size, { separator: ',', precision: 0 }).format()}</div>
            </td>
            
        )
    }
}
export default connect(() => {
    return {
    }
})(
    Index
)