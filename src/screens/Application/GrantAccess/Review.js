import React from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import { Table } from 'antd';

const Review = (props) => {
    const columnsByUser = [
        { title: 'User Login', dataIndex: 'login', key: 'login' },
        { title: 'User Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Bureau', dataIndex: 'bureau', key: 'bureau' },
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
        { title: 'Role Description', dataIndex: 'roleDescription', key: 'roleDescription' },
        { title: 'OIM Target', dataIndex: 'oimTarget', key: 'oimTarget' },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: (record) => <Button variant={'outline-danger'} size={'sm'} onClick={() => props.onUserRemove(record)}>Remove</Button>,
        },
    ];

    const userColumn = (rootRecord) => {
        return (
            [
                { title: 'Login', dataIndex: 'login', key: 'login' },
                { title: 'Name', dataIndex: 'name', key: 'name' },
                { title: 'Email', dataIndex: 'email', key: 'email' },
                { title: 'Bureau', dataIndex: 'bureau', key: 'bureau' },
                {
                    title: 'Action',
                    dataIndex: '',
                    key: 'x',
                    render: (record) => <Button variant={'outline-danger'} size={'sm'} onClick={() => props.onTagRemove(rootRecord.roleName, record.login)}>Remove</Button>
                }
            ]
        )
    }

    const tagColumn = (rootRecord) => {
        return (
            [
                { title: 'App Code', dataIndex: 'appCode', key: 'appCode' },
                { title: 'Role Name', dataIndex: 'roleName', key: 'roleName' },
                { title: 'Role Description', dataIndex: 'roleDescription', key: 'roleDescription' },
                { title: 'OIM Target', dataIndex: 'oimTarget', key: 'oimTarget' },
                {
                    title: 'Action',
                    dataIndex: '',
                    key: 'x',
                    render: (record) => <Button variant={'outline-danger'} size={'sm'} onClick={() => props.onTagRemove(rootRecord.login, record.roleName)}>Remove</Button>
                }
            ]
        )
    }

    return (
        <>
            {/* <Row className={'mb-3'}>
                <Col>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search..."
                            aria-describedby="inputGroupPrepend"
                            name="username"
                        />
                    </InputGroup>
                </Col>
            </Row> */}

            <Table
                columns={props.category === "byRole" ? columnsByRole : columnsByUser}
                dataSource={props && props.data}
                expandedRowRender={record => {
                     if (props.category === "byRole") {
                         return ( <Table dataSource={record && record.users} columns={userColumn(record)} /> )
                     } else {
                         return ( <Table dataSource={record && record.roles} columns={tagColumn(record)} /> )
                     }
                }}
            />

            <Row>
                <Col md={9} />
                <Col md={3} sm={12} xs={12}>
                    <Button className="mt-1" variant={'outline-danger'} onClick={() => props.history.push('/app-owner')}>Cancel</Button>&nbsp;&nbsp;
                    <Button className="mt-1" variant={'outline-success'} onClick={() => props.onSubmit()}>Submit</Button>
                </Col>
            </Row>
        </>
    );
}

export default Review;
