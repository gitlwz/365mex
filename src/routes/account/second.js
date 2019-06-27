import React, { Component } from 'react'
import { connect } from 'dva';
export class second extends Component {
  render() {
    return (
      <div>
        321321
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
    second
)
