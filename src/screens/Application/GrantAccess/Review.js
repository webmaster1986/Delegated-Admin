import React from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import { Table } from 'antd';

const Review = (props) => {
    const columnsByUser = [
        { title: 'User Login', dataIndex: 'login', key: 'name' },
        { title: 'User Name', dataIndex: 'name', key: 'age' },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (record) => <Button variant={'outline-danger'} size={'sm'} onClick={() => props.onUserRemove(record)}>Remove</Button>,
        },
    ];

    const columnsByRole = [
        { title: 'Role Name', dataIndex: 'roleName', key: 'name' },
        { title: 'App Code', dataIndex: 'appCode', key: 'age' },
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
                columns={props.category === "byRole" ? columnsByRole : columnsByUser}
                dataSource={props && props.data}
                expandedRowRender={record => {
                     if (props.category === "byRole") {
                         return (
                             record.users.map(f =>
                                 <Row>
                                     <Col md={6}>
                                         <p>{f.login}</p>
                                     </Col>
                                     <Col md={6}>
                                         <Button variant={'outline-danger'} size={'sm'} onClick={() => props.onTagRemove(record.roleName, f.login)}>Remove</Button>
                                     </Col>
                                 </Row>
                             )
                         )
                     } else {
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
                     }
                }}
            />

            <Row>
                <Col md={9} />
                <Col md={3} sm={12} xs={12}>
                    <Button className="mt-1" variant={'outline-danger'} /*onClick={() => this.preview()}*/>Cancel</Button>&nbsp;&nbsp;
                    <Button className="mt-1" variant={'outline-success'} /*onClick={() => this.preview()}*/>Submit</Button>
                </Col>
            </Row>
        </>
    );
}

export default Review;
