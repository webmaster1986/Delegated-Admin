import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Premise from "./Premise";
import Reference from "./Reference";

class TerminalAssignment extends Component {
  render() {
    return (
      <>
        <h3 className="text-center m-4">Terminal Assignment</h3>
        <Container className={"container-design"}>
        <Premise/>
        {/*<Reference/>*/}
        </Container>
      </>
    );
  }
}

export default TerminalAssignment;
