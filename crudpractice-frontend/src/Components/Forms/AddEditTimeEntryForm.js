import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class AddEditTimeEntryForm extends React.Component {
  state = {
    entry_id: 0,
    username: '',
    hours: '',
    workedon: '',
  }

  onChange = e => {
    this.setState({[e.target.name]: e.target.value})
  }

  submitFormAddTimeEntry = e => {
    e.preventDefault()
    fetch('http://localhost:3000/postTimeEntry/' + this.props.currentUser.username + '/' + this.props.currentUser.token, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.props.currentUser.username,
        hours: this.state.hours,
        workedon: this.state.workedon
      })
    })
      .then(response => response.json())
      .then(timeEntry => {
        if(Array.isArray(timeEntry)) {
          this.props.addTimeEntryToState(timeEntry[0])
          this.props.toggle()
        } else {
          console.log('failure')
        }
      })
      .catch(err => console.log(err))
  }

  submitFormEditTimeEntry = e => {
    e.preventDefault()
    fetch('http://localhost:3000/putTimeEntry/' + this.props.currentUser.username + '/' + this.props.currentUser.token, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entry_id: this.state.entry_id,
        hours: this.state.hours,
        workedon: this.state.workedon
      })
    })
      .then(response => response.json())
      .then(timeEntry => {
        if(Array.isArray(timeEntry)) {
          this.props.updateTimeEntryState(timeEntry[0])
          this.props.toggle()
        } else {
          console.log('failure')
        }
      })
      .catch(err => console.log(err))
  }

  componentDidMount(){
    // if timeEntry exists, populate the state with proper data
    if(this.props.timeEntry){
      const { entry_id, username, hours, workedon } = this.props.timeEntry
      this.setState({ entry_id, username, hours, workedon })
    }
  }

  render() {
    return (
      <Form onSubmit={this.props.timeEntry ? this.submitFormEditTimeEntry : this.submitFormAddTimeEntry}>
        <FormGroup>
          <Label for="hours">Hours</Label>
          <Input type="number" name="hours" id="hours" onChange={this.onChange} value={this.state.hours === null ? '' : this.state.hours} />
        </FormGroup>
        <FormGroup>
          <Label for="workedon">What did you work on?</Label>
          <Input type="text" name="workedon" id="workedon" onChange={this.onChange} value={this.state.workedon === null ? '' : this.state.workedon}  />
        </FormGroup>
        <Button>Submit</Button>
      </Form>
    );
  }
}

export default AddEditTimeEntryForm
