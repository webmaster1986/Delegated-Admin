import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Premise from "./Premise";
import Reference from "./Reference";

class TerminalAssignment extends Component {
    constructor(props) {
        super(props);
        this.state = {reference: false};
    }
    toggle = () => {
        this.setState({reference: !this.state.reference});
    };
  render() {
    return (
      <>
        <h3 className="text-center m-4">Terminal Assignment</h3>
        <Container className={"container-design"}>
            {
                !this.state.reference ?  <Premise toggle={this.toggle}/> : <Reference/>
            }
        </Container>
      </>
    );
  }
}

export default TerminalAssignment;
