import React from "react";
import {Row, Col, Form, Button, Container} from "react-bootstrap";
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import moment from "moment"
import {Column, Paging} from "devextreme-react/data-grid";
import CustomGrid from "../../components/CustomGrid";
import {ApiService} from "../../services/ApiService";


class RoleManagement extends React.Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state= {
            isLoading: false,
            rolesList: [],
            oimTargetList: [],
            rolesObject: {},
            appObject: {}
        }
    }

    componentDidMount() {
        const { match } = this.props
        if(match && match.params && match.params.id){
            this.getAppDetailsAndRoles(match.params.id)
        }
    }

    getAppDetailsAndRoles = async (appCode) => {
        this.setState({
            isLoading: true
        })
        const appDetails =  await this._apiService.getAppDetailByAppCode(appCode)
        const roles =  await this._apiService.getRolesForApp(appCode)
        const roleTarget = await this._apiService.getAppRoleTargets()

        if (!appDetails || appDetails.error || !roles || roles.error || !roleTarget || roleTarget.error) {
            this.setState({
                isLoading: false
            })
            return message.error('something is wrong! please try again');
        } else {
            this.setState({
                isLoading: false,
                appObject: appDetails || {},
                rolesList: (roles || []).map((role, index) => ({...role, id: index})) || [],
                oimTargetList: roleTarget || []
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

    onAddRole = async () => {
        let { list, rolesObject, oimTargetList, appObject } = this.state
        if(rolesObject && Object.keys(rolesObject).length > 0){
            // list.push({...rolesObject, oimTarget: rolesObject.oimTarget || oimTargetList[0], id: list.length})
            const body = [{roleName: `APP1_${appObject.appCode}${rolesObject.roleName}`, roleDescription: rolesObject.roleDescription, oimTarget: rolesObject.oimTarget || oimTargetList[0]}]
            console.log({body})
            const data = await this._apiService.addRoleToApplication(appObject.appCode, body)
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
        const { rolesObject, appObject, rolesList, isLoading, oimTargetList } = this.state
        const { appName, appCode, appDescription, ownerGroup } = appObject || {}
        const { roleName, roleDescription, oimTarget } = rolesObject || {}
        return (
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Role Management
                </h4>
                <hr/>

                { isLoading ?
                    <div className="text-center mt-5-p">
                        <Spin className='mt-50 custom-loading'/>
                    </div> :

                    <div>
                        <p className="text-warning mt-3">Selected Application Details</p>

                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column xs={6} sm={4} md={3}>
                                    Application Name:
                                </Form.Label>
                                <Form.Label column xs={6} sm={4} md={3}>
                                    <p><b> {appName} </b></p>
                                </Form.Label>
                                <Form.Label column xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                    App Owner Group:
                                </Form.Label>
                                <Form.Label column xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                    <p><b> {ownerGroup} </b></p>
                                </Form.Label>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column xs={6} sm={4} md={3}>
                                    Application Code:
                                </Form.Label>
                                <Form.Label column xs={6} sm={4} md={3}>
                                    <p><b> {appCode} </b></p>
                                </Form.Label>
                                <Form.Label column xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                    Application Description:
                                </Form.Label>
                                <Form.Label column xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                    <p><b> {appDescription} </b></p>
                                </Form.Label>
                            </Form.Group>
                        </Form>

                        <p className="text-warning">Roles</p>

                        <CustomGrid
                            refCallback={(dg) => this.dg = dg}
                            dataSource={rolesList}
                            keyExpr="id"
                            columnHidingEnabled={false}
                            showBorders={true}
                            isHideSearchPanel={true}
                            isScrollDisabled={true}
                        >
                            <Paging defaultPageSize={5}/>
                            <Column alignment={'left'} caption={'Role Name'} dataField={'roleName'}/>
                            <Column alignment={'left'} caption={'Role Description'} dataField={'roleDescription'}/>
                            <Column alignment={'left'} caption={'OIM Target'} dataField={'oimTarget'}/>
                            <Column alignment={'left'} caption={'Created Date'} dataField={'creationDate'} cellRender={(record) => {
                                return(
                                    <div> { record && record.value && moment(record.value).format('MM/DD/YYYY HH:MM A') } </div>
                                )
                            }}/>
                            <Column alignment={'left'} caption={'Status'} dataField={'status'}/>
                            <Column alignment={'left'} allowSorting={false} caption={'Action'} dataField={'appCode'}
                                    cellRender={(record) => {
                                        const buttonName = record.data.status === 'Active' ? 'Disable' : record.data.status === 'Disabled' ? 'Activate' : ''
                                        return (
                                            <div className="text-center">
                                                {
                                                    buttonName ?
                                                    <Button
                                                        variant={'primary'}
                                                        size={'sm'}
                                                        onClick={() => this.onChangeStatus(record.data)}
                                                    >
                                                        {buttonName}
                                                    </Button> : null
                                                }
                                            </div>
                                        )
                                    }}
                            />
                        </CustomGrid>

                        <Form.Group as={Row}>
                            <Col sm={12} md={12}>
                                <Form.Group as={Row}>
                                    <Col className="pt-2 input-group" md={3}>
                                        <span className="input-group-addon prefix">{`APP1_${appCode}`}</span>
                                        <Form.Control
                                            className="prefix-input"
                                            type="text"
                                            placeholder="Role Name"
                                            name={'roleName'}
                                            value={roleName || ""}
                                            onChange={this.onChange}
                                        />
                                    </Col>
                                    <Col className="pt-2" md={3}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Role Description"
                                            name={'roleDescription'}
                                            value={roleDescription || ""}
                                            onChange={this.onChange}
                                        />
                                    </Col>
                                    <Col className="pt-2" md={3}>
                                        <Form.Group>
                                            <Form.Control as="select" placeholder="Role Description" name={'oimTarget'}
                                                          value={oimTarget || ""} onChange={this.onChange}>
                                                {
                                                    (oimTargetList || []).map((oim, index) => {
                                                        return (
                                                            <option key={index.toString()}>{oim}</option>
                                                        )
                                                    })
                                                }
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className={'pt-2'}>
                                        <Button type="submit" onClick={this.onAddRole}>Add Role</Button>
                                    </Col>
                                </Form.Group>
                            </Col>
                        </Form.Group>
                    </div>
                }

            </Container>
        );
    }
}


export default RoleManagement;
