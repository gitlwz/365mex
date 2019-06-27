import React, { Component } from 'react'
import { language, Menu } from 'quant-ui';
import { connect } from 'dva';
const $ = language.getLanguageData;
class Index extends Component {
    handleClickPos = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: "orderList/save",
            payload: {
                currentPosition: e.key
            }
        })
    }
    showUserOrderMenu = () => {
        const { currentPosition } = this.props; 
        const { positionHavaListData } = this.props;
        let _positionHavaListData = positionHavaListData.filter(item => item.currentQty !== 0);
        let length = 0;
        try{
            length = _positionHavaListData.length;
        }catch(error){

        }
        let showText = $('持有仓位') + "[" + length + "]";
        return <div>
            <Menu
                onClick={this.handleClickPos}
                selectedKeys={[currentPosition]}
                mode="horizontal"
            >
                <Menu.Item key="position">
                    {showText}
                </Menu.Item>
                <Menu.Item key="positionHave">
                    {$('已平仓仓位')}
                </Menu.Item>
            </Menu>
        </div>
    }
    render() {
        return (
            <div>
                {this.showUserOrderMenu()}
            </div>
        )
    }
}
export default connect(({ orderList }) => {
    const {  currentPosition, positionHavaListData } = orderList;
    return {
        currentPosition,
        positionHavaListData,
    }
})(
    Index
)