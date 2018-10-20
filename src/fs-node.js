import PropTypes from 'prop-types'
import React from 'react'

import Icons from './icons'
import { exports } from './module'
import Shapes from './shapes'

class FSNode extends React.Component {
  static propTypes = {
    node: Shapes.Node.isRequired,
    parentComponent: PropTypes.instanceOf(React.Component).isRequired,
    depth: PropTypes.number,
    noninteractive: PropTypes.boolean,
    onSelect: PropTypes.func,
    onDeselect: PropTypes.func,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
  }

  static defaultProps = {
    depth: 0,
    noninteractive: false,
    onSelect: () => {},
    onDeselect: () => {},
    onClose: () => {},
    onOpen: () => {},
  }

  get depth() {
    return this._depth
  }

  get parentComponent() {
    return this._parentComponent && this._parentComponent._parentComponent
  }

  get childComponents() {
    return [...this._childComponents]
  }

  get path() {
    return this._path
  }

  constructor(props) {
    super(props)

    this._depth = props.depth
    this._parentComponent = props.parentComponent
    this._path = props.parentComponent._path + props.node.name
    this._childComponents = []

    this.state = {
      node: props.node
    }
  }

  componentDidMount() {
    this._mounted = true
  }

  componentWillUpdate() {
    this._childComponents = []
  }

  componentWillUnmount() {
    this._mounted = false
  }

  render() {
    const { node } = this.state
    const { noninteractive } = this.props

    return (
      <div className="FSNode">
        <div className={this._getWrapClass()} style={this._getWrapStyle()}>
          <div className="FSNode-node" style={this._getNodeStyle()}>
            <div className="FSNode-descriptor">
              <div className="FSNode-icon" onClick={!noninteractive && (() => this.toggleOpen())}>{this._getIcon()}</div>
              <div className="FSNode-text" onClick={!noninteractive && (() => this.toggleSelect())}>{node.name}</div>
            </div>
            {node.childNodes && node.opened && (
              <exports.FSTree
                ref={ref => ref && (this._childComponents = ref._childComponents)}
                childNodes={node.childNodes}
                parentComponent={this}
                depth={this._depth}
                noninteractive={noninteractive}
                onSelect={this._onSelect}
                onDeselect={this._onDeselect}
                onOpen={this._onOpen}
                onClose={this._onClose}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  select(onSelect = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      const args = [this.state.node, this]

      this.props.onSelect(...args)
      onSelect(...args)

      return resolve(args)
    }

    if (this.state.node.selected) return callback()

    if (!this._mounted) {
      const node = this.state.node
      node.selected = true

      return callback()
    }

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          selected: true
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  deselect(onDeselect = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      const args = [this.state.node, this]

      this.props.onDeselect(...args)
      onDeselect(...args)

      return resolve(args)
    }

    if (!this.state.node.selected) return callback()

    if (!this._mounted) {
      const node = this.state.node
      node.selected = false

      return callback()
    }

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          selected: false
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  toggleSelect(onToggle) {
    return this.state.node.selected ? this.deselect(onToggle) : this.select(onToggle)
  }

  close(onClose = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      const args = [this.state.node, this]

      this.props.onClose(...args)
      onClose(...args)

      return resolve(args)
    }

    if (!this.state.node.childNodes) return callback()
    if (!this.state.node.opened) return callback()

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          opened: false
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  open(onOpen = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      const args = [this.state.node, this]

      this.props.onOpen(...args)
      onOpen(...args)

      return resolve(args)
    }

    if (!this.state.node.childNodes) return callback()
    if (this.state.node.opened) return callback()

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          opened: true
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  toggleOpen(onToggle) {
    return this.state.node.opened ? this.close(onToggle) : this.open(onToggle)
  }

  _getWrapClass = () => {
    const selected = this.state.node.selected ? 'FSNode-selected' : 'FSNode-deselected'

    return `FSNode-wrap ${selected}`
  }

  _getDepthSize = (depth = this._depth) => {
    let padding = 23 * depth

    if (!this.state.node.childNodes) {
      padding += 14
    }

    return padding + 'px'
  }

  _getWrapStyle = () => {
    const translateX = this._getDepthSize(this._depth - 1)

    return {
      transform: `translateX(-${translateX})`,
      width: `calc(100% + ${translateX})`,
    }
  }

  _getNodeStyle = () => {
    return {
      paddingLeft: this._getDepthSize(this._depth),
      zIndex: this._depth,
    }
  }

  _getIcon = () => {
    const { node } = this.state
    const { noninteractive } = this.props

    if (!node.childNodes) {
      switch (node.mode) {
        case 'a': return (
          <span onClick={!noninteractive && (() => this.toggleSelect())}>
            <span className='FSNode-mode FSNode-mode-a'>A</span>
            <Icons.File />
          </span>
        )
        case 'd': return (
          <span onClick={!noninteractive && (() => this.toggleSelect())}>
            <span className='FSNode-mode FSNode-mode-d'>D</span>
            <Icons.File />
          </span>
        )
        case 'm': return (
          <span onClick={!noninteractive && (() => this.toggleSelect())}>
            <span className='FSNode-mode FSNode-mode-m'>M</span>
            <Icons.File />
          </span>
        )
        default: return <Icons.File onClick={!noninteractive && (() => this.toggleSelect())}/>
      }
    }

    return !node.opened ? (
      <span>
        <Icons.CaretRight />
        <Icons.Folder />
      </span>
    ) : (
      <span>
        <Icons.CaretDown />
        <Icons.FolderOpen />
      </span>
    )
  }

  _onSelect = (node, component) => {
    this.props.onSelect(node, component)
  }

  _onDeselect = (node, component) => {
    this.props.onDeselect(node, component)
  }

  _onOpen = (node, component) => {
    this.props.onOpen(node, component)
  }

  _onClose = (node, component) => {
    this.props.onClose(node, component)
  }
}

exports.FSNode = FSNode
