import React from "react";
import {Button, Col, Row} from "react-bootstrap";
import { Table, Icon } from 'antd';
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
            render: (record, data) => <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => props.onUserRemove(data)}/>
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
                    render: (record, data) => <Icon className="text-danger" style={{fontSize: 20}} type="delete"  onClick={() => props.onTagRemove(rootRecord.roleName, data.login)}/>
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
                    render: (record, data) => <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => props.onTagRemove(rootRecord.login, data.roleName)}/>
                }
            ]
        )
    }

    return (
        <>
            <Table
                columns={props.category === "roles" ? columnsByRole : columnsByUser}
                dataSource={props && props.data}
                defaultExpandAllRows={true}
                expandedRowRender={record => {
                     if (props.category === "roles") {
                         return ( <Table dataSource={record && record.users} columns={userColumn(record)} /> )
                     } else {
                         return ( <Table dataSource={record && record.roles} columns={tagColumn(record)} /> )
                     }
                }}
            />

            <div className="text-right">
                <button className="btn btn-danger btn-sm" onClick={() => props.history.push('/app-owner')}>Cancel</button>&nbsp;&nbsp;
                <button className="btn btn-outline-success btn-sm" onClick={() => props.onSubmit()}>Submit</button>
            </div>
        </>
    );
}

export default Review;
