import React, { Component } from 'react'
import { connect } from 'dva';
import "./index.less";
import { language, Form, message, Collapse, Select, Card, Row, Col, Table, Button } from 'quant-ui';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import AddModal from './addModal';
import AddModalShow from './addModalShow';
let $ = language.getLanguageData;
let page = null;

const columns = [{
    title: '密钥名称',
    dataIndex: 'keyName',
    key: 'keyName',
}, {
    title: 'ID',
    dataIndex: 'keyId',
    key: 'keyId',
}, {
    title: 'CIDR',
    dataIndex: 'cidr',
    key: 'cidr',
}, {
    title: '创建时间',
    dataIndex: 'operateTime',
    key: 'operateTime',
    render: (record, obj, index) => {
        return <span>{moment(record).format("lll")}</span>
    }
}, {
    title: '权限',
    dataIndex: 'keyRight',
    key: 'keyRight',
    render: (record, obj, index) => {
        if(record === "1"){
            return <span>阅读</span>
        }else if(record === "2"){
            return <span>委托</span>
        }else if(record === "3"){
            return <span>取消委托</span>
        }else{
            return <span>--</span>
        }
    }
}, {
    title: '状态',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (record, obj, index) => {
        if(record === "1"){
            return <span>启用</span>
        }else{
            return <span>停用</span>
        }
    }
}, {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    render: (record, obj, index) => {
        let text = obj.isActive === "1" ? "停用" : "启用";
        return <div>
            <Button type="primary" onClick={(e) => page.apiKeyEnable(obj)} style={{marginRight: 10}} size="small">{text}</Button>
            <Button type="danger" size="small" onClick={(e) => page.deleteApi(obj)}>删除</Button>
        </div>
    }
}];
class Index extends Component {
    constructor(props){
        super(props);
        page=this;
    }
    componentWillReceiveProps = (nextProps) => {
        const { dispatch } = this.props;
        if(!!nextProps.dataSource){
            // if(nextProps.dataSource.applyStatus !== "6" && nextProps.dataSource.applyStatus !== "7"){
            //     message.error($('请先进行安全设置!'));
            //     dispatch(routerRedux.push({
            //         pathname: '/account/personal-safety',
            //     }));
            // }
        }
    }
    componentDidMount = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/apiKeyGet",
        })
        dispatch({
            type: "accountInfo/findUserInfo",
        });
    }
    apiKeyEnable = (obj) => {
        const { dispatch } = this.props;
        let type = "accountInfo/apiKeyEnable";//启用
        if(obj.isActive === "1"){
            type = "accountInfo/apiKeyDisable";
        }
        dispatch({
            type: type,
            payload: {
                keyId: obj.keyId,
            }
        })
    }
    deleteApi = (obj) => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/apiKeyDelete",
            payload: {
                keyId: obj.keyId,
            }
        })
    }
    onClick = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "accountInfo/save",
            payload: {
                addVisibleApi: true,
            }
        })
    }
    render() {
        const { apiData } = this.props; 
        return (
            <Card className="hover-shadow noties">
                <Button onClick={this.onClick} style={{ marginBottom: 10 }} type="primary">新增</Button>
                <Table size="small" dataSource={apiData} columns={columns} />
                <AddModal />
                <AddModalShow />
            </Card>
        )
    }
}

export default connect(({ accountInfo }) => {
    const { apiData, dataSource } = accountInfo;
    return {
        apiData,
        dataSource,
    }
})(
    Index
)
