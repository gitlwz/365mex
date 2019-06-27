import React from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { getRoutes, getPageQuery, getQueryPath } from '../utils/utils';
import config from '../common/config';

function getLoginPathWithRedirectPath() {
    const params = getPageQuery();
    const { redirect } = params;
    return getQueryPath('/user/login', {
        redirect,
    });
}

class UserLayout extends React.PureComponent {
    getPageTitle() {
        const { routerData, location } = this.props;
        const { pathname } = location;
        let title = '365MEX';
        if (routerData[pathname] && routerData[pathname].name) {
            title = `${routerData[pathname].name} - 365MEX`;
        }
        return title;
    }

    render() {
        const { routerData, match } = this.props;
        return (
            <DocumentTitle title={this.getPageTitle()}>
                <div className={'UserLayout-container'} >
                    <div className={'UserLayout-content'} style={{backgroundImage:`url(${ config.LOGIN_BG })`}}>
                        <div className={'UserLayout-top'}>
                            {/* <div className={'UserLayout-header'}>
                                <Link to="/transaction/XBTUSD">
                                    <img alt="logo" className={'UserLayout-logo'} src={config.LOGON_LOGO} />
                                </Link>
                            </div> */}
                            <div className={'UserLayout-desc'}>{config.LOGON_DESC}</div>
                        </div>
                        <Switch>
                            {getRoutes(match.path, routerData).map(item => (
                                <Route
                                    key={item.key}
                                    path={item.path}
                                    component={item.component}
                                    exact={item.exact}
                                />
                            ))}
                            <Redirect from="/user" to={getLoginPathWithRedirectPath()} />
                        </Switch>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

export default UserLayout;
