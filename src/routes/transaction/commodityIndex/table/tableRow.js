import React, { Component } from 'react'
import './table.less';
import TableItem from './tableItem';
export class tableRow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ele: props.ele,
            columnsClose:props.columnsClose
        }
    }

    componentWillMount = () => {

    }
    componentWillReceiveProps = (props) => {
        this.setState({
            ele: props.ele
        })
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if(this.state.ele.markPrice !== nextState.ele.markPrice){
            return true;
        }
        if(this.state.ele.lastPrice !== nextState.ele.lastPrice){
            return true;
        }
        if(this.state.ele.bidPrice !== nextState.ele.bidPrice){
            return true;
        }
        if(this.state.ele.askPrice !== nextState.ele.askPrice){
            return true;
        }
        if(this.state.ele.openValue !== nextState.ele.openValue){
            return true;
        }
        if(this.state.ele.lotSize !== nextState.ele.lotSize){
            return true;
        }
        if(this.state.ele.lastChangePcnt !== nextState.ele.lastChangePcnt){
            return true;
        }
        if(this.state.ele.prevPrice24h !== nextState.ele.prevPrice24h){
            return true;
        }
        return false;
    }
    render() {
        return (
            <tr className="tableTr">
                {this.state.columnsClose.map((record, index, obj) => {
                    return <TableItem 
                    textAlign={record.textAlign}
                    tick={this.state.ele.tickSize}
                    valueKey={record.key}
                    ele={this.state.ele}
                    key={record.key + this.state.ele.symbol} 
                    eleItem={this.state.ele[record.key]} />
                })}
            </tr>
        )
    }
}

export default tableRow
