import React from "react";
import {Button, Col, Row} from "react-bootstrap";
import { Table } from 'antd';
const Review = (props) => {

    const columnsByUser = [
        { title: 'User Login',
          dataIndex: 'login',
          key: 'login',
          render: (record, data) => <div className="link-text" onClick={(e) => props.toggleUserModal(e, data)}><u>{record}</u></div>
        },
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
        { title: 'Role Name',
          dataIndex: 'roleName',
          key: 'name',
          render: (record, data) => <div className="link-text" onClick={(e) => props.toggleModal(e, data)}><u>{record}</u></div>
        },
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
                { title: 'Login',
                  dataIndex: 'login',
                  key: 'login',
                  render: (record, data) => <div className="link-text" onClick={(e) => props.toggleUserModal(e, data)}><u>{record}</u></div>
                },
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
                { title: 'App Code',
                  dataIndex: 'appCode',
                  key: 'appCode',
                  render: (record, data) => <div className="link-text" onClick={(e) => props.toggleModal(e, data)}><u>{record}</u></div>
                },
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
