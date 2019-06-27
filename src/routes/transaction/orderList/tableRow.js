import React, { Component } from 'react'
class TableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ele: props.ele,
            width: props.width,
        };
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (nextState.width !== this.state.width) {
            return true;
        }
        if (nextState.ele.price !== this.state.ele.price) {
            return true;
        }
        if (nextState.ele.all !== this.state.ele.all) {
            return true;
        }
        if (nextState.ele.size !== this.state.ele.size) {
            return true;
        }
        if (nextState.ele.dic !== this.state.ele.dic) {
            return true;
        }
        return false;
    }
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            width: nextProps.width,
            ele: nextProps.ele,
        })
    }
    render() {
        return (
            <tr className={this.props.hover}>
                <td className={"price " + this.props.color}>
                    <div>{this.state.ele.price}</div>
                </td>
                <td className={"size isNew highlightInc " + this.state.ele.dic}>
                    <div>{this.state.ele.size}</div>
                </td>
                <td className="cumSize">
                    <div>
                        <div className={"depthBar " + this.props.greenOrRed} style={{ width: this.state.width }}>
                        </div>
                        <span className="output">{this.state.ele.all}</span>
                    </div>
                </td>
                {/* {this.state.columnsClose.map((record, index, obj) => {
                    return <TableItem
                        key={record.key + this.state.ele.symbol}
                        color={record.color}
                        width={this.state.width}
                        record={record.key}
                        className={record.className}
                        item={this.state.ele[record.key]} />
                })} */}
            </tr>
        )
    }
}
export default (
    TableRow
)