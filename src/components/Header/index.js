/*
 * @Author: 刘文柱 
 * @Date: 2018-10-18 10:10:14 
 * @Last Modified by:   刘文柱 
 * @Last Modified time: 2018-10-18 10:10:14 
 */
import React, { PureComponent } from 'react';
import { Layout } from 'quant-ui';
import { connect } from 'dva';
import GlobalHeader from '../GlobalHeader';
import TopNavHeader from '@/components/TopNavHeader';
import config from "../../common/config.js";
const { Header } = Layout;
class HeaderView extends PureComponent {
    state = {
        visible: true,
    };
    componentWillMount = () => {
        // const { dispatch } = this.props;
        // let loginId = window.localStorage.getItem("qtCoin_LoginID");
        // if (loginId) {
        //     dispatch({
        //         type: "login/getUserSysApiKey",
        //     })
        // }
    }

    getHeadWidth = () => {
        return '100%';
    };

    render() {
        const { isMobile } = this.props;
        const isTop = config.isTop;

        return (
            <Header
                style={{ padding: 0}}
            >
                {/* {isTop && !isMobile ? ( */}
                    <TopNavHeader
                        {...this.props}
                    />
                {/* ) : (
                        <GlobalHeader
                            {...this.props}
                        />
                    )} */}
            </Header>
        );
    }
}

export default connect(({ global }) => ({
    collapsed: global.collapsed,
}))(HeaderView);
