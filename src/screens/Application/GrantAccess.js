import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Table, Transfer } from 'antd/lib'
import {ApiService} from "../../services/ApiService";
import difference from 'lodash/difference'
import message from "antd/lib/message";


const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
    <Transfer {...restProps} showSelectAll={false}>
        {({
              direction,
              filteredItems,
              onItemSelectAll,
              onItemSelect,
              selectedKeys: listSelectedKeys,
              disabled: listDisabled,
          }) => {
            const columns = direction === 'left' ? leftColumns : rightColumns;

            const rowSelection = {
                getCheckboxProps: item => ({ disabled: listDisabled || item.disabled }),
                onSelectAll(selected, selectedRows) {
                    const treeSelectedKeys = selectedRows
                        .filter(item => !item.disabled)
                        .map(({ key }) => key);
                    const diffKeys = selected
                        ? difference(treeSelectedKeys, listSelectedKeys)
                        : difference(listSelectedKeys, treeSelectedKeys);
                    onItemSelectAll(diffKeys, selected);
                },
                onSelect({ key }, selected) {
                    onItemSelect(key, selected);
                },
                selectedRowKeys: listSelectedKeys,
            };

            return (
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredItems}
                    size="small"
                    rowKey={'id'}
                    style={{ pointerEvents: listDisabled ? 'none' : null }}
                    onRow={({ key }) => ({
                        onClick: () => {
                            if (listDisabled) return;
                            onItemSelect(key, !listSelectedKeys.includes(key));
                        },
                    })}
                />
            );
        }}
    </Transfer>
);

const mockData = [
    { id: 0, key: 0, roleName: "Role 1", roleDescription: "Description 1", oimTarget: 'SN' },
    { id: 1, key: 1, roleName: "Role 2", roleDescription: "Description 2", oimTarget: 'IDCS' },
    { id: 2, key: 2, roleName: "Role 3", roleDescription: "Description 3", oimTarget: 'AD' }
];

const leftTableColumns = [
    {
        dataIndex: 'roleName',
        title: 'Role',
    },
    {
        dataIndex: 'roleDescription',
        title: 'Application',
    },
    {
        dataIndex: 'oimTarget',
        title: 'OIM Target',
    },
];
const rightTableColumns = [
    {
        dataIndex: 'roleName',
        title: 'Role',
    },
    {
        dataIndex: 'roleDescription',
        title: 'Application',
    },
    {
        dataIndex: 'oimTarget',
        title: 'OIM Target',
    },
];


class GrantAccess extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            targetKeys: [],
            showSearch: false,
        }
    }

    componentDidMount() {
        this.getRoles("1234501")
    }


    getRoles = async (id) => {
        const roles =  await this._apiService.getRolesForUser(id)
        if (!roles || roles.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            const data = (roles || []).map((f, i) => ({
                id: i, key: i, roleName: f.roleName, roleDescription: f.roleDescription, oimTarget: f.oimTarget, status: f.status
            }))
            this.setState({ roles: data })
        }
    }

    onChange = nextTargetKeys => {
        this.setState({ targetKeys: nextTargetKeys });
    };

    triggerShowSearch = showSearch => {
        this.setState({ showSearch });
    };

    render() {
        const { targetKeys, showSearch, roles } = this.state;
        return(
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Grant Access
                </h4>
                <hr/>
                <Row className={'mb-3'}>
                    <Col>
                        <Form.Label >
                            APPLICATIONS:
                        </Form.Label>
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
                <Row className={'mb-3'}>
                    <Col>
                        <Form.Label >
                            ROLES:
                        </Form.Label>
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

                <div>
                    <TableTransfer
                        dataSource={roles}
                        targetKeys={targetKeys}
                        showSearch={showSearch}
                        onChange={this.onChange}
                        filterOption={(inputValue, item) =>
                            item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
                        }
                        leftColumns={leftTableColumns}
                        rightColumns={rightTableColumns}
                        operations={['Select', 'Remove']}
                    />
                </div>
            </Container>
        )
    }
}

export default GrantAccess
