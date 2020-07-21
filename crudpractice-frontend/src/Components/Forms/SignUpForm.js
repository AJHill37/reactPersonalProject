import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';


class SignUpForm extends React.Component {
  state = {
    username: '',
    password: '',
    preferredworkinghourperday: 0,
  }

  onChange = e => {
    this.setState({[e.target.name]: e.target.value})
  }

  submitFormSignUp = e => {
    e.preventDefault()
    fetch('http://localhost:3000/signup', {
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
        this.props.updateCurrentUser(data.user)
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
      <Form onSubmit={this.submitFormSignUp}>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input type="text" name="username" id="username" onChange={this.onChange} value={this.state.username === null ? '' : this.state.username} />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input type="password" name="password" id="password" onChange={this.onChange} value={this.state.password === null ? '' : this.state.password}  />
        </FormGroup>
        <FormGroup>
          <Label for="preferredworkinghourperday">Preferred working hours per day</Label>
          <Input type="number" name="preferredworkinghourperday" id="preferredworkinghourperday" onChange={this.onChange} value={this.state.preferredworkinghourperday === null ? '' : this.state.preferredworkinghourperday}  />
        </FormGroup>
        <Button>Submit</Button>
      </Form>
    );
  }
}

export default SignUpForm
