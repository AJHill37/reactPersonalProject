import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class AddEditUserForm extends React.Component {
  state = {
    username: '',
    password: '',
    preferredworkinghourperday: '',
    currentusername: '',
  }

  onChange = e => {
    this.setState({[e.target.name]: e.target.value})
  }

  submitFormAddUser = e => {
    e.preventDefault()
    fetch('http://localhost:3000/signup/', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: this.state.username,
            password: this.state.password,
            preferredworkinghourperday: this.state.preferredworkinghourperday,
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        this.props.addUserToState(data.user)
        this.props.toggle()
    })
    .catch(err => console.log(err))
  }

  submitFormEditUser = e => {
    e.preventDefault()
    fetch('http://localhost:3000/putUser/' + this.props.currentUser.username + '/' + this.props.currentUser.token, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
        preferredworkinghourperday: this.state.preferredworkinghourperday,
        currentUserName: this.state.currentusername
      })
    })
      .then(response => response.json())
      .then(data => {
        if(Array.isArray(data.rows)) {
          if(this.props.updateUserState){
            this.props.updateUserState(data.rows[0])
          }
          if(this.props.updateCurrentUser){
            this.props.updateCurrentUser(data.rows[0])
          }
          this.props.toggle()
        } else {
          console.log('failure')
          console.log(data)
        }
      })
      .catch(err => console.log(err))
  }

  componentDidMount(){
    // if user exists, populate the state with proper data
    if(this.props.user){
      const { username, preferredworkinghourperday } = this.props.user
      this.setState({ username, preferredworkinghourperday})
      this.setState({ currentusername: username})
    }
  }

  render() {
    return (
      <Form onSubmit={this.props.user ? this.submitFormEditUser : this.submitFormAddUser}>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input type="text" name="username" id="username" onChange={this.onChange} value={this.state.username === null ? '' : this.state.username} />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input type="password" name="password" id="password" onChange={this.onChange} value={this.state.password === null ? '' : this.state.password} />
        </FormGroup>
        <FormGroup>
          <Label for="preferredworkinghourperday">Preferred Working hours per day</Label>
          <Input type="number" name="preferredworkinghourperday" id="preferredworkinghourperday" onChange={this.onChange} value={this.state.preferredworkinghourperday === null ? '' : this.state.preferredworkinghourperday}  />
        </FormGroup>
        <Button>Submit</Button>
      </Form>
    );
  }
}

export default AddEditUserForm
