import React, { Component } from 'react'
import { connect } from 'dva';
import { Utils } from 'quant-ui';
const currency = Utils.currency;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            size: props.size,
            price: props.price,
        }
        this.className="";
    }
    componentWillReceiveProps(props) {
        this.setState({
            size: props.size,
            price: props.price,
        })
    }
    shouldComponentUpdate(nextProps,nextState){
        if(this.state.size !== nextState.size){
            if(this.state.size > nextState.size){
                this.className = "up";
            }else{
                this.className = "down";
            }
            return true;
        }
        return false;
    }
    sendOrderPrice = (price,size,e) => {
        e.stopPropagation();
        const { dispatch } = this.props;
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
        return (
            <td onClick={(e) => this.sendOrderPrice(this.state.price,this.state.size,e)} key={this.state.size} className={"size isNew highlightInc " + this.className}>
                <div className={this.props.className}>
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