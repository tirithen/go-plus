/** @babel */
/** @jsx etch.dom */
/* eslint-disable react/no-unknown-property */

import etch from 'etch'
import EtchComponent from './../etch-component'
import Octicon from 'etch-octicon'

export default class InformationView extends EtchComponent {
  constructor (props) {
    if (!props.content) {
      props.content = 'empty'
    }
    super(props)
    if (props.model) {
      props.model.view = this
      props.model.updateContent()
    }
  }

  getTitle () {
    return 'go env'
    // return (
    //   <span>
    //     <Octicon name='info' /> go env
    //   </span>
    // )
  }

  getURI () {
    return 'atom://go-plus-information'
  }

  getDefaultLocation () {
    return 'right'
  }

  serialize () {
    return {
      deserializer: 'go-plus-information/InformationView'
    }
  }

  render () {
    let style = 'white-space: pre-wrap;'
    if (this.props.model.orientation === 'vertical') {
      style = style + ' width: 100%; word-wrap: break-word;'
    }
    if (this.props.style) {
      style = style + ' ' + this.props.style
    }
    return (
      <span ref='content' style={style} tabIndex='-1'>
        {this.props.content}
      </span>
    )
  }

  dispose () {
    this.destroy()
  }
}
