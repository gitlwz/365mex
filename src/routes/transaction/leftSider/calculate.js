import React, { Component } from 'react'
import { Modal, Collapse, Card, Button, Row, Icon } from 'quant-ui';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
class Index extends Component {
    constructor(props){
        super(props);
    }
    handleCancel = (e) => {
        this.props.changeVis();
    }
    render() {
        return (    
            <Modal
                title="Basic Modal"
                visible={this.props.visible}
                onCancel={this.handleCancel}
                mask={false}
                maskClosable={false}
                footer={null}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        )
    }
}

export default connect(({ instrument }) => {
    const { symbolCurrent } = instrument;
    return {
        symbolCurrent,
    }
})(
    Index
)
