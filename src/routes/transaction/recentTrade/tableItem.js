import React, { Component } from 'react'
import moment from "moment";
import { Icon , Tooltip} from 'quant-ui';
import { tooltipShow, getTickLength } from '@/utils/utils';
import { connect } from 'dva';
class TableItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            className: props.className,
            ele: props.ele
        };
    }
    componentWillMount = () => {

    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (nextState.className !== this.state.className) {
            return true;
        }
        if (nextState.ele.trdMatchID !== this.state.ele.trdMatchID) {
            return true;
        }
        if (nextState.ele.price !== this.state.ele.price) {
            return true;
        }
        if (nextState.ele.icon !== this.state.ele.icon) {
            return true;
        }
        if (nextState.ele.size !== this.state.ele.size) {
            return true;
        }
        if (nextState.ele.timestamp !== this.state.ele.timestamp) {
            return true;
        }
        if (nextProps.isFullscreen !== this.props.isFullscreen) {
            return true;
        }
        return false;
    }
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            className: nextProps.className,
            ele: nextProps.ele,
        })
    }
    render() {
        const { tickSize, isFullscreen } = this.props;
        let price = this.state.ele.price.toFixed(getTickLength(tickSize));
        let time = isFullscreen ? moment(this.state.ele.timestamp).format("YYYY/MM/DD HH:mm:ss"): moment(this.state.ele.timestamp).format("HH:mm:ss");
        let _time = moment(this.state.ele.timestamp).format("MMMM Do HH:mm");
        let record = this.state.ele.timestamp;
        // if (time.indexOf("晚上") !== -1) {
        //     time = time.replace("晚上", "下午");
        //     _time = _time.replace("晚上", "下午");
        // } else if (time.indexOf("凌晨") !== -1) {
        //     if(moment(record).format("h:mm:ss") > moment(record).format("12:00:00")){
        //         time = isFullscreen ?moment(this.state.ele.timestamp).format("YYYY/MM/DD a hh:mm:ss"): moment(this.state.ele.timestamp).format("a hh:mm:ss");
        //         _time = moment(this.state.ele.timestamp).format("MMM Do a hh:mm");
        //     }
        //     time = time.replace("凌晨", "上午")
        //     _time = _time.replace("凌晨", "上午")
        // } else if (time.indexOf("早上") !== -1) {
        //     time = time.replace("早上", "上午")
        //     _time = _time.replace("早上", "上午")
        // } else if (time.indexOf("中午") !== -1) {
        //     if (moment(record).format("hh:mm:ss") > moment(record).format("24:00:00")) {
        //         // time = time.replace("中午", "下午")
        //         // _time = _time.replace("中午", "下午")
        //     } else {
        //         // time = time.replace("中午", "上午")
        //         // _time = _time.replace("中午", "上午")
        //     }
        // }
        return (
            <tr className={this.state.className} key={this.state.ele.trdMatchID}>
                <td key={this.state.ele.trdMatchID + "1"}>
                    <div style={{width: 60}} key={this.state.ele.trdMatchID + this.state.ele.price}>{this.state.ele.icon && <Icon type={this.state.ele.icon} style={{ marginRight: "4px" }} theme="outlined" />}{price}</div>
                </td>
                <td key={this.state.ele.trdMatchID + "2"}>
                    <div key={this.state.ele.trdMatchID + this.state.ele.size}>{this.state.ele.size}</div>
                </td>
                <td key={this.state.ele.trdMatchID + "3"}>
                    <div key={this.state.ele.trdMatchID + this.state.ele.timestamp}>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow(_time)}>
                            {time}
                        </Tooltip>
                    </div>
                </td>
                <td key={this.state.ele.trdMatchID + "4"}>
                    <div key={this.state.ele.trdMatchID + this.state.ele.side}>{this.state.ele.side ? this.state.ele.side.slice(0, 1) : ""}</div>
                </td>
            </tr>
        )
    }
}
export default connect(({ instrument, recentTrade }) => {
    const { tickSize } = instrument;
    const { isFullscreen } = recentTrade;
    return {
        tickSize,
        isFullscreen
    }
})(
    TableItem
)
