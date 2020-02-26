import React, { Component } from "react";
import { Table, Container, Card, Row, Col} from "react-bootstrap";
import EditPremise from "../EditPremise";
import TerminalModal from "../TerminalModal";

class Reference extends Component {
    state = {
        isTerminalModal: false,
        isPremiseModal: false
    }

    handleTerminalModal = () => {
        const {isTerminalModal} = this.state
        this.setState({
            isTerminalModal: !isTerminalModal
        })
    }

    handlePremiseModal = () => {
        const {isPremiseModal} = this.state
        this.setState({
            isPremiseModal: !isPremiseModal
        })
    }

    render() {
        const {isTerminalModal, isPremiseModal} = this.state
        return (
           <>
               <h4 className="m-2">Reference Number</h4>
               <hr />
               <Container>
                   { isTerminalModal ? <TerminalModal handleModal={this.handleTerminalModal}/> : null }
                   { isPremiseModal ? <EditPremise handleModal={this.handlePremiseModal}/> : null }
                   <Table bordered>
                       <thead>
                       <tr>
                           <th width="30%">Address </th>
                           <th width="10%">Box</th>
                           <th width="15%">BIN</th>
                           <th>Monitoring Company</th>
                       </tr>
                       </thead>
                       <tbody>
                       <tr>
                           <td>102 Gold Street Brooklyn</td>
                           <td>1234</td>
                           <td>4321231</td>
                           <td>SFC - Statewide Fire Corporation</td>
                       </tr>
                       </tbody>
                   </Table>
                   <Card className="mt-4">
                       <Card.Header>
                           <Row>
                               <Col md={7}>
                                   ROCKAWAYAVE-RIVERROCKAPARTMENTS(MULTIPLEDWELLING/EN), 11201-2911
                               </Col>
                               <Col md={3}>
                                   Factory & Industrial
                               </Col>
                               <Col md={2} className="text-right">
                                   <i className="fa fa-pencil cursor-pointer" onClick={this.handlePremiseModal}/>
                               </Col>
                           </Row>
                       </Card.Header>
                       <Card.Body>
                           <b>Jon Snow on May 9, 2019 at 10:37am</b>
                           <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit
                               tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui.
                           </p>
                            <hr/>
                           Show 2 more comments
                       </Card.Body>
                   </Card>
                   <Card className="mt-4">
                       <Card.Header>
                           <Row>
                               <Col md={10}>
                                   <h6 className="text-left">Terminals</h6>
                               </Col>
                               <Col md={2} className="text-right">
                                   <i className="fa fa-plus text-right cursor-pointer" onClick={this.handleTerminalModal}/>
                               </Col>
                           </Row>
                       </Card.Header>
                       <Card.Body>
                           There are currently no terminals. Add a terminal now
                       </Card.Body>
                   </Card>
               </Container>
           </>
        );
    }
}

export default Reference;
