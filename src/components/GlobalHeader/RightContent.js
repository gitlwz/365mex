import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { getUserUserInfo } from '@/utils/authority';
import { getCurrencyType } from '@/utils/utils';
import { theme, Menu, Icon, language, utils, Utils, Dropdown, screenfull, message } from 'quant-ui';
import TOTAL_RIGHT from "../../assets/totalRight.png";
import { routerRedux } from 'dva/router';
import moment from 'moment';
const currency = Utils.currency;
const { store } = utils;
const { getCurrentColor, refreshColor, setCurrentColor } = theme;
let { getCurrentLanguage, setCurrentLanguage, refreshLanguage, getLanguageData } = language;
let $ = getLanguageData;
const americanIcon = require('../../assets/american.png');
const tsIcon = require('../../assets/china.png');
let languageData = <img style={{ height: 15, width: 24 }} src={tsIcon}></img>;
let americanData = <img style={{ height: 15, width: 24 }} src={americanIcon}></img>;
const colormenu = (
    <Menu
        onClick={colorhandleMenuClick}
        defaultSelectedKeys={[getCurrentColor()]}
    >
        <Menu.Item key="red">{$("亮色")}</Menu.Item>
        <Menu.Item key="default">{$("暗色")}</Menu.Item>
    </Menu>
)
function colorhandleMenuClick(e) {
    let key = getCurrentColor();
    if (e.key === key) {
        return;
    } else {
        setCurrentColor(e.key)
        refreshColor()
    }
}

const languagemenu = (
    <Menu
        onClick={languagehandleMenuClick}
        defaultSelectedKeys={[getCurrentLanguage()]}
    >
        <Menu.Item key="zh_CN">{languageData} 简体中文</Menu.Item>
        <Menu.Item key="en_US">{americanData} English</Menu.Item>
    </Menu>
)
function languagehandleMenuClick(e) {
    let key = getCurrentLanguage();
    if (!e.key) return;
    if (e.key === key) {
        return;
    } else {
        setCurrentLanguage(e.key);
        refreshLanguage();
    }
}
const currencyData = {
    "XBt": "XBt (Satoshi)",
    "μXBT": "μXBT (micro-Bitcoin)",
    "mXBT": "mXBT (milli-Bitcoin)",
    "XBT": "XBT (Bitcoin)",
}
class GlobalHeaderRight extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            icontype: "fullscreen",
            currencyType: window.localStorage.getItem("currencyType") || "XBt",
            showAlert: false,
            visible: false,
        }
    }
    componentWillReceiveProps = (props) => {
        if(props.currencyType !== this.props.currencyType){
            this.setState({
                currencyType:props.currencyType
            })
        }
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
    onMenuClick = ({ key }) => {
        const { dispatch } = this.props;
        if (key === 'logout') {
            dispatch({
                type: 'login/logout',
            });
        } else if (key === "delete") {
            store.remove("layout")
            message.success($('清除成功'));
        }

    }
    screenFull = () => {
        if (screenfull.enabled) {
            if (screenfull.isFullscreen) {
                this.setState({ icontype: 'fullscreen' });
                screenfull.exit();
            } else {
                this.setState({ icontype: 'fullscreen-exit' });
                screenfull.request();
            }

        }
    }
    login = () => {
        const { dispatch, symbolCurrent } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/login',
        }));
    }
    register = () => {
        const { dispatch, symbolCurrent } = this.props;
        dispatch(routerRedux.push({
            pathname: '/user/register',
        }));
    }
    renderDivAlert = () => {
        let noticeArr = this.props.announcementData || [];
        return <div className="show_notice" style={{ position: 'absolute' }}>
            {noticeArr.length > 0 ? noticeArr.map((item, index, arr) => {
                if (index < 2) {
                    return <div className='show_notice_item'>
                        <div className='show_notice_time'>{moment(item.timestamp).format("YYYY/MM/DD HH:mm:ss")}</div>
                        <div className='show_notice_title'>{item.title}</div>
                        <div dangerouslySetInnerHTML={{ __html: item.content }} className='show_notice_content'></div>
                        <div className='show_notice_bottom'>
                            <div className='show_notice_bottom_left'>
                                <span className='show_notice_bottom_left_top'>{$('365MEX团队')}</span>
                                <span className='show_notice_bottom_left_bottom'>{moment(item.timestamp).format("LL")}</span>
                            </div>
                            <div className='show_notice_bottom_right'>
                                <a target="_Blank" href={item.link}>{$('查看详情')}</a>
                            </div>
                        </div>
                    </div>
                } else {
                    return <div className='show_notice_item'>
                        <div className='show_notice_time'>{moment(item.timestamp).format("YYYY/MM/DD HH:mm:ss")}</div>
                        <div className='show_notice_title'>
                            {item.title}
                            <span style={{ float: 'right', fontSize: 12 }}><a target="_Blank" href={item.link}>{$('查看详情')}</a></span>
                        </div>
                    </div>
                }
            }) :
                <div className='show_notice_item'>
                    <div style={{ fontSize: 18, textAlign: 'center' }}>{$('暂无公告')}</div>
                </div>
            }
            {noticeArr.length > 0 ? <div className='show_notice_item'>
                <div style={{ textAlign: 'center', fontSize: 12, height: '32px', lineHeight: '32px' }}><a target="_Blank">{$('查看更多')}</a></div>
            </div> : ''}
        </div>
    }
    changeShowAlert = (e) => {
        this.setState({
            showAlert: !this.state.showAlert
        })
    }
    menuSetting = () => {//
        return < Menu style={{ width: 325 }} >
            <Menu.Item disabled className="titleMenu" key="title">
                <div style={{ height: 33, width: 220 }} className='orderTypeSelect'>
                    <label className='titleMenu_title' for="currency">{$('货币显示')}</label>
                    <div className="select_type">
                        <Dropdown placement='bottomRight' overlay={this.currencyMenu()} trigger={['click']}>
                            <span style={{ width: 145, display: "inline-block", cursor: 'pointer' }}>
                                <span style={{ fontSize: 14 }}>{currencyData[this.state.currencyType]}</span>
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
                    <span onClick={() => colorhandleMenuClick("default")} className='titleMenu_dark'></span>
                    <span onClick={() => colorhandleMenuClick("red")} className='titleMenu_white'></span>
                </div>
            </Menu.Item>
        </Menu>
    }
    handleVisibleChange = (value) => {
        this.setState({
            visible: value
        })
    }
    renderMenu = () => {//
        return <Dropdown
            trigger={['click']}
            overlay={this.menuSetting()}
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
        >
            <i className={'all-icon-img set'}></i>
        </Dropdown>
    }
    render() {
        const { dataSource, fullOrSmall } = this.props;
        const menu = (
            <Menu className={'menu'} selectedKeys={[]} onClick={this.onMenuClick}>
                {/* <Menu.Item key="reset">
                    <Icon type="user" />{$("修改密码")}
                </Menu.Item>
                <Menu.Item key="delete">
                    <Icon type="delete" />{$("清空布局")}
                </Menu.Item>
                <Menu.Divider /> */}
                <Menu.Item key="logout">
                    <Icon type="logout" />{$("退出登录")}
                </Menu.Item>
            </Menu>
        );
        // const tsIcon = require('../../assets/china.png');
        // let languageData = <img style={{height:15,width:24}} src={tsIcon}></img>;
        if (getCurrentLanguage() === "en_US") {
            languageData = americanData;
        }
        let calculate = Math.pow(10, getCurrencyType().tick);
        let { isMobile } = this.props;
        let authority = localStorage.getItem('antd-pro-authority');
        let userID = getUserUserInfo();
        const urlParams = new URL(window.location.href);
        let homePage = false;
        if (urlParams.pathname == '/' || urlParams.pathname == '/user/login' || urlParams.pathname == '/user/register' || urlParams.pathname == '/user/forget') {
            homePage = true;
        }
        return (
            <div className={'RightContent-right'}>
                {authority === "admin" ? !homePage &&
                    <span className="topTotalAvali">
                        {/* <img style={{ width: '16px' }} src={TOTAL_RIGHT} alt="total" /> */}
                        <span className='Total'>{" " + currency(parseInt(((dataSource.marginBalance || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key + "(" + $('总') + ")"}</span>
                        <span className='avali'>{currency(parseInt(((dataSource.availableMargin || 0) * getCurrencyType().value / 100000000) * calculate) / calculate, { separator: ',', precision: getCurrencyType().tick }).format() + " " + getCurrencyType().key + "(" + $('可用') + ")"}</span>
                    </span>
                    : ''}
                {homePage ? authority !== "admin" && [<a style={{ color: '#ffffff', marginRight: 18 }} onClick={this.login}>{$("登录")}</a>,
                <a style={{ color: '#ffffff', marginRight: 10 }} onClick={this.register}>{$("注册")}</a>] : ''
                }
                {
                    authority === "admin" ? <Dropdown overlay={menu}>
                        <span className={`action account`}>
                            <i style={{ marginRight: 4 }} className={'all-icon-img user'}></i>
                            {userID}
                        </span>
                    </Dropdown> : ""
                }
                <span className="language-icon">
                    <i onClick={(e) => this.changeShowAlert(e)} style={{ marginRight: 1, cursor: 'pointer' }} className={'all-icon-img clock'}></i>
                </span>
                <span className="language-icon">
                    {this.renderMenu()}
                    {/* <i style={{ marginRight: 1, cursor: 'pointer' }} className={'all-icon-img set'}></i> */}
                </span>
                <span onClick={languagehandleMenuClick} key="a2" className="language-icon">
                    <Dropdown overlay={languagemenu}>
                        <div>{languageData}</div>
                    </Dropdown>
                </span>
                {/* {homePage ? '' :
                    <span style={!fullOrSmall ? { marginLeft: 10 } : {}} onClick={this.screenFull} className="screenFull">
                        {this.state.icontype === 'fullscreen' ?
                            <i style={{ marginRight: 1 }} className={'all-icon-img fullWin'}></i>
                            :
                            <i style={{ marginRight: 1 }} className={'all-icon-img smallWin'}></i>
                        }
                    </span >
                } */}
                {this.state.showAlert ? this.renderDivAlert() : ''}
            </div>
        );
    }
}
export default connect(({ margin, login, accountInfo }) => {
    const { dataSource, currencyType } = margin;
    const { announcementData } = accountInfo;
    const { fullOrSmall } = login;
    return {
        dataSource,
        currencyType,
        fullOrSmall,
        announcementData
    }
})(GlobalHeaderRight)
