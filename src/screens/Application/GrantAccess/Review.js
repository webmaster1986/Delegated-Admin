import React, { useState } from "react";
import {Button, Col, Row} from "react-bootstrap";
import { Table } from 'antd';
import Modal from "../Modal";

const Review = (props) => {
    const [modalData, setModalData] = useState(null);
    const [visible, setVisible] = useState(null);

    const handelModal = (e, record, sub, rootRecord) => {
        const {data, category} = props
        let result = {}
        if (sub) {
            if (sub === "user") {
                const selectedRecord = rootRecord && rootRecord.users.find(g => g.login === record) || {}
                result = {
                    login: selectedRecord.login,
                    name: selectedRecord.name,
                    email: selectedRecord.email,
                    bureau: selectedRecord.bureau
                }
            } else {
                const selectedRecord = rootRecord && rootRecord.roles.find(g => g.appCode === record) || {}
                result = {
                    appCode: selectedRecord.appCode,
                    oimTarget: selectedRecord.oimTarget,
                    roleName: selectedRecord.roleName,
                    roleDescription: selectedRecord.roleDescription
                }
            }
        } else {
            if (record) {
                if (category === "byUser") {
                    const selectedRecord = data.find(g => g.login === record) || {}
                    result = {
                        login: selectedRecord.login,
                        name: selectedRecord.name,
                        email: selectedRecord.email,
                        bureau: selectedRecord.bureau
                    }
                } else {
                    const selectedRecord = data.find(g => g.roleName === record) || {}
                    result = {
                        appCode: selectedRecord.appCode,
                        oimTarget: selectedRecord.oimTarget,
                        roleName: selectedRecord.roleName,
                        roleDescription: selectedRecord.roleDescription
                    }
                }
            }
        }

        setModalData(result)
        setVisible(!visible)
    }

    const columnsByUser = [
        { title: 'User Login',
          dataIndex: 'login',
          key: 'login',
          render: (record) => <div className="link-text" onClick={(e) => handelModal(e, record)}><u>{record}</u></div>
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
          render: (record) => <div className="link-text" onClick={(e) => handelModal(e, record)}><u>{record}</u></div>
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
                  render: (record) => <div className="link-text" onClick={(e) => handelModal(e, record, "user", rootRecord)}><u>{record}</u></div>
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
                  render: (record) => <div className="link-text" onClick={(e) => handelModal(e, record, "role", rootRecord)}><u>{record}</u></div>
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
            <Modal visible={visible} data={modalData} handelModal={handelModal} title={props.category === "byUser" ? "User Data" : "Role Data"}/>
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
