import React, { Component } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Table, Transfer, Select } from 'antd/lib'
import {ApiService} from "../../services/ApiService";
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
            size: 'default',
            selectedApp: [],
            rolesData: [],
            step1: true,
            step2: false
        }
    }

    componentWillMount() {
        const {location} = this.props
        const data = (location && location.search && location.search.split("=")) || []
        if (data && data[1]) {
            this.setState({
                selectedApp: [data[1]]
            })
        }
    }

    async componentDidMount() {
        const {selectedApp} = this.state
        this.setState({
            isLoading: true
        })

        const data =  await this._apiService.getAllApplications()
        if (!data || data.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            this.setState({
                isLoading: false,
                applicationsList: data || []
            })
        }
        this.getRoles(selectedApp)
    }


    getRoles = async (id) => {
        const totalRoles = []
        for (const num of id) {
            const roles =  await this._apiService.getRolesForApp(num)
            if (!roles || roles.error) {
                this.setState({
                    isLoading: false
                })
                return message.error('something is wrong! please try again');
            } else {
                const data = (roles || []).map((f, i) => ({
                    id: i, key: i, roleName: f.roleName, roleDescription: f.roleDescription, oimTarget: f.oimTarget, status: f.status
                }))
                totalRoles.push(...data)
            }
         }
        this.setState({ roles: totalRoles })
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

    handleChange = (value) =>  {
        this.setState({
            selectedApp: value
        }, () => this.getRoles(value))
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
        const { targetKeys, showSearch, roles, size, selectedApp, applicationsList, step1, step2, searchString, searchList, rolesData } = this.state;
        const data = searchString ? searchList : roles
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
                                        {/*<Form.Control
                                            type="text"
                                            placeholder="Search..."
                                            aria-describedby="inputGroupPrepend"
                                            name="username"
                                        />*/}
                                        <Select
                                            mode="multiple"
                                            size={size}
                                            placeholder="Please select"
                                            defaultValue={selectedApp}
                                            onChange={this.handleChange}
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
                                        <InputGroup.Prepend>
                                            <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search..."
                                            aria-describedby="inputGroupPrepend"
                                            // name="username"
                                            onChange={this.onSearch}
                                        />
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
                                    leftColumns={leftTableColumns}
                                    rightColumns={rightTableColumns}
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
