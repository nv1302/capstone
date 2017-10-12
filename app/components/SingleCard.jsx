/* global Treant $ */

import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// material ui
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import Toggle from 'material-ui/Toggle'
import IconButton from 'material-ui/IconButton'
import SkipPrevious from 'material-ui/svg-icons/av/skip-previous'
// material ui components for bookmarks
import Checkbox from 'material-ui/Checkbox'
import ActionFavorite from 'material-ui/svg-icons/action/bookmark'
import ActionFavoriteBorder from 'material-ui/svg-icons/action/bookmark-border'


// firebase
import firebase from 'app/fire'
const auth = firebase.auth()

// html parser
import ReactHtmlParser from 'react-html-parser'

// utils
import { getDialogBox, getCancelAlertButton } from '../utils/storyBranchNavUtils'
import history from '../history'
import _ from 'lodash'

// tree graph
import Tree from 'react-tree-graph'

export default class SingleCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isReadingBranchOptions: false,
      branchExpanded: false,
      checked: false,
      loggedIn: false,
      userId: ''
    }
  }

  componentDidMount() {
    // check to see if a user bookmarked this card
    this.unsubscribe = auth.onAuthStateChanged(user => this.setState({ user }, () => {
      if (user) {
        this.setState({
          loggedIn: true,
          userId: user.uid,
        })
        let branchKey = this.props.currentState.currentStoryBranchId
        this.bookmarksListener = firebase.database().ref(`user/${user.uid}/bookmarks/${branchKey}`)
        this.bookmarksListener.on('value', snap => {
          const val = snap.val()
          if (val !== null) this.setState({ checked: true })
        })
      }
    })) // end on AuthStateChanged
  }

  componentWillUnmount() {
    if (this.bookmarksListener) this.bookmarksListener.off()
    this.unsubscribe()
  }

  updateCheck() {
    this.setState((oldState) => {
      return {
        checked: !oldState.checked,
      }
    })
    this.updateUserPref()
  }

  updateUserPref = () => {
    let branchKey = this.props.currentState.currentStoryBranchId
    let cardVal = this.props.currentState.currentCardId
    if (!this.state.checked) {
      // adds story when bookmarked
      firebase.database().ref('user').child(this.state.userId).child('bookmarks').child(branchKey).set(cardVal)
    } else {
      // removes story when un-bookmarked
      firebase.database().ref('user').child(this.state.userId).child('bookmarks').child(branchKey).remove()
    }
  }

  handleDownClick = () => this.setState({ isReadingBranchOptions: true })

  getBranchOptions = () => {
    const branchLinks = []
    const { currentCard, currentStoryBranchId, currentCardId } = this.props.currentState
    const { parentBranchId, parentCardId } = this.props.parent

    if (currentCard && currentCard.branches) {
      Object.keys(currentCard.branches).forEach(branch => {
        if (branch !== currentStoryBranchId && branch !== parentBranchId) {
          branchLinks.push(
            <Link
              key={branch}
              to={`/read/${branch}/${currentCard.branches[branch]}`}
              onClick={() => {
                this.setState({ isReadingBranchOptions: false, isChangingBranch: true })
                this.props.handleOptionClick()
              }}>
              {branch}
            </Link>
          )
        }
      })
    }
    return branchLinks
  }

  getButton = (valCheck, label, bkColor, callback) => {
    if (valCheck) return <FlatButton label={label} backgroundColor={bkColor} onClick={callback} />
  }

  getBranchingButton = (rootId, cardId, currentCard) => {
    return (
      <Link to={`/write/${rootId}/${cardId}/new_branch`}>
        <FlatButton label='Create A Branch' backgroundColor='#D1B38E' disabled={!currentCard.published} />
      </Link>
    )
  }

  handleBranchExpandChange = () => {
    this.setState({ branchExpanded: !this.state.expanded })
  }

  handleToggle = (event, toggle) => {
    this.setState({ branchExpanded: !this.state.branchExpanded })
  };

  handleJumpStart = () => {
    let branchId = this.props.currentState.currentStoryBranchId
    console.log('hello?')
    firebase.database().ref('storyBranch').child(branchId).child('storyCards').once('value')
    .then(snap => {
      return snap.val()[0]
    })
    .then(firstCard => {
      console.log('we here?')
      history.push(`/read/${branchId}/${firstCard}`)
    })
  }

  render() {
    const { currentCard, currentStoryBranchId, currentCardId } = this.props.currentState
    const { parentBranchId, parentCardId } = this.props.parent
    const { isReadingBranchOptions } = this.state
    const branches = this.getBranchOptions()

    const graphBranchOptions = () => {
      const branching = (branchId) => {
        this.props.handleOptionClick()
        history.push(`/read/${branchId}/${currentCard.branches[branchId]}`)
      }
      const topBranches = Object.keys(currentCard.branches).filter(branchId => branchId !== currentStoryBranchId).slice(0, 3)
      if (topBranches.length < 3) {
        return topBranches.map(branchId => ({
          name: branchId,
          onClick: () => branching(branchId)
        }))
      } else {
        return topBranches.map((branchId, ind) => {
          return ind === 2
            ? { name: 'MORE BRANCHES', onClick: () => this.setState({ isReadingBranchOptions: true }) }
            : { name: branchId, onClick: () => branching(branchId) }
        })
      }
    }

    let data = {}
    if (branches.length) {
      data = {
        name: `${currentStoryBranchId}`,
        children: graphBranchOptions(branches)
      }
    }

    const buttonStyle = {
      checked: {
        color: '#FFB6C1',
        width: '40px',
        height: '40px'
      },
      unchecked: {
        width: '40px',
        height: '40px'
      },
      icon: {
        width: '50px',
        height: '50px'
      },
      button: {
        width: '50px',
        height: '50px',
        float: 'left'
      }
    }

    const checkbox = {
      padding: '0px 20px 20px 20px',
      width: '40px',
      height: '40px',
      float: 'right'
    }

    return (
      <Card expanded={this.state.expanded} onExpandChange={this.handleToggle}>
        <CardHeader style={{paddingBottom: '50px', paddingRight: '10px', paddingLeft: '10px'}}>
          <IconButton
          iconStyle={buttonStyle.icon}
          style={buttonStyle.button}
          className="col swipe-btn-left-right flex-arrows"
          onClick={() =>this.handleJumpStart()}
          tooltip="Jump to start of story"
          tooltipPosition={'bottom-right'}
          touch={true}
          >
            <SkipPrevious color="#006064"/>
          </IconButton>
          <Checkbox
            style={checkbox}
            checkedIcon={<ActionFavorite style={buttonStyle.checked} />}
            uncheckedIcon={<ActionFavoriteBorder style={buttonStyle.unchecked} />}
            checked={this.state.checked}
            onCheck={this.updateCheck.bind(this)}
          />
        </CardHeader>
        <CardTitle title="" subtitle={`Scene originally from "${currentCard.branchTitle}"`} subtitleStyle={{ padding: '3px 10px 3px 0px', color: 'white', backgroundColor: '#d4d4d4', textAlign: 'right' }} />
        <CardText>
          {
            currentCard
              ? currentCard.published
                ? ReactHtmlParser(currentCard.text)
                : <div><h3>This card hasn't been published yet!</h3>Stay tuned for more from <Link to={`/allUsers/${currentCard.userId}`}>this user.</Link></div>
              : <div></div>
          }
          <Divider />
        </CardText>
        <CardText actAsExpander={true}>
          <Toggle
            toggled={this.state.branchExpanded}
            onToggle={this.handleToggle}
            labelPosition="left"
            label="Check out alternate branches from the scene: "
          />
        </CardText>
        <CardActions expandable={true}>
          <p>(LEFT: current story branch, RIGHT: alternate branches)</p>
          {
            !_.isEmpty(data)
              ? <Tree data={data} nodeOffset={15} treeClassName="cardBranchTree" height={200} width={600} animated />
              : <p>No alternate branches.</p>
          }
          <div>
            Want to write your own branch of this story?{' '}
            {
              this.getBranchingButton(currentStoryBranchId, currentCardId, currentCard)
            }
          </div>
          {
            getDialogBox(
              'Choose another story branch to read:',
              branches,
              getCancelAlertButton(() => this.setState({ isReadingBranchOptions: false })),
              isReadingBranchOptions, true
            )
          }
        </CardActions>
      </Card>
    )
  }
}
