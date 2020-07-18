import React, { Component } from 'react'
import { Table, Button } from 'reactstrap';
import ModalForm from '../Modals/Modal'

class TimeEntryDataTable extends Component {
  
  /*
  deleteItem = id => {
    let confirmDelete = window.confirm('Delete item forever?')
    if(confirmDelete){
      fetch('http://localhost:3000/crud', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id
      })
    })
      .then(response => response.json())
      .then(item => {
        this.props.deleteItemFromState(id)
      })
      .catch(err => console.log(err))
    }
  }*/

  render() {
    let items = <></>
    if(this.props.items.length > 0){
      items = this.props.items.map(item => {
        return (
          <tr key={item.entry_id}>
            <th scope="row">{item.entry_id}</th>
            <td>{item.username}</td>
            <td>{item.workedOn}</td>
            <td>{item.date}</td>
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
          </tr>
        </thead>
        <tbody>
          {items}
        </tbody>
      </Table>
    )
  }
}

export default TimeEntryDataTable
