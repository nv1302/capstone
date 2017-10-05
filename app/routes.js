import React, {Component} from 'react'
import {Route, Switch} from 'react-router-dom'

// authentication
import NotFound from './components/NotFound'

import Navbar from './Navbar'
import Footer from './Footer'
import LandingPage from './components/LandingPage'
import WriteSpace from './components/WriteSpace'
import AllStoryBranches from './components/AllStoryBranches'
import StoryBranchNav from './components/StoryBranchNav'
import UserProfile from './components/UserProfile'
import SingleCard from './components/SingleCard'
import SingleStoryPage from './components/SingleStoryPage'
import Searchbar from './components/Searchbar'
import SearchForUser from './components/SearchForUser'

class Routes extends Component {
  constructor() {
    super()
    this.state = {
      currentStoryBranch: {}
    }
    this.handleCurrentStoryChange = this.handleCurrentStoryChange.bind(this)
  }

  handleCurrentStoryChange = (storyBranchId, storyBranch) => {
    this.setState({currentStoryBranchTitle: storyBranchId, currentStoryBranch: storyBranch})
  }

  render() {
    return (
      <div>
        <Navbar />
        <div>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route path="/home" component={LandingPage} />
            <Route path="/write" component={WriteSpace} />
            <Route exact path="/read" component={Searchbar} />
            <Route exact path="/allUsers" component={SearchForUser} />
            <Route
              exact path="/read/story_branch/:branchId"
              render= {(props) => (
                <SingleStoryPage
                  {...props}
                  handleCurrentStoryChange={this.handleCurrentStoryChange}
                  currentStoryBranch={this.state.currentStoryBranch} />
              )} />
            <Route
              exact path="/read/story_branch/:branchId/:cardId"
              render={(props) => (
                <StoryBranchNav
                  {...props}
                  handleCurrentStoryChange={this.handleCurrentStoryChange}
                  currentStoryBranch={this.state.currentStoryBranch} />
              )} />
            <Route path="/read/:id" component={StoryBranchNav} />
            <Route path="/userProfile" component={UserProfile} />
            <Route path='*' component={NotFound} />
          </Switch>
        </div>
        <Footer />
      </div>
    )
  }
}

export default Routes
