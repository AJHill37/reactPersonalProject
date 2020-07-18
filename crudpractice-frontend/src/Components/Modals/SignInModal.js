import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import SignInForm from '../Forms/SignInForm'

class SignInModalForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: false
    }
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }))
  }

  render() {
      const closeBtn = <button className="close" onClick={this.toggle}>&times;</button>

      const label = this.props.buttonLabel

      let button = ''
      let title = ''

      button = <Button
                color="primary"
                onClick={this.toggle}
                style={{float: "left", marginRight:"10px"}}>{label}
              </Button>
      title = 'Sign In'

      return (
      <div>
        {button}
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle} close={closeBtn}>{title}</ModalHeader>
          <ModalBody>
            <SignInForm
              updateCurrentUser={this.props.updateCurrentUser}
              toggle={this.toggle}
              item={this.props.item} />
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

export default SignInModalForm
