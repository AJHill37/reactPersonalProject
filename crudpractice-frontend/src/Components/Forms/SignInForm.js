import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class SignInForm extends React.Component {
  state = {
    username: '',
    password: ''
  }

  onChange = e => {
    this.setState({[e.target.name]: e.target.value})
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
        this.props.updateCurrentUser(user)
        this.props.toggle()
    })
      .catch(err => console.log(err))
  }

  componentDidMount(){
    // if item exists, populate the state with proper data
    if(this.props.currentUser){
      const { username, created_at, token} = this.props.currentUser
      this.setState({ username, created_at, token })
    }
  }

  render() {
    return (
      <Form onSubmit={this.submitFormSignIn}>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input type="text" name="username" id="username" onChange={this.onChange} value={this.state.username === null ? '' : this.state.username} />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input type="password" name="password" id="password" onChange={this.onChange} value={this.state.password === null ? '' : this.state.password} />
        </FormGroup>
        <Button>Submit</Button>
      </Form>
    );
  }
}

export default SignInForm
