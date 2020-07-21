import React, { Component } from 'react'
import { Table, Button } from 'reactstrap';
import AddEditNoteModalForm from '../Modals/AddEditNoteModalForm'

class NotesDataTable extends Component {
  
  
  deleteNote(note_id, user) {
    let confirmDelete = window.confirm('Delete note forever?')
    if(confirmDelete){
      fetch('http://localhost:3000/deleteNote/' + user.username + '/' + user.token, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note_id
      })
    })
      .then(response => response.json())
      .then(note => {
        this.props.deleteNoteFromState(note)
      })
      .catch(err => console.log(err))
    }
  }

  componentDidMount(){
  }

  render() {
    //                <AddEditNoteModalForm buttonLabel="Edit" note={note} updateNoteState={this.props.updateNoteState} currentUser={this.props.currentUser}/>
    let notes = <></>
    if(this.props.notes.length > 0){
      notes = this.props.notes.map(note => {
        return (
          <tr key={note.note_id}>
            <th scope="row">{note.note_id}</th>
            <td>{note.content}</td>
            <td>
              <div style={{width:"110px"}}>
                <Button color="warning" onClick={() => this.deleteNote(note.note_id, this.props.currentUser)}>Edit</Button>
                {' '}
                <Button color="danger" onClick={() => this.deleteNote(note.note_id, this.props.currentUser)}>Del</Button>
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
            <th>Note ID</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes}
        </tbody>
      </Table>
    )
  }
}

export default NotesDataTable
