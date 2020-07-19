import React, { Component } from 'react'
import { Table, Button } from 'reactstrap';
import ModalForm from '../Modals/Modal'

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

  render() {
    let timeEntries = <></>
    if(this.props.timeEntries.length > 0){
      timeEntries = this.props.timeEntries.map(timeEntry => {
        return (
          <tr key={timeEntry.entry_id}>
            <th scope="row">{timeEntry.entry_id}</th>
            <td>{timeEntry.username}</td>
            <td>{timeEntry.hours}</td>
            <td>{timeEntry.workedon}</td>
            <td>{timeEntry.date}</td>
            <td>
              <div style={{width:"110px"}}>
                <ModalForm buttonLabel="Edit" timeEntry={timeEntry} updateState={this.props.updateState}/>
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
            <th>ID</th>
            <th>Username</th>
            <th>Hours</th>
            <th>What was worked on</th>
            <th>Date</th>
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
