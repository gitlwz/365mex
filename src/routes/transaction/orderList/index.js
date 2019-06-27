import React, { Component } from 'react'
import { screenfull, Select, Spin } from 'quant-ui';
import { connect } from 'dva';
import BuyTable from "./buyTable";
import SellTable from "./sellTable";
import LastPrice from "./lastPrice";
const Option = Select.Option;

class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            positionSetting: "5",
            render: true
        }
    }
    componentWillMount = () => {
        screenfull.on('change', (a, b, c, d) => {
            if (screenfull.isFullscreen) {
                let clientHeight = (a.srcElement.clientHeight - 100) / 40;
                window.localStorage.setItem("recent_data_height", JSON.stringify(clientHeight + 3))
                // window._worker.postMessage({
                //     method: "title", data: {
                //         recent_data_height: JSON.stringify(clientHeight + 3),
                //     }
                // })
            } else {
                let clientHeight = (a.srcElement.clientHeight - 98) / 40;
                window.localStorage.setItem("recent_data_height", JSON.stringify(clientHeight + 3))
                // window._worker.postMessage({
                //     method: "title", data: {
                //         recent_data_height: JSON.stringify(clientHeight + 3),
                //     }
                // })
            }
            this.setState({
                render: !this.state.render
            })
        });
    }
    onChange = (value) => {
        this.setState({
            positionSetting: value
        })
    }
    render() {
        return (
            // this.props.riskStep ? 
            < div className="orderList" >
                <SellTable key="sellTable" />
                <LastPrice />
                <BuyTable key="buyTable" />
                {/* <div className="positionSetting">
                    <span className="position">盘口档位设置</span>
                    <Select defaultValue="10" onChange={this.onChange} style={{ width: 120 }}>
                        <Option value="5">5</Option>
                        <Option value="6">6</Option>
                        <Option value="7">7</Option>
                        <Option value="8">8</Option>
                        <Option value="9">9</Option>
                        <Option value="10">10</Option>
                    </Select>
                </div> */}
            </div > 
            // :
            //     <div className="example">
            //         <Spin />
            //     </div>

        )
    }
}

export default connect(({ instrument }) => {
    const { riskStep } = instrument;
    return {
        riskStep
    }
})(
    Index
)
