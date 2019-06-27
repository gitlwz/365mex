import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { Card , Tabs, message, language } from 'quant-ui';
import { routerRedux } from 'dva/router';
import InMoney from './inMoney';
import OutMoney from './outMoney';
let { getLanguageData } = language;
let $ = getLanguageData;
const TabPane = Tabs.TabPane;
class Index extends Component {
    componentDidMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/findUserInfo",
        });
    }
    render() {
        return (
            <Card className="hover-shadow captialTotal">
                <Tabs onChange={(key) => window.localStorage.setItem("in_out_type", key)} defaultActiveKey={this.props.inOutType}>
                    <TabPane tab="充值" key="1">
                        <InMoney />
                    </TabPane>
                    <TabPane tab="提现" key="2">
                        <OutMoney />
                    </TabPane>
                </Tabs>
            </Card>
        )
    }
}

export default connect(({ accountInfo }) => {
    const { inOutType, dataSource } = accountInfo;
    return {
        inOutType,
        dataSource
    }
})(
    Index
)
