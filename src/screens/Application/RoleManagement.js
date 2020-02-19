import React from "react";
import {Row, Col, Form, Button, Container} from "react-bootstrap";
import message from "antd/lib/message";
import {Column} from "devextreme-react/data-grid";
import CustomGrid from "../../components/CustomGrid";
import {ApiService} from "../../services/ApiService";
import {Link} from "react-router-dom";


class RoleManagement extends React.Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state= {
            rolesList: [],
            rolesObject: {},
            appObject: {}
        }
    }

    componentDidMount() {
        const { match } = this.props
        // if(match && match.params && match.params.id){
            this.getAppDetailsAndRoles(match.params.id || "App1")
        // }
    }

    getAppDetailsAndRoles = async (appCode) => {
        this.setState({
            isLoading: true
        })
        const appDetails =  await this._apiService.getAppDetailByAppCode(appCode)
        const roles =  await this._apiService.getRolesForApp(appCode)

        if (!appDetails || appDetails.error || !roles || roles.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            this.setState({
                isLoading: false,
                appObject: appDetails || {},
                rolesList: (roles || []).map((role, index) => ({...role, id: index})) || []
            })
        }
    }

    onChange = (event) => {
        const { name, value } = event.target
        this.setState({
            rolesObject: {
                ...this.state.rolesObject,
                [name]: value
            }
        })
    }

    onAddRole = () => {
        let { list, rolesObject } = this.state
        if(rolesObject && Object.keys(rolesObject).length > 0){
            list.push({...rolesObject, oimTarget: rolesObject.oimTarget || 'IDCS', id: list.length})
            this.setState({
                list,
                rolesObject: {}
            })
        }
    }

    onChangeStatus = async (record) => {
        const {appObject} = this.state
        const {roleName, status} = record
        const type = status === "Active" ? "disable" : "activate"
        const data = await this._apiService.rolesStatusActiveDisable({appCode: appObject.appCode, roleName}, type)
        if (data === "SUCCESS") {
            const roles =  await this._apiService.getRolesForApp(appObject.appCode)
            if (!roles || roles.error) {
                this.setState({
                    isLoading: false
                })
                return message.error('something is wrong! please try again');
            } else {
                this.setState({
                    isLoading: false,
                    rolesList: (roles || []).map((role, index) => ({...role, id: index})) || []
                })
            }
        }
    }


    render() {
        const { rolesObject, appObject, rolesList } = this.state
        const { appName, appCode, appDescription, ownerGroup } = appObject || {}
        const { roleName, roleDescription, oimTarget } = rolesObject || {}
        return (
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Role Management
                </h4>
                <hr/>

                <div>
                    <p className="text-warning mt-3">Selected Application Details</p>

                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column xs={6} sm={4} md={3}>
                                Application Name:
                            </Form.Label>
                            <Col xs={6} sm={8} md={3}>
                                <p>{appName}</p>
                            </Col>
                            <Form.Label column xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                App Owner Group:
                            </Form.Label>
                            <Col xs={6} sm={8} md={3} className={'marginTop-sm-1'}>
                                <p>{ownerGroup}</p>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column xs={6} sm={4} md={3}>
                                Application Code:
                            </Form.Label>
                            <Col xs={6} sm={8} md={3}>
                                <p>{appCode}</p>
                            </Col>
                            <Form.Label column xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                Application Description:
                            </Form.Label>
                            <Col xs={6} sm={8} md={3} className={'marginTop-sm-1'}>
                                <p>{appDescription}</p>
                            </Col>
                        </Form.Group>
                    </Form>

                    <p className="text-warning">Roles</p>

                    {/*<Table size={'small'} rowKey={'id'} bordered columns={columns} dataSource={dataList} scroll={{x: 768}}/>*/}

                    <CustomGrid
                        refCallback={(dg) => this.dg = dg}
                        dataSource={rolesList}
                        keyExpr="id"
                        columnHidingEnabled={false}
                        showBorders={true}
                        isHideSearchPanel={true}
                    >
                        <Column alignment={'left'} caption={'Role Name'} dataField={'roleName'}/>
                        <Column alignment={'left'} caption={'Role Description'} dataField={'roleDescription'}/>
                        <Column alignment={'left'} caption={'OIM Target'} dataField={'oimTarget'}/>
                        <Column alignment={'left'} caption={'Status'} dataField={'status'}/>
                        <Column alignment={'left'} allowSorting={false} caption={'Action'} dataField={'appCode'}
                            cellRender={(record) => {
                                const buttonName = record.data.status === 'Active' ? 'Disable' : record.data.status === 'Disabled' ? 'Active' : 'Active'
                                return (
                                    <div className="text-center">
                                        <Button variant={'primary'} size={'sm'} onClick={() => this.onChangeStatus(record.data)}>{buttonName}</Button>
                                    </div>
                                )
                            }}
                        />
                    </CustomGrid>

                    <Form.Group as={Row}>
                        <Col sm={12} md={12}>
                            <Form.Group as={Row}>
                                <Col className="pt-2" md={3}>
                                    <Form.Control type="text" placeholder="Role Name" name={'roleName'} value={roleName || ""} onChange={this.onChange}/>
                                </Col>
                                <Col className="pt-2" md={3}>
                                    <Form.Control type="text" placeholder="Role Description" name={'roleDescription'} value={roleDescription || ""} onChange={this.onChange}/>
                                </Col>
                                <Col className="pt-2" md={3}>
                                    <Form.Group>
                                        <Form.Control as="select" placeholder="Role Description" name={'oimTarget'}  value={oimTarget || ""} onChange={this.onChange}>
                                            <option>IDCS</option>
                                            <option>SN</option>
                                            <option>AD</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={3} className={'pt-2'}>
                                    <Button type="submit" onClick={this.onAddRole}>Add Role</Button>
                                </Col>
                            </Form.Group>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>
                            <Button type="submit" variant={'success'}>Submit</Button>
                        </Col>
                    </Form.Group>
                </div>
            </Container>
        );
    }
}


export default RoleManagement;
