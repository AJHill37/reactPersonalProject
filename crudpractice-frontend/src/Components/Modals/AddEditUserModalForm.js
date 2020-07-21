import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import AddEditUserForm from '../Forms/AddEditUserForm'

class AddEditUserModalForm extends Component {
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

      if(label === 'User Settings'){
        button = <Button
                  color="warning"
                  onClick={this.toggle}
                  style={{float: "right", marginRight:"10px"}}>{label}
                </Button>
        title = 'User Settings'
      } else if(label === 'Edit'){
        button = <Button
                  color="warning"
                  onClick={this.toggle}
                  style={{float: "left", marginRight:"10px"}}>{label}
                </Button>
        title = 'Edit User'
      } else {
        button = <Button
                  color="success"
                  onClick={this.toggle}
                  style={{float: "left", marginRight:"10px"}}>{label}
                </Button>
        title = 'Add New User'
      }


      return (
      <div>
        {button}
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle} close={closeBtn}>{title}</ModalHeader>
          <ModalBody>
            <AddEditUserForm
              addUserToState={this.props.addUserToState}
              updateUserState={this.props.updateUserState}
              updateCurrentUser={this.props.updateCurrentUser}
              currentUser={this.props.currentUser}
              toggle={this.toggle}
              user={this.props.user} />
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

export default AddEditUserModalForm
