import React, { Component } from 'react'
import { Table, Button } from 'reactstrap';
import AddEditUserModalForm from '../Modals/AddEditUserModalForm'

class UsersDataTable extends Component {
  
  deleteUser(username, user) {
    let confirmDelete = window.confirm('Delete user forever?')
    if(confirmDelete){
      fetch('http://localhost:3000/deleteUser/' + user.username + '/' + user.token, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username
      })
    })
      .then(response => response.json())
      .then(user => {
        this.props.deleteUserFromState(username)
      })
      .catch(err => console.log(err))
    }
  }

  render() {
    let users = <></>
    if(this.props.users.length > 0){
        users = this.props.users.map(user => {
        return (
          <tr key={user.username}>
            <th scope="row">{user.username}</th>
            <td>{user.preferredworkinghourperday}</td>
            <td>
              <div style={{width:"110px"}}>
                <AddEditUserModalForm buttonLabel="Edit" user={user} updateUserState={this.props.updateUserState} currentUser={this.props.currentUser}/>
                {' '}
                <Button color="danger" onClick={() => this.deleteUser(user.username, this.props.currentUser)}>Del</Button>
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
            <th>Username</th>
            <th>Preferred Working Hours per Day</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users}
        </tbody>
      </Table>
    )
  }
}

export default UsersDataTable
