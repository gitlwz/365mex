import React, { Component } from 'react'
import './table.less';
import moment from "moment";
import { Utils } from 'quant-ui';
import { getCurrencyType } from '@/utils/utils'
const currency = Utils.currency;
let calculate = Math.pow(10,getCurrencyType().tick);
export class tableItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            eleItem:props.eleItem,
            textAlign:props.textAlign,
            valueKey:props.valueKey,
            tick:props.tick,
            ele:props.ele
        }
    }
    componentWillMount = () => {

    }
    componentWillReceiveProps = (props) => {
        let className = ""
        if(this.state.eleItem > props.eleItem){
            className = "up"
        }else if(this.state.eleItem < props.eleItem){
            className = "down"
        }
        this.setState({
            eleItem:props.eleItem,
            className:className,
            valueKey:props.valueKey,
            tick:props.tick,
            ele:props.ele
        })
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if(this.state.eleItem !== nextState.eleItem){
            return true;
        }
        if(this.state.className !== nextState.className){
            return true;
        }
        return false;
    }
    spacilItem = (item) => {
        let text = item || "---";
        let length = this.state.tick.toString().indexOf(".");
        if(item || item == 0){
            switch (this.state.valueKey){
                case "lastChangePcnt":
                    if(this.state.ele.symbol == '.XBTUSDPI') {
                        text = '---'
                    } else {
                        text = (item * 100).toFixed(2) + "%"
                    }
                    break;
                case "tickSize":
                    text = item
                    break;
                case "markPrice":
                case "lastPrice":
                    if(this.state.ele.symbol == '.365XBT') {
                        text.toFixed(2)
                    }
                    break
                case "bidPrice":
                case "askPrice":
                    if(length !== -1){
                        let tick = this.state.tick.toString().length - length - 1;
                        text = item.toFixed(tick)
                    }else if(this.state.tick.toString() !== "1e-8" && this.state.tick.toString() !== "1e-7"  && item.toString().indexOf(".") !== -1){
                        text = item.toFixed(2)
                    }
                    break;
                case "openValue":
                    text = currency(parseInt(item *  calculate)  / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key
                    break;
                default:
                    break;
            }
        }
        return text;
    }
    render() {
        return (
            <td className={this.state.className}>
                <div style={{textAlign:this.state.textAlign, fontSize:13}}>{this.spacilItem(this.state.eleItem)}</div>
            </td>
        )
    }
}

export default tableItem
