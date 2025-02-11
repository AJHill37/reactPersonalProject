import React, { Component } from 'react'
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import AddEditTimeEntryForm from '../Forms/AddEditTimeEntryForm'

class AddEditTimeEntryModalForm extends Component {
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

      if(label === 'Edit'){
        button = <Button
                  color="warning"
                  onClick={this.toggle}
                  style={{float: "left", marginRight:"10px"}}>{label}
                </Button>
        title = 'Edit Time Entry'
      } else {
        button = <Button
                  color="success"
                  onClick={this.toggle}
                  style={{float: "left", marginRight:"10px"}}>{label}
                </Button>
        title = 'Add New Time Entry'
      }


      return (
      <div>
        {button}
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle} close={closeBtn}>{title}</ModalHeader>
          <ModalBody>
            <AddEditTimeEntryForm
              addTimeEntryToState={this.props.addTimeEntryToState}
              updateTimeEntryState={this.props.updateTimeEntryState}
              currentUser={this.props.currentUser}
              toggle={this.toggle}
              timeEntry={this.props.timeEntry} />
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

export default AddEditTimeEntryModalForm
