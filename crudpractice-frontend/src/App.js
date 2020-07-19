import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap'
import SignInModalForm from './Components/Modals/SignInModal'
import SignUpModalForm from './Components/Modals/SignUpModal'
import ModalForm from './Components/Modals/Modal'
import AddEditTimeEntryModalForm from './Components/Modals/AddEditTimeEntryModalForm'
import DataTable from './Components/Tables/DataTable'
import TimeEntryDataTable from './Components/Tables/TimeEntryDataTable'
import { CSVLink } from "react-csv"

class App extends Component {
  state = {
    items: [],
    timeEntries: []
  }

  getUserTimeEntries(user){
    fetch('http://localhost:3000/getTimeEntries/' + user.username + '/' + user.token)
      .then(response => response.json())
      .then(timeEntries => this.setState({timeEntries}))
      .catch(err => console.log(err))
  }

  getItems(){
    fetch('http://localhost:3000/crud')
      .then(response => response.json())
      .then(items => this.setState({items}))
      .catch(err => console.log(err))
  }

  addItemToState = (item) => {
    this.setState(prevState => ({
      items: [...prevState.items, item]
    }))
  }

  addTimeEntryToState = (timeEntry) => {
    this.setState(prevState => ({
      timeEntries: [...prevState.timeEntries, timeEntry]
    }))
  }

  updateCurrentUser = (user) => {
    this.getUserTimeEntries(user)
    this.setState({currentUser: user})
  }

  updateState = (item) => {
    const itemIndex = this.state.items.findIndex(data => data.id === item.id)
    const newArray = [
    // destructure all items from beginning to the indexed item
      ...this.state.items.slice(0, itemIndex),
    // add the updated item to the array
      item,
    // add the rest of the items to the array from the index after the replaced item
      ...this.state.items.slice(itemIndex + 1)
    ]
    this.setState({ items: newArray })
  }

  updateTimeEntryState = (timeEntry) => {
    console.log(this.state.timeEntries)
    console.log(timeEntry)
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


  deleteItemFromState = (id) => {
    const updatedItems = this.state.items.filter(item => item.id !== id)
    this.setState({ items: updatedItems })
  }

  deleteTimeEntryFromState = (entry_id) => {
    const updatedItems = this.state.timeEntries.filter(timeEntry => timeEntry.entry_id !== entry_id)
    this.setState({ timeEntries: updatedItems })
  }

  componentDidMount(){
    this.getItems()
    console.log("It mounted")
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
    //<SignUpModalForm buttonLabel="Sign Up" updateCurrentUser={this.updateCurrentUser}/>
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
            <DataTable items={this.state.items} updateState={this.updateState} deleteItemFromState={this.deleteItemFromState} />
          </Col>
        </Row>
        <Row>
          <Col>
            {csvLink}
            <ModalForm buttonLabel="Add Item" addItemToState={this.addItemToState}/>
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
            <TimeEntryDataTable timeEntries={this.state.timeEntries} updateTimeEntryState={this.updateTimeEntryState} deleteTimeEntryFromState={this.deleteTimeEntryFromState} currentUser={this.state.currentUser} />
          </Col>
        </Row>
        <Row>
          <Col>
            {csvLink}
            <AddEditTimeEntryModalForm buttonLabel="Add Time Entry" addTimeEntryToState={this.addTimeEntryToState} currentUser={this.state.currentUser}/>
          </Col>
        </Row>
      </Container>
    )

    /*
    <ModalForm buttonLabel="Add Item" addItemToState={this.addItemToState}/>
    <SignUpModalForm buttonLabel="Sign Up" updateCurrentUser={this.updateCurrentUser}/>
    */
  }

  render() {
    const isUser = this.state.currentUser
    const timeEntriesPopulated = this.state.timeEntries.length > 0
    if (isUser && timeEntriesPopulated) {
      return ( this.userScreen() )
    } else {
      return ( this.defaultScreen() )
    }
  }
}

export default App
