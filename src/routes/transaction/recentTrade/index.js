import React, { Component } from 'react'
import { Spin, language } from 'quant-ui';
import { connect } from 'dva';
import TableItem from './tableItem';
let { getLanguageData } = language;
let $ = getLanguageData;
class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource:props.dataSource || []
        }
    }
    componentWillMount = () => {
        // if ("dataSource" in this.props) {
        //     this.setState({
        //         dataSource: this.props.dataSource
        //     })
        // }
    }
    componentWillReceiveProps = (nextProps) => {
        if ("dataSource" in nextProps) {
            this.setState({
                dataSource: nextProps.dataSource
            })
        }
    }
    render() {
        const { loading } = this.props;
        const { dataSource } =this.state;
        return (
            <Spin spinning={loading} wrapperClassName="SpinStyle">
                <div className="recentTrade">
                    {!loading ?
                        <table cellSpacing="0" rules="cols">
                            <thead className="recentTrade-thead">
                                <tr>
                                    <th style={{width: 80}}>{$('价格')}(USD)</th>
                                    <th>{$('数量')}(USD)</th>
                                    <th>{$('时间')}</th>
                                    <th>{$('方向')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataSource.map((ele, index, arr) => {
                                    let className = "red " + ele.anite;
                                    if (ele.side === "Buy") {
                                        className = "green " + ele.anite
                                    }
                                    return (
                                        <TableItem key={ele.trdMatchID} className={className} ele={ele} />
                                    )
                                })}
                            </tbody>
                        </table> : ""}
                </div>
            </Spin>

        )
    }
}

export default connect(({ recentTrade, loading, instrument }) => {
    const { dataSource } = recentTrade;
    const { tickSize } = instrument;
    return {
        dataSource,
        tickSize,
        loading: !!loading.effects["recentTrade/getTrade"]
    }
})(
    Index
)

