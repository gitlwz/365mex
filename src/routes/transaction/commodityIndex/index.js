import React, { Component } from 'react'
import { Tabs , language} from 'quant-ui';
import { connect } from 'dva';
import Product from './product';
import IndexNumber from './indexNumber';
let { getLanguageData } = language;
let $ = getLanguageData;
const TabPane = Tabs.TabPane;
class Index extends Component {
    render() {
        return (
            <div className="perpetual">
                {/* <Tabs defaultActiveKey="1" animated={false}>
                    <TabPane tab={$('商品')} key="1">
                        <Product />
                    </TabPane>
                    <TabPane tab={$('指数')} key="2"> */}
                        <IndexNumber />
                    {/* </TabPane> */}
                {/* </Tabs> */}
            </div>
        )
    }
}

export default connect(() => {
    return {
    }
})(
    Index
)