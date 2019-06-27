import React, { Component } from 'react'
import { connect } from 'dva';
class Index extends Component {
  render() {
    return (
      <div>
        123123
      </div>
    )
  }
}
export default connect(({accountInfo}) => {
    const {selectedKeys} = accountInfo;
    return {
        selectedKeys
    }
})(
    Index
)
