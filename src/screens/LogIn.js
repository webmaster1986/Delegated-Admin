import React from "react";
import {Button, Col, Container, Form, Row} from "react-bootstrap";

class LogIn extends React.Component {
    render() {
        return (
            <Container className={'container-design'}>
                <h4 className="text-left">
                    Log In
                </h4>
                <hr/>
                <Row className={'mb-3'}>
                    <Col>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2} md={2}>
                                    Email
                                </Form.Label>
                                <Col sm={10} md={10}>
                                    <Form.Control type="email" placeholder="Email" />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2} md={2}>
                                    Password
                                </Form.Label>
                                <Col sm={10} md={10}>
                                    <Form.Control type="password" placeholder="Password" />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="text-center">
                                <Col>
                                    <Button variant="primary">LogIn</Button>
                                </Col>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default LogIn;
