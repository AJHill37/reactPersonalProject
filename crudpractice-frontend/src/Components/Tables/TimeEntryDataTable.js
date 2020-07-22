import React, { Component } from 'react'
import { Table, Button } from 'reactstrap';
import AddEditTimeEntryModalForm from '../Modals/AddEditTimeEntryModalForm'

class TimeEntryDataTable extends Component {
  
  
  deleteItem(entry_id, user) {
    let confirmDelete = window.confirm('Delete item forever?')
    if(confirmDelete){
      fetch('http://localhost:3000/deleteTimeEntry/' + user.username + '/' + user.token, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entry_id
      })
    })
      .then(response => response.json())
      .then(timeEntry => {
        this.props.deleteTimeEntryFromState(entry_id)
      })
      .catch(err => console.log(err))
    }
  }

  componentDidMount(){
    //this.props.getUserTimeEntries(this.props.currentUser)
  }

  constructHoursWorkedPerDay(timeEntries){
    let ret = {}
    for(let i = 0; i < timeEntries.length; i++){ 
      let nextTimeEntry = timeEntries[i]
      let date = nextTimeEntry.date.split('T')[0]
      if(date in ret){
        ret[date] += Number(nextTimeEntry.hours)
      } else {
        ret[date] = Number(nextTimeEntry.hours)
      }
    }
    return ret
  }

  render() {
    let timeEntries = <></>
    const sortCopy = [].concat(this.props.timeEntries)
    sortCopy.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    console.log('A')
    console.log(sortCopy)
    console.log('B')
    let dayMap = this.constructHoursWorkedPerDay(this.props.timeEntries)
    if(sortCopy.length > 0 && sortCopy[0].date){
      timeEntries = sortCopy.map(timeEntry => {
        const entryDay = timeEntry.date.split('T')[0]
        const rowStyle = Number(this.props.currentUser.preferredworkinghourperday) <= dayMap[entryDay] ? { backgroundColor: 'lightgreen'} : { backgroundColor: 'lightpink'}
        return (
          <tr key={timeEntry.entry_id} style={rowStyle}>
            <th scope="row">{entryDay}</th>
            <td>{timeEntry.username}</td>
            <td>{timeEntry.hours}</td>
            <td>{timeEntry.workedon}</td>
            <td>
              <div style={{width:"110px"}}>
                <AddEditTimeEntryModalForm buttonLabel="Edit" timeEntry={timeEntry} updateTimeEntryState={this.props.updateTimeEntryState} currentUser={this.props.currentUser}/>
                {' '}
                <Button color="danger" onClick={() => this.deleteItem(timeEntry.entry_id, this.props.currentUser)}>Del</Button>
              </div>
            </td>
          </tr>
          )
        })      
    }

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Username</th>
            <th>Hours</th>
            <th>What was worked on</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timeEntries}
        </tbody>
      </Table>
    )
  }
}

export default TimeEntryDataTable
