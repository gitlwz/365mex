import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, Popconfirm, Radio, Checkbox, language, Tooltip } from "quant-ui";
import { tooltipShow } from '@/utils/utils';
// import throttle from "lodash/throttle"; 
const RadioGroup = Radio.Group;
let { getLanguageData } = language;
let $ = getLanguageData;
// let page = null;
export class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            dataSource: {
                value: 1,
                checked: false,
                orderBookFull:false,
                fullOrSmall: props.fullOrSmall //默认不全屏
            },
            num: 0
        }
        this.tickArr = [0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
        this.oldScreen = props.layouts;
        this.newScreen = [];
        this.keyValue = {
            "lg": 24,
            "md": 20,
            "sm": 16,
            "xs": 12,
        }
    }
    componentWillReceiveProps = (props) => {
        if (props.depth !== this.tickArr[this.state.num]) {
            let index = this.tickArr.findIndex(item => item === props.depth)
            this.setState({
                num: index
            })
        }
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.state.num !== nextState.num) {
            return true;
        }
        if (this.state.visible !== nextState.visible) {
            return true;
        }
        if (this.props.fullOrSmall !== nextProps.fullOrSmall) {
            return true;
        }
        if (this.state.dataSource.value !== nextState.dataSource.value) {
            return true;
        }
        if (this.state.dataSource.checked !== nextState.dataSource.checked) {
            return true;
        }
        if (this.state.dataSource.fullOrSmall !== nextState.dataSource.fullOrSmall) {
            return true;
        }
        return false;
    }
    isFullScreen = () => {
        if(
            window.outerHeight === window.screen.availHeight
        ){
            if(
                window.outerWidth === window.screen.availWidth
            ){
                return true;// 全屏
            }
        }
        return false;
    }
    // checkIsFull = throttle((pageNum) => {
    //     if(pageNum.isFullScreen()){
    //         console.log(123)
    //     }
    // },500)
    componentWillMount = () => {
        const { dispatch } = this.props;
        if (!window.localStorage.getItem("recent_data_depth")) {
            window.localStorage.setItem("recent_data_depth", 0.5);
            // window._worker.postMessage({ method: "title", data: { depth: 0.5 } })
            dispatch({
                type: "recentTrade/save",
                payload: {
                    depth: 0.5
                }
            })
        }
        // if(window.addEventListener){
        //     let pageNum = this;
        //     window.addEventListener('resize',() => pageNum.checkIsFull(pageNum));
        // }
    }
    screenFull = () => {
        const { dispatch } = this.props;
        this.oldScreen = { ...this.props.layouts };
        this.newScreen = {};
        try {
            if(this.props.item.i === '0'){
                if(this.state.dataSource.value === 1){
                    this.props.showSettingFun(2, 'value');
                }
                this.setState({
                    orderBookFull:true
                })
            }
            if(this.props.item.i === '3'){
                dispatch({
                    type: "login/save",
                    payload: {
                        orderListFullOrSm: true
                    }
                })
            }
        } catch (error) {
            this.setState({
                orderBookFull:false
            })
        }
        for (let key in this.oldScreen) {
            // eslint-disable-next-line no-array-constructor
            this.newScreen[key] = new Array();
            this.newScreen[key].push(Object.assign({}, this.oldScreen[key].filter(item => item.i === this.props.item.i)[0]));
            this.newScreen[key][0].w = this.keyValue[key];
            // if(this.newScreen[key][0].i === "2" || this.newScreen[key][0].i === "5"){
            //     this.newScreen[key][0].h = 20;
            // }else{
            this.newScreen[key][0].h = Math.max((window.innerHeight) / 47.1, 21);
            // }
        }
        if (this.newScreen.lg[0].i === "2") {
            dispatch({
                type: "recentTrade/save",
                payload: {
                    isFullscreen: true
                }
            })
        }
        try {
            const { myChart } = this.props;
            setTimeout(() => {
                try {
                    myChart.resize();
                } catch (error) {
                }
            }, 0);
        } catch (error) {

        }
        this.props.fullScreen(this.newScreen);
        dispatch({
            type: "login/save",
            payload: {
                fullOrSmall: true
            }
        })
    }
    screenSmall = () => {
        try {
            if(this.props.item.i === '0'){
                if(this.state.dataSource.value === 1){
                    this.props.showSettingFun(1, 'value');
                }
                this.setState({
                    orderBookFull:false
                })
            }
        } catch (error) {
            this.setState({
                orderBookFull:true
            })
        }
        const { dispatch } = this.props;
        this.props.fullScreen(this.oldScreen);
        dispatch({
            type: "recentTrade/save",
            payload: {
                isFullscreen: false
            }
        })
        dispatch({
            type: "login/save",
            payload: {
                fullOrSmall: false,
                orderListFullOrSm: false
            }
        })
        // if (screenfull.enabled) {
        //     if (screenfull.isFullscreen) {
        //         screenfull.exit();
        //     } else {
        //         screenfull.request(this.refs["content"]);
        //     }
        // }
        // this.props.resetChart()
    }
    radioChange = (e, key) => {
        let _value = this.state.dataSource.value;
        let dataSource = { ...this.state.dataSource };
        dataSource[key] = e.target.value;
        if (_value !== e.target.value) {
            this.props.showSettingFun(e.target.value, key);
        }
        this.setState({
            dataSource
        })
    }
    checkBoxChange = (e) => {
        let dataSource = { ...this.state.dataSource };
        dataSource.checked = e.target.checked
        this.setState({
            dataSource
        })
    }
    plusOnclick = (e) => {
        const { dispatch } = this.props;
        let num = this.state.num;
        num++;
        if (num >= 13) {
            return;
        }
        this.setState({
            num
        });
        window.localStorage.setItem("recent_data_depth", this.tickArr[num]);
        // window._worker.postMessage({ method: "title", data: { depth: this.tickArr[num] } })
        dispatch({
            type: "orderList/save",
            payload: {
                depth: this.tickArr[num]
            }
        })
    }
    minusOnclick = (e) => {
        const { dispatch } = this.props;
        let num = this.state.num;
        num--;
        if (num < 0) {
            return;
        }
        this.setState({
            num
        });
        window.localStorage.setItem("recent_data_depth", this.tickArr[num]);
        // window._worker.postMessage({ method: "title", data: { depth: this.tickArr[num] } })
        dispatch({
            type: "orderList/save",
            payload: {
                depth: this.tickArr[num]
            }
        })
    }
    titleCalculate = () => {
        return <div className="orderListSelect" style={{ textAlign: "center" }}>
            <div className="title">{$('委托列表选项')}</div>
            <div>
                <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('将委托根据价格区间组合, 更清楚地显示深度。'))}>
                    <span className="combine">{$('合并')}</span>
                </Tooltip>
            </div>
            <div>
                <input
                    className="input_combine"
                    disabled={true}
                    size="small"
                    value={this.tickArr[this.state.num]} />
                <button onClick={this.minusOnclick} className="button btn-danger"><Icon type="minus-square" /></button>
                <button onClick={this.plusOnclick} className="button btn-success"><Icon type="plus-square" /></button>
            </div>
            {this.props.fullOrSmall?'':
                <span>
                    <div>
                        <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('365MEX提供两个委托列表样式, 你可以在此随意转换。'))}>
                            <span className="combine">{$('列')}</span>
                        </Tooltip>
                    </div>
                    <div>
                        <RadioGroup onChange={(e) => this.radioChange(e, "value")} value={this.state.dataSource.value}>
                            <Radio className='radio_color' value={1}>{$('单列')}</Radio>
                            <Radio className='radio_color' value={2}>{$('双列')}</Radio>
                        </RadioGroup>
                    </div>
                </span>
            }
            <div style={{ paddingBottom: 15 }}>
                <Checkbox checked={this.state.dataSource.checked} onChange={this.checkBoxChange}>
                    <Tooltip mouseLeaveDelay={0} placement="right" title={tooltipShow($('当强平委托进入委托列表时, 显示警报。'))}>
                        <span className="combine">{$('强平预警')}</span>
                    </Tooltip>
                </Checkbox>
            </div>
        </div>
    }
    changeVisible = () => {
        this.setState({
            visible: !this.state.visible
        })
    }
    render() {
        let className = "quant-gridcard-title react-grid-dragHandle";
        if(this.props.fullOrSmall){
            className = "quant-gridcard-title-ummove";
        }
        return (
            <div className="hover-shadow quant-gridcard">
                <div className="quant-gridcard-dragHandle" >
                    <span className={className}>{this.props.title}</span>
                    <div className="quant-gridcard-controls">
                        {this.props.showSetting ?
                            <Popconfirm
                                style={{ width: 400 }}
                                icon={null}
                                title={this.titleCalculate()}
                                visible={this.state.visible}
                                okText={null}
                                onVisibleChange={(e) => this.changeVisible()}
                                placement="bottomLeft"
                                cancelText={null}
                            >
                                <i style={{ cursor: 'pointer', textAlign: 'right' }} className={'all-icon-img settingSecond setBac'}></i>
                                {/* <Icon style={{ cursor: 'pointer', marginRight: "8px", textAlign: 'right' }} type="setting" theme="outlined" /> */}
                            </Popconfirm>
                            : ""
                        }
                        {this.props.fullOrSmall ? <div style={{ width: '100%', textAlign: 'right' }}>
                            <i onClick={this.screenSmall} style={{ cursor: 'pointer' }} className={'all-icon-img small'}></i>
                            {/* <Icon onClick={this.screenSmall} style={{ cursor: 'pointer' }} type="fullscreen-exit" theme="outlined" /> */}
                        </div> :
                            <div style={{ width: '100%', textAlign: 'right' }}>
                                <i onClick={this.screenFull} style={{ cursor: 'pointer' }} className={'all-icon-img full'}></i>
                                {/* <Icon onClick={this.screenFull} style={{ cursor: 'pointer' }} type="fullscreen" theme="outlined" /> */}
                                <i onClick={this.props.onClose} style={{ marginLeft: "10px", cursor: 'pointer' }} className={'all-icon-img close'}></i>
                                {/* <Icon onClick={this.props.onClose} style={{ marginLeft: "8px", cursor: 'pointer' }} type="close" theme="outlined" /> */}
                            </div>
                        }

                    </div>
                </div>

                <div data-gridcard={true} data-currentkey={this.props.item.i} ref="content" className="quant-gridcard-content">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default connect(({ orderList, login }) => {
    const { depth, myChart } = orderList;
    const { fullOrSmall } = login;
    return {
        depth,
        myChart,
        fullOrSmall
    }
})(
    Index
)
