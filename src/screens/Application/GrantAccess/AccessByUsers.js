import React from "react"
import {Col, Form, InputGroup, Row} from "react-bootstrap";
import {Table, Transfer} from "antd";
import {Button} from "antd/es";
import difference from "lodash/difference";
import {ApiService, getLoginUser} from "../../../services/ApiService";
import message from "antd/lib/message";
import Review from "./Review";

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

const TableColumns = [
    {
        dataIndex: 'login',
        title: 'Login',
    },
    {
        dataIndex: 'name',
        title: 'Name',
    },
    {
        dataIndex: 'bureau',
        title: 'Bureau',
    },
    {
        dataIndex: 'email',
        title: 'Email',
    }
];

class AccessByUsers extends React.Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            targetKeys: [],
            showSearch: false,
            preview: false,
            size: 'default',
            user: getLoginUser()
        }
    }

    componentDidMount() {
        this.getUsers()
    }

    getUsers = async () => {
        const {user} = this.state
        const res = await this._apiService.getAllUsers()

        if (!res || res.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            const data = (res || []).map((f, i) => ({
                id: i, key: i, login: f.login, name: f.name, email: f.email, bureau: f.bureau
            }))
            this.setState({ users: data })
        }
    }

    onChange = nextTargetKeys => {
        const {users} = this.state
        if (nextTargetKeys && nextTargetKeys.length) {
            const data = []
            nextTargetKeys.forEach(f => {
                data.push(users[f])
            })
            console.log("========Selected Users=======>", data)
            this.setState({ targetKeys: nextTargetKeys, usersData: data });
        } else {
            this.setState({ targetKeys: [] });
        }
    };

    triggerShowSearch = showSearch => {
        this.setState({ showSearch });
    };

    onSearch = (event) => {
        const {users} = this.state
        const searchString = (event && event.target.value) || ""
        let searchList = []
        if (searchString) {
            searchList = users && users.filter(obj =>
                ["login", "name", "bureau", "email"].some(key => {
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

    preview = () => {
        const {usersData} = this.state
        const roles = this.props.getRoles()
        usersData.forEach(f => {
            f.roles = Object.assign([], roles);
        })
        this.setState({
            usersData,
            preview: true
        })
        console.log("===========>", usersData)
    }

    onTagRemove = (userId, tagId) => {
        const {usersData} = this.state
        usersData.forEach(item => {
            if ((item.roles && item.roles.length > 1)) {
                if (item.login === userId) {
                    const index = item.roles.findIndex(f => f.roleName === tagId)
                    // console.log(userId)
                    if (index !== -1) {
                        item.roles.splice(index, 1)
                    }
                }
            } else {
                message.warn('minimum one role is required')
            }
        })

        this.setState({ usersData })
    }

    onUserRemove = (userId) => {
        const {usersData} = this.state
        const index = usersData.findIndex(f => f.login === userId)
        usersData.splice(index, 1)

        this.setState({ usersData })
    }

    render() {
        const {users, showSearch, targetKeys, searchString, searchList, usersData, preview} = this.state
        const data = searchString ? searchList : users

        return (
            <>
                {
                    !preview ?
                        <>
                            <Row className={'mb-3'}>
                                <Col>
                                    <Form.Label >
                                        Users:
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
                                    leftColumns={TableColumns}
                                    rightColumns={TableColumns}
                                    operations={['Select', 'Remove']}
                                />
                            </div>
                            <div>
                                <Row>
                                    <Col md={10}/>
                                    <Col className="mt-3" md={2}>
                                        <Button onClick={() => this.preview()} disabled={!(usersData && usersData.length)}>Review</Button>
                                    </Col>
                                </Row>
                            </div>
                            </> : <Review usersData={usersData} onTagRemove={this.onTagRemove} onUserRemove={this.onUserRemove}/>
                }

            </>
        );
    }
}

export default AccessByUsers;
