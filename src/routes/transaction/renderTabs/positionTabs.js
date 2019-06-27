import React, { Component } from 'react'
import { connect } from 'dva';
import PositionHave from '../userOrder/positionHave/index.js';
import PositionClose from "../userOrder/positionClose/index.js";
class Index extends Component {
    userOrderSwitch = (currentPosition) => {
        switch (currentPosition) {
            case 'position':
                return <PositionHave key='PositionHave' />
            case 'positionHave':
                return <PositionClose key='PositionClose' />
            default:
                return ''
        }
    }
    render() {
        const { currentPosition } = this.props;
        return (
            <div>
                {this.userOrderSwitch(currentPosition)}
            </div>
        )
    }
}
export default connect(({ orderList }) => {
    const { currentPosition } = orderList;
    return {
        currentPosition
    }
})(
    Index
)