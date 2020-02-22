import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Table, Transfer, Select } from 'antd/lib'
import {ApiService, getLoginUser} from "../../services/ApiService";
import difference from 'lodash/difference'
import message from "antd/lib/message";
import {Button} from "antd/es";
import AccessByUsers from "./GrantAccess/AccessByUsers";

const { Option } = Select;

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

const TableColumns = [
    {
        dataIndex: 'roleName',
        title: <div>Title</div>,
        sorter: (a, b) => {
            const t1 = a.roleName.toLowerCase() || ""
            const t2 = b.roleName.toLowerCase() || ""
            if (t1 < t2) { return -1 }
            if (t1 > t2) { return 1 }
            return 0
        }
    },
    {
        dataIndex: 'roleDescription',
        title: 'Application',
        sorter: (a, b) => {
            const t1 = a.roleDescription.toLowerCase() || ""
            const t2 = b.roleDescription.toLowerCase() || ""
            if (t1 < t2) { return -1 }
            if (t1 > t2) { return 1 }
            return 0
        }
    },
    {
        dataIndex: 'oimTarget',
        title: 'OIM Target',
        sorter: (a, b) => {
            const t1 = a.oimTarget.toLowerCase() || ""
            const t2 = b.oimTarget.toLowerCase() || ""
            if (t1 < t2) { return -1 }
            if (t1 > t2) { return 1 }
            return 0
        }
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
            size: 'default',
            selectedApp: [],
            rolesData: [],
            searchedRoles: [],
            step1: false,
            step2: false,
            user: getLoginUser()
        }
    }

    componentWillMount() {
        const {location} = this.props
        const {user} = this.state
        const data = (location && location.search && location.search.split("=")) || []
        const filterSelectedApp = (data && data[1]) ? data[1].split("&") : ""

        this.setState({
            selectedApp: (filterSelectedApp && filterSelectedApp[0]) ? [filterSelectedApp[0]] : [],
            step1: data && data[2] === "byRole",
            step2: data && data[2] === "byUser",
            isLoading: true
        }, async () => {
            let applicationsList = await this._apiService.getOwnerApplications(user.login)
            let roles =  await this._apiService.getOwnerRoles(user.login)
            if (!applicationsList || applicationsList.error) {
                applicationsList = []
                message.error('something is wrong! please try again');
            }
            if (!roles || roles.error) {
                roles = []
                message.error('something is wrong! please try again');
            }
            console.log("applicationsList:-", applicationsList)
            console.log("roles:-", roles)
            this.setState({
                isLoading: false,
                applicationsList,
                allRoles: roles,
            }, () => this.getRoles())
        })
    }

    getRoles = async () => {
        const { selectedApp, allRoles, searchedRoles } = this.state
        const apps = selectedApp.map(item => item.toLowerCase())
        const appRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1)
        const filteredRoles = allRoles.filter(item => apps.indexOf(item.appCode.toLowerCase()) !== -1 && searchedRoles.indexOf(item.roleName) !== -1)
        const data = (appRoles || []).map((f, i) => ({
            id: i, key: i, ...f
        }))

        this.setState({ roles: data, searchRoleList: searchedRoles.length ? filteredRoles : [] })
    }

    onChange = nextTargetKeys => {
        const {roles} = this.state
        if (nextTargetKeys && nextTargetKeys.length) {
            const data = []
            nextTargetKeys.forEach(f => {
                data.push(roles[f])
            })
            console.log("========Selected Roles=======>", data)
            this.setState({ targetKeys: nextTargetKeys, rolesData: data });
        } else {
            this.setState({
                targetKeys: [],
                rolesData: []
            });
        }
    };

    triggerShowSearch = showSearch => {
        this.setState({ showSearch });
    };

    handleChange = (name, value) =>  {
        this.setState({
            [name]: value
        }, () => this.getRoles())
    }

    onSelectedUserChange = () => {
        this.setState({
            step1: false,
            step2: true
        })
    }

    onSearch = (event) => {
        const {roles} = this.state
        const searchString = event.target.value || ""
        let searchList = []
        if (searchString) {
            searchList = roles && roles.filter(obj =>
                ["roleName", "roleDescription", "oimTarget"].some(key => {
                    return (
                        obj && obj[key].toLowerCase().includes(searchString.toLowerCase())
                    )
                })
            )
        }
        this.setState({
            searchString,
            searchList
        })
    }

    getRolesData = () => {
        return this.state.rolesData
    }

    render() {
        const { targetKeys, showSearch, roles, size, selectedApp, applicationsList, step1, step2, searchRoleList, searchString, searchList, rolesData, searchedRoles } = this.state;
        const data = searchedRoles.length ? searchRoleList : roles
        return(
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Grant Access
                </h4>
                <hr/>
                {
                    step1 ?
                        <>
                            <Row className={'mb-3'}>
                                <Col>
                                    <Form.Label >
                                        APPLICATIONS:
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Select
                                            mode="multiple"
                                            size={size}
                                            placeholder="Please select"
                                            defaultValue={selectedApp}
                                            onChange={(value) => this.handleChange('selectedApp', value)}
                                            style={{ width: '100%' }}
                                        >
                                            {
                                                applicationsList && applicationsList.map((g, i) => (
                                                    <Option key={i.toString() + i} value={g.appCode}>{g.appCode}</Option>
                                                ))
                                            }
                                        </Select>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className={'mb-3'}>
                                <Col>
                                    <Form.Label >
                                        ROLES:
                                    </Form.Label>
                                    <InputGroup>
                                        <Select
                                            mode="multiple"
                                            size={size}
                                            placeholder="Please select"
                                            defaultValue={searchedRoles}
                                            onChange={(value) => this.handleChange('searchedRoles',value)}
                                            style={{ width: '100%' }}
                                        >
                                            {roles && roles.map((g, i) =>  <Option key={i.toString() + i} value={g.roleName}>{g.roleName}</Option>)}
                                        </Select>
                                    </InputGroup>
                                </Col>
                            </Row>

                            <div>
                                <TableTransfer
                                    dataSource={data}
                                    targetKeys={targetKeys}
                                    showSearch={showSearch}
                                    onChange={this.onChange}
                                    filterOption={(inputValue, item) =>
                                        item.title.indexOf(inputValue) !== -1 || item.tag.indexOf(inputValue) !== -1
                                    }
                                    leftColumns={TableColumns}
                                    rightColumns={TableColumns}
                                    operations={['Select', 'Remove']}
                                />
                            </div>
                            <div>
                                <Row>
                                    <Col md={10} sm={8}/>
                                    <Col className="mt-3" md={2} sm={4}>
                                        <Button onClick={this.onSelectedUserChange} disabled={!(rolesData && rolesData.length)}>Select Users</Button>
                                    </Col>
                                </Row>
                            </div>
                        </>
                        : null
                }
                {
                    step2 ? <AccessByUsers getRoles={() => this.getRolesData()}/> : null
                }

            </Container>
        )
    }
}

export default GrantAccess
