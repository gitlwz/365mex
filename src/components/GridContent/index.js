/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { getFromLS, saveToLS } from "./utils";
import { connect } from 'dva';
import map from "lodash/map"
import GridCard from "./GridCard.js"
import cloneDeep from "lodash/cloneDeep";
import { ReactGridLayout, Button, language, Menu, Dropdown, Icon, Checkbox, theme } from "quant-ui";
let $ = language.getLanguageData;
const { getCurrentColor, refreshColor, setCurrentColor } = theme;
const { WidthProvider, Responsive } = ReactGridLayout;
const ResponsiveReactGridLayout = WidthProvider(Responsive);
const CheckboxGroup = Checkbox.Group;
const currency = {
    "XBt": "XBt (Satoshi)",
    "μXBT": "μXBT (micro-Bitcoin)",
    "mXBT": "mXBT (milli-Bitcoin)",
    "XBT": "XBT (Bitcoin)",
}
class Index extends Component {
    static defaultProps = {
        onLayoutChange: () => { },
        titleBgColor: "#eee",
        screenChange: () => { }
    }
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            options: [
                { label: $('委托列表'), value: '0', checked: true },
                { label: $('图表'), value: '1', checked: true },
                { label: $('近期交易'), value: '2', checked: true },
                { label: $('用户订单'), value: '3', checked: true },
                { label: $('深度图'), value: '4', checked: false },
                { label: $('保证金'), value: '5', checked: false },
                { label: $('合约指数'), value: '6', checked: false },
            ],
            currentBreakpoint: "lg",
            currencyType: window.localStorage.getItem("currencyType") || "XBt",
            toolbox: JSON.parse(JSON.stringify(this.getToolboxs())),
            layouts: JSON.parse(JSON.stringify(this.getLayouts(this.props.defaultLayouts)))
        }
        window.localStorage.setItem("recent_data_height", window.localStorage.getItem("recent_data_height") || JSON.stringify(8))
        window.localStorage.setItem("user_order_height", window.localStorage.getItem("user_order_height") || JSON.stringify(6))
        window.localStorage.setItem("recent_data_height_L", window.localStorage.getItem("recent_data_height_L") || JSON.stringify(50))
        window.localStorage.setItem("recent_data_height_second", window.localStorage.getItem("recent_data_height_second") || JSON.stringify(14))
    }
    componentDidMount = () => {
        const { dispatch } = this.props;
        let layout = this.state.layouts[this.state.currentBreakpoint];
        let index = layout.findIndex((item) => item.i == "0");
        if (index !== -1) {
            let item = layout[index];
            if (item.w <= 5) {
                dispatch({
                    type: "login/save",
                    payload: {
                        orderListWidth: true,
                    }
                })
            } else {
                dispatch({
                    type: "login/save",
                    payload: {
                        orderListWidth: false,
                    }
                })
            }
        }
        // window._worker.postMessage({
        //     method: "title", data: {
        //         recent_data_height: window.localStorage.getItem("recent_data_height") || JSON.stringify(10),
        //         recent_data_height_L: window.localStorage.getItem("recent_data_height_L") || JSON.stringify(50),
        //         recent_data_height_second: window.localStorage.getItem("recent_data_height_second") || JSON.stringify(16),
        //     }
        // })
    }
    shouldComponentUpdate = (nextProps, nextState) => {
        if (this.state.currentBreakpoint !== nextState.currentBreakpoint && this.state.layouts.length > 0) {
            let height = this.state.layouts[nextState.currentBreakpoint][0].h;
            window.localStorage.setItem("recent_data_height", JSON.stringify(height))
            let num = height - 8;
            if (num > 0) {
                height = 10 + num * 2;
            } else {
                height = 10 - num * 2;
            }
            window.localStorage.setItem("recent_data_height_second", JSON.stringify(height))
            // window._worker.postMessage({
            //     method: "title", data: {
            //         recent_data_height: this.state.layouts[nextState.currentBreakpoint][0].h,
            //         recent_data_height_second: JSON.stringify(height),
            //     }
            // })
        }
        return true;
    }
    //还原布局
    rollback = () => {
        const { dispatch } = this.props;
        let layouts = this.props.defaultLayouts;
        if (!layouts.md) {
            layouts.md = layouts.lg;
        }
        if (!layouts.sm) {
            layouts.sm = layouts.md;
        }
        if (!layouts.xs) {
            layouts.xs = layouts.sm;
        }
        this.setState({
            toolbox: [],
            layouts: layouts
        })
        saveToLS(this.props.name, layouts);
        saveToLS(this.props.name + "-toolbox", []);
        dispatch({
            type: "login/save",
            payload: {
                fullOrSmall: false,
                orderListFullOrSm: false
            }
        })
        this.props.resetChart()
    }
    //放大
    fullScreen = (layouts) => {
        if (!layouts.md) {
            layouts.md = layouts.lg;
        }
        if (!layouts.sm) {
            layouts.sm = layouts.md;
        }
        if (!layouts.xs) {
            layouts.xs = layouts.sm;
        }
        this.setState({
            // toolbox: [],
            layouts: layouts
        })
    }
    getLayouts = (defaultLayouts) => {
        let locasdata = getFromLS(this.props.name)
        let layouts = locasdata || defaultLayouts;
        if (!layouts.md) {
            layouts.md = layouts.lg;
        }
        if (!layouts.sm) {
            layouts.sm = layouts.md;
        }
        if (!layouts.xs) {
            layouts.xs = layouts.sm;
        }
        if (!locasdata) {
            saveToLS(this.props.name, layouts);
        }
        return layouts
    }
    getToolboxs = () => {
        let value = getFromLS(this.props.name + "-toolbox") || [];
        let locasdata = getFromLS(this.props.name)
        let layouts = locasdata;
        if (value.length === 0 && !locasdata) {
            let layouts = cloneDeep(this.props.defaultLayouts);
            if (!layouts.md) {
                layouts.md = layouts.lg;
            }
            if (!layouts.sm) {
                layouts.sm = layouts.md;
            }
            if (!layouts.xs) {
                layouts.xs = layouts.sm;
            }
            let layoutsArrls = layouts.lg.filter((item) => item.checked !== false);
            let layoutsArrmd = layouts.md.filter((item) => item.checked !== false);
            let layoutsArrsm = layouts.sm.filter((item) => item.checked !== false);
            let layoutsArrxs = layouts.xs.filter((item) => item.checked !== false);
            layouts.lg = layoutsArrls
            layouts.md = layoutsArrmd
            layouts.sm = layoutsArrsm
            layouts.xs = layoutsArrxs
            let toolbox = this.props.defaultLayouts['lg'].filter((item) => item.checked === false);
            this.setState({
                toolbox: toolbox,
                layouts: layouts
            })
            saveToLS(this.props.name, layouts);
            saveToLS(this.props.name + "-toolbox", toolbox);
        }
        return getFromLS(this.props.name + "-toolbox") || [];
    }
    onLayoutChange = (layout, layouts) => {
        const { dispatch } = this.props;
        let index = layout.findIndex((item) => item.i == "0");
        let userOrderIndex = layout.findIndex((item) => item.i == "3");
        if (userOrderIndex !== -1) {
            let item = layout[userOrderIndex];
            window.localStorage.setItem("user_order_height", JSON.stringify(item.h));
            this.props.onLayoutChangeOrder(item.h);
        }
        if (index !== -1) {
            let item = layout[index];
            if (item.w <= 4) {
                dispatch({
                    type: "login/save",
                    payload: {
                        orderListWidth: true,
                    }
                })
            } else {
                dispatch({
                    type: "login/save",
                    payload: {
                        orderListWidth: false,
                    }
                })
            }
            window.localStorage.setItem("recent_data_height", JSON.stringify(item.h))
            let height = item.h;
            let num = height - 8;
            if (num > 0) {
                height = 10 + num * 2;
            } else {
                height = 10 - num * 2;
            }
            // if (window.localStorage.getItem("recent_data_height_L") == 50) {
            //     if (item.h >= 16 || height >= 25) {
            //         height = 25;
            //     }
            // }
            window.localStorage.setItem("recent_data_height_second", JSON.stringify(height))
            // window._worker.postMessage({
            //     method: "title", data: {
            //         recent_data_height: JSON.stringify(item.h),
            //         recent_data_height_second: JSON.stringify(height),
            //     }
            // })
            // window._worker.postMessage({
            //     method: "changeLayout"
            // })
            this.props.onLayoutChangeSecond(height)
        }
        if (layout.length !== 1) {
            saveToLS(this.props.name, layouts);
        }
        this.setState({ layouts });
        this.props.onLayoutChange(layout, layouts)
    }
    //删除
    onPutItem = item => {
        this.setState(prevState => {
            item.checked = false;
            let toolbox = [
                ...prevState.toolbox,
                item
            ]
            saveToLS(this.props.name + "-toolbox", toolbox);
            return {
                toolbox: toolbox,
                layouts: {
                    ...prevState.layouts,
                    ["lg"]: prevState.layouts[
                        "lg"
                    ].filter(({ i }) => i !== item.i),
                    ["md"]: prevState.layouts[
                        "md"
                    ].filter(({ i }) => i !== item.i),
                    ["sm"]: prevState.layouts[
                        "sm"
                    ].filter(({ i }) => i !== item.i),
                    ["xs"]: prevState.layouts[
                        "xs"
                    ].filter(({ i }) => i !== item.i)
                }
            };
        });
    }
    //添加
    onTakeItem = item => {
        if (item.i === '4') {
            this.props.reRenderChart(1000)
        }
        this.setState(prevState => {
            let toolbox = prevState.toolbox.filter((ele) => ele.i !== item.i);
            saveToLS(this.props.name + "-toolbox", toolbox);
            let index = prevState.layouts.lg.findIndex((v) => v.i > item.i);
            let lg = [...prevState.layouts.lg];
            let md = [...prevState.layouts.md];
            let sm = [...prevState.layouts.sm];
            let xs = [...prevState.layouts.xs];
            item.checked = true;
            lg.splice(index, 0, item);
            md.splice(index, 0, item);
            sm.splice(index, 0, item);
            xs.splice(index, 0, item);
            return {
                toolbox: toolbox,
                layouts: {
                    ...prevState.layouts,
                    lg: lg,
                    // [
                    //     ...prevState.layouts.lg,
                    //     item
                    // ],
                    md: md,
                    // [
                    //     ...prevState.layouts.md,
                    //     item
                    // ],
                    sm: sm,
                    // [
                    //     ...prevState.layouts.sm,
                    //     item
                    // ],
                    xs: xs,
                    // [
                    //     ...prevState.layouts.xs,
                    //     item
                    // ]
                }
            }
        });
    };
    renderItem = () => {
        let itemArr = map(this.state.layouts[this.state.currentBreakpoint], l => {
            return (
                <div key={l.i} >
                    <GridCard layouts={this.state.layouts}
                        currentBreakpoint={this.state.currentBreakpoint}
                        showSettingFun={this.props.showSettingFun}
                        showSetting={l.i == "0" ? true : false}
                        item={l}
                        key={l.i}
                        title={this.props.titles[l.i]}
                        onClose={() => this.onPutItem(l)}
                        fullScreen={this.fullScreen}
                    >
                        {this.props.renderItem(l)}
                    </GridCard>
                </div>
            );
        });
        return itemArr
    }
    onBreakpointChange = (breakpoint) => {
        this.setState(prevState => ({
            currentBreakpoint: breakpoint,
        }));
    }
    colorhandleMenuClick = (key) => {
        let keyNow = getCurrentColor();
        if (key === keyNow) {
            return;
        } else {
            setCurrentColor(key)
            refreshColor()
        }
    }
    currencyMenuClick = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'margin/save',
            payload: {
                currencyType: e.key
            }
        });
        this.setState({ currencyType: e.key });
        window.localStorage.setItem("currencyType", e.key);
    }
    currencyMenu = () => {
        return <Menu
            onClick={this.currencyMenuClick}
            selectedKeys={[this.state.currencyType]}
        >
            <Menu.Item key="XBt">XBt (Satoshi)</Menu.Item>
            <Menu.Item key="μXBT">μXBT (micro-Bitcoin)</Menu.Item>
            <Menu.Item key="mXBT">mXBT (milli-Bitcoin)</Menu.Item>
            <Menu.Item key="XBT">XBT (Bitcoin)</Menu.Item>
        </Menu>;
    }
    menu = () => {//
        let data = this.state.layouts[this.state.currentBreakpoint];
        return < Menu style={{ width: 325 }} >
            <Menu.Item disabled className="titleMenu" key="title">
                <div style={{ height: 33, width: 220 }} className='orderTypeSelect'>
                    <label className='titleMenu_title' for="currency">{$('货币显示')}</label>
                    <div className="select_type">
                        <Dropdown placement='bottomRight' overlay={this.currencyMenu()} trigger={['click']}>
                            <span style={{ width: 145, display: "inline-block", cursor: 'pointer' }}>
                                <span style={{ fontSize: 14 }}>{currency[this.state.currencyType]}</span>
                                <a style={{ position: 'absolute', right: "90px" }} className="ant-dropdown-link" href="#">
                                    <Icon type="caret-down" />
                                </a>
                            </span>
                        </Dropdown>
                    </div>
                </div>
            </Menu.Item>
            <Menu.Item disabled className="titleMenu" key="title">
                <label className='titleMenu_title'>{$('主题色')}</label>
                <div className='titleMenu_color'>
                    <span onClick={() => this.colorhandleMenuClick("default")} className='titleMenu_dark'></span>
                    <span onClick={() => this.colorhandleMenuClick("red")} className='titleMenu_white'></span>
                </div>
            </Menu.Item>
            <Menu.Item disabled className="titleMenu" key="title">
                <div style={{ height: 120, width: 325 }}>
                    <label className='titleMenu_title'>{$('定制面板')}</label>
                    <div className='titleMenu_checkbox'>
                        {this.state.options.map((item) => {
                            let check = true;
                            if (data.findIndex((item2) => item2.i === item.value) === -1) {
                                check = false;
                            }
                            return <Checkbox checked={check} value={item.value} onChange={() => this.onChange(item.value)}>{item.label}</Checkbox>
                        })}
                    </div>
                </div>
            </Menu.Item>
            {/* {this.state.options.map((item) => {
                let check = true;
                if (data.findIndex((item2) => item2.i === item.value) === -1) {
                    check = false;
                }
                return <Menu.Item key={item.value}>
                    <Checkbox checked={check} value={item.value} onChange={() => this.onChange(item.value)}>{item.label}</Checkbox>
                </Menu.Item>
            })} */}
        </Menu>
    }
    handleVisibleChange = (value) => {
        this.setState({
            visible: value
        })
    }
    onChange = (value) => {
        let item = this.state.toolbox || []
        let index = item.findIndex((item) => item.i === value);
        if (index !== -1) {
            this.onTakeItem(item[index])
        } else {
            let data = this.state.layouts[this.state.currentBreakpoint];
            let index2 = data.findIndex((item2) => item2.i === value);
            if (index2 !== -1) {
                this.onPutItem(data[index2])
            }
        }
    }
    renderMenu = () => {//
        return <Dropdown
            trigger={['click']}
            overlay={this.menu()}
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
        >
            <span>
                <i className={'all-icon-img set'}></i>
            </span>
        </Dropdown>
    }
    render() {
        let item = this.state.toolbox || [];
        return (
            <div style={{ position: "relative" }}>
                <div className="quant-react-grid-buttons">
                    {!this.props.fullOrSmall ? <span style={{ cursor: 'pointer', lineHeight: '26px' }}>{this.renderMenu()}</span> : ''}
                    {/* <Button size="small" onClick={this.rollback} icon="rollback" style={{ float: "right" }}>{$("还原布局")}</Button> */}
                    <div style={{ clear: "both" }}></div>
                </div>
                <ResponsiveReactGridLayout
                    className="layout"
                    margin={[5, 5]}
                    cols={this.props.cols || { lg: 16, md: 12, sm: 8, xs: 4, xxs: 2 }}
                    rowHeight={this.props.rowHeight || 31}
                    onBreakpointChange={this.onBreakpointChange}
                    layouts={this.state.layouts}
                    draggableHandle=".react-grid-dragHandle"
                    onLayoutChange={(layout, layouts) =>
                        this.onLayoutChange(layout, layouts)
                    }
                >
                    {this.renderItem()}
                </ResponsiveReactGridLayout>
            </div>

        );
    }
}
export default connect(({ login }) => {
    const { fullOrSmall } = login;
    return {
        fullOrSmall
    }
})(
    Index
)