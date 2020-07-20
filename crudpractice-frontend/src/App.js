import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap'
import SignInModalForm from './Components/Modals/SignInModal'
import SignUpModalForm from './Components/Modals/SignUpModal'
import AddEditUserModalForm from './Components/Modals/AddEditUserModalForm'
import AddEditTimeEntryModalForm from './Components/Modals/AddEditTimeEntryModalForm'
import TimeEntryDataTable from './Components/Tables/TimeEntryDataTable'
import UsersDataTable from './Components/Tables/UsersDataTable'
import { CSVLink } from "react-csv"

class App extends Component {
  state = {
    timeEntries: [],
    users: []
  }

  getAllUsers(user){
    fetch('http://localhost:3000/getAllUsers/' + this.state.currentUser.username + '/' + this.state.currentUser.token)
      .then(response => response.json())
      .then(users => {
        console.log(users)
        this.setState({users})
      })
      .catch(err => console.log(err))
  }


  getUserTimeEntries(){
    fetch('http://localhost:3000/getTimeEntries/' + this.state.currentUser.username + '/' + this.state.currentUser.token)
      .then(response => response.json())
      .then(timeEntries => this.setState({timeEntries}))
      .catch(err => console.log(err))
  }

  addUserToState = (user) => {
    console.log('Got to add user')
    this.setState(prevState => ({
      users: prevState.users.length ? [...prevState.users, user] : [user]
    }))
  }

  addTimeEntryToState = (timeEntry) => {
    this.setState(prevState => ({
      timeEntries: prevState.timeEntries.length ? [...prevState.timeEntries, timeEntry] : [timeEntry]
    }))
  }

  updateCurrentUser = (user) => {
    console.log(user)
    this.setState({currentUser: user}, () => {
      this.getUserTimeEntries()
      this.getAllUsers()
    })
  }

  updateTimeEntryState = (timeEntry) => {
    const timeEntryIndex = this.state.timeEntries.findIndex(data => data.entry_id === timeEntry.entry_id)
    const newArray = [
    // destructure all items from beginning to the indexed item
      ...this.state.timeEntries.slice(0, timeEntryIndex),
    // add the updated item to the array
      timeEntry,
    // add the rest of the items to the array from the index after the replaced item 
      ...this.state.timeEntries.slice(timeEntryIndex + 1)
    ]
    this.setState({ timeEntries: newArray })
  }

  updateUserState = (user) => {
    const userIndex = this.state.users.findIndex(data => data.username === user.username)
    const newArray = [
    // destructure all items from beginning to the indexed item
      ...this.state.users.slice(0, userIndex),
    // add the updated item to the array
      user,
    // add the rest of the items to the array from the index after the replaced item 
      ...this.state.users.slice(userIndex + 1)
    ]
    this.setState({ users: newArray })
  }


  deleteTimeEntryFromState = (entry_id) => {
    const updatedTimeEntries = this.state.timeEntries.filter(timeEntry => timeEntry.entry_id !== entry_id)
    this.setState({ timeEntries: updatedTimeEntries })
  }

  deleteUserFromState = (username) => {
    const updatedUsers = this.state.users.filter(user => user.username !== username)
    this.setState({ users: updatedUsers })
  }

  componentDidMount(){
  }

  /*
   * This method exists because CSVLink doesn't like empty arrays as data, so we just pass in an empty string
   * if there aren't any items.
   */
  gCSV(items){
    const isItems = typeof items != "undefined" && items != null && items.length != null && items.length > 0
    if(isItems){
      return (
        <CSVLink
          filename={"db.csv"}
          color="primary"
          style={{float: "left", marginRight: "10px"}}
          className="btn btn-primary"
          data={items}>
          Download CSV
        </CSVLink>            
      )
    } else {
      return ( 
        <CSVLink
          filename={"db.csv"}
          color="primary"
          style={{float: "left", marginRight: "10px"}}
          className="btn btn-primary"
          data={""}>
          Download CSV
        </CSVLink>    
      )        
    }
  }

  defaultScreen(){
    return (
      <Container className="App">
        <Row>
          <Col>
            <h1 style={{margin: "20px 0"}}>ABC</h1>
          </Col>
        </Row>
        <Row>
          <Col>
          </Col>
        </Row>
        <Row>
          <Col>
            <SignUpModalForm buttonLabel="Sign Up" updateCurrentUser={this.updateCurrentUser}/>
            <SignInModalForm buttonLabel="Sign In" updateCurrentUser={this.updateCurrentUser}/>
          </Col>
        </Row>
      </Container>
    )
  }

  userScreen() {
    const csvLink = this.gCSV(this.state.items)

    return (
      <Container className="App">
        <Row>
          <Col>
            <h1 style={{margin: "20px 0"}}>ABC</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <TimeEntryDataTable getUserTimeEntries={this.getUserTimeEntries} timeEntries={this.state.timeEntries} updateTimeEntryState={this.updateTimeEntryState} deleteTimeEntryFromState={this.deleteTimeEntryFromState} currentUser={this.state.currentUser} />
          </Col>
        </Row>
        <Row>
          <Col>
            {csvLink}
            <AddEditTimeEntryModalForm buttonLabel="Add Time Entry" addTimeEntryToState={this.addTimeEntryToState} currentUser={this.state.currentUser}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <UsersDataTable users={this.state.users} updateUserState={this.updateUserState} deleteUserFromState={this.deleteUserFromState} currentUser={this.state.currentUser} />
          </Col>
        </Row>
        <Row>
          <Col>
            <AddEditUserModalForm buttonLabel="Add User" addUserToState={this.addUserToState} currentUser={this.state.currentUser}/>
          </Col>
        </Row>
      </Container>
    )
  }

  render() {
    const isUser = this.state.currentUser
    if (isUser) {
      return ( this.userScreen() )
    } else {
      return ( this.defaultScreen() )
    }
  }
}

export default App
