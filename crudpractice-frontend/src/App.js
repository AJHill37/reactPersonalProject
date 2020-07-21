import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap'
import SignInModalForm from './Components/Modals/SignInModal'
import SignUpModalForm from './Components/Modals/SignUpModal'
import AddEditUserModalForm from './Components/Modals/AddEditUserModalForm'
import AddEditTimeEntryModalForm from './Components/Modals/AddEditTimeEntryModalForm'
import TimeEntryDataTable from './Components/Tables/TimeEntryDataTable'
import UsersDataTable from './Components/Tables/UsersDataTable'
import { CSVLink } from "react-csv"
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class App extends Component {
  state = {
    timeEntries: [],
    users: [],
    username: '',
    password: ''
  }

  getAllUsers(){
    fetch('http://localhost:3000/getAllUsers/' + this.state.currentUser.username + '/' + this.state.currentUser.token)
      .then(response => response.json())
      .then(users => {
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
    this.setState({currentUser: user}, () => {
      if(this.state.currentUser){
        if(this.state.currentUser.isadmin || this.state.currentUser.ismanager) {
          this.getAllUsers()
          if(this.state.currentUser.isadmin){
            this.updateCurrentAdminUser(user)
          }
        } else {
          this.getUserTimeEntries()
        }
      }
    })
  }

  updateCurrentAdminUser = (user) => {
    this.setState({currentAdminUser: user})
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

  onChange = e => {
    this.setState({[e.target.name]: e.target.value})
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }))
  }

  submitFormSignIn = e => {
    e.preventDefault()
    fetch('http://localhost:3000/signin', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(response => response.json())
      .then(user => {
        this.updateCurrentUser(user)
        this.toggle()
    })
    .catch(err => console.log(err))
  }

  componentDidMount(){
  }

  /*
   * This method exists because CSVLink doesn't like empty arrays as data, so we just pass in an empty string
   * if there aren't any items.
   */
  gCSV(timeEntries){
    const isTimeEntries = typeof timeEntries != "undefined" && timeEntries != null && timeEntries.length != null && timeEntries.length > 0

    for(let i = 0; i < timeEntries.length; ++i){
      if(timeEntries[i].username === ""){
        delete timeEntries[i].username
      }
      if(timeEntries[i].note1 === ""){
        delete timeEntries[i].note1
      }
      if(timeEntries[i].note2 === ""){
        delete timeEntries[i].note2
      }
      if(timeEntries[i].note3 === ""){
        delete timeEntries[i].note3
      }
    }

    if(isTimeEntries){
      return (
        <CSVLink
          filename={"db.csv"}
          color="primary"
          style={{float: "left", marginRight: "10px"}}
          className="btn btn-primary"
          data={timeEntries}>
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
    //            <SignInModalForm buttonLabel="Sign In" updateCurrentUser={this.updateCurrentUser}/>
    return (
      <Container className="App">
        <Row>
          <Col>
            <h1 style={{margin: "20px 0"}}>Timetracker</h1>
          </Col>
        </Row>
        <Row>
          <Col>
          <Form onSubmit={this.submitFormSignIn}>
            <FormGroup>
              <Label for="username">Username</Label>
              <Input type="text" name="username" id="username" onChange={this.onChange} value={this.state.username === null ? '' : this.state.username} />
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input type="password" name="password" id="password" onChange={this.onChange} value={this.state.password === null ? '' : this.state.password} />
            </FormGroup>
            <Button style={{float: 'left'}}>Submit</Button>
            <SignUpModalForm buttonLabel="Sign Up" updateCurrentUser={this.updateCurrentUser}/>
          </Form>
          </Col>
        </Row>
      </Container>
    )
  }

  clearUsers(){
    this.updateCurrentUser(null)
    this.updateCurrentAdminUser(null)
    this.setState({username: null})
    this.setState({password: null})
  }

  userScreen() {
    const csvLink = this.gCSV(this.state.timeEntries)

    let backToAdminButton = <></>
    if(this.state.currentAdminUser){
      backToAdminButton = <Button style={{margin: "9px 10px", paddingRight : "9px" , float: 'right'}} color="success" onClick={() => this.updateCurrentUser(this.state.currentAdminUser)}>Back to Admin</Button>
    }

    return (
      <Container className="App">
        <Row>
          <Col>
            <div style={{width:"100%"}}>
              <h1 style={{ float: 'left'}}>Time Entries</h1>
              <Button style={{margin: "9px 0", float: 'right'}} color="danger" onClick={() => this.clearUsers()}>Log Out</Button>
              {backToAdminButton}
            </div>
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
            <AddEditUserModalForm buttonLabel="User Settings" updateCurrentUser={this.updateCurrentUser} currentUser={this.state.currentUser} user={this.state.currentUser}/>
          </Col>
        </Row>
      </Container>
    )
  }

  adminScreen() {
    return (
      <Container className="App">
        <Row>
          <Col>
            <div style={{width:"100%"}}>
              <h1 style={{ float: 'left'}}>Users</h1>
              <Button style={{margin: "9px 0", float: 'right'}} color="danger" onClick={() => this.clearUsers()}>Log Out</Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <UsersDataTable getAllUsers={this.getAllUsers} users={this.state.users} updateUserState={this.updateUserState} deleteUserFromState={this.deleteUserFromState} updateCurrentUser={this.updateCurrentUser} currentUser={this.state.currentUser} />
          </Col>
        </Row>
        <Row>
          <Col>
            <AddEditUserModalForm buttonLabel="Add User" addUserToState={this.addUserToState} currentUser={this.state.currentUser}/>
            <AddEditUserModalForm buttonLabel="User Settings" updateCurrentUser={this.updateCurrentUser} currentUser={this.state.currentUser} user={this.state.currentUser}/>
          </Col>
        </Row>
      </Container>
    )
  }


  render() {
    //const isUser = this.state.currentUser
    if (this.state.currentUser && (this.state.currentUser.isadmin || this.state.currentUser.ismanager)) {
      return ( this.adminScreen() )
    } else if (this.state.currentUser) {
      return ( this.userScreen() )
    } else {
      return ( this.defaultScreen() )
    }
  }
}

export default App
