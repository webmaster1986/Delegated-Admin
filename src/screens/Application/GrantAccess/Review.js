import React from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import { Table } from 'antd';

const Review = (props) => {
    const columns = [
        { title: 'User Login', dataIndex: 'login', key: 'name' },
        { title: 'User Name', dataIndex: 'name', key: 'age' },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (record) => <Button variant={'outline-danger'} size={'sm'} onClick={() => props.onUserRemove(record)}>Remove</Button>,
        },
    ];
    return (
        <>
            <Row className={'mb-3'}>
                <Col>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            type="text"
                            placeholder="Search..."
                            aria-describedby="inputGroupPrepend"
                            name="username"
                        />
                    </InputGroup>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={props && props.usersData}
                expandedRowRender={record => {
                    return (
                        record.roles.map(f =>
                            <Row>
                                <Col md={6}>
                                    <p>{f.roleName}</p>
                                </Col>
                                <Col md={6}>
                                    <Button variant={'outline-danger'} size={'sm'} onClick={() => props.onTagRemove(record.login, f.roleName)}>Remove</Button>
                                </Col>
                            </Row>
                        )
                    )
                }}
            />
        </>
    );
}

export default Review;
