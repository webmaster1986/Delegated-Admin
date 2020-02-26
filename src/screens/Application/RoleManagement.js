import React from "react";
import {Row, Col, Form, Button, Container, InputGroup, Breadcrumb} from "react-bootstrap";
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import moment from "moment"
import {ApiService} from "../../services/ApiService";
import {Table} from "antd";


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
        const { rolesObject, appObject, rolesList, isLoading, oimTargetList } = this.state;
        const { appName, appCode, appDescription, ownerGroup } = appObject || {};
        const { roleName, roleDescription, oimTarget } = rolesObject || {};
        const rolesListColumn = [
            {
                dataIndex:'roleName',
                title:'Role Name',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.roleName.localeCompare(b.roleName),
                sortDirections: ['descend', 'ascend']
            },
            {
                dataIndex:'oimTarget',
                title:'Oim Target',
                sorter: (a, b) => a.oimTarget.localeCompare(b.oimTarget),
                sortDirections: ['descend', 'ascend']
            },
            {
                dataIndex:'status',
                title:'Status',
                sorter: (a, b) => a.status.localeCompare(b.status),
                sortDirections: ['descend', 'ascend']
            },
            {
                dataIndex: 'appCode',
                title: 'Action',
                render: (record, data) => {
                    const buttonName = data.status === 'Active' ? 'Disable' : data.status === 'Disabled' ? 'Activate' : ''
                    return (
                        <div className="text-center">
                            {
                                buttonName ?
                                    <Button
                                        variant={'primary'}
                                        size={'sm'}
                                        onClick={() => this.onChangeStatus(data)}
                                    >
                                        {buttonName}
                                    </Button> : null
                            }
                        </div>
                    )
                }
            }
        ];
        return (
            <Container>
                <div className={'container-design'}>
                    <Row>
                        <Col md={12}>
                            <h4 className="text-left">
                                Role Management
                            </h4>
                        </Col>
                    </Row>
                    <hr/>
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">Applications</Breadcrumb.Item>
                        <Breadcrumb.Item active>Role Management</Breadcrumb.Item>
                    </Breadcrumb>
                    { isLoading ?
                      <div className="text-center mt-5-p">
                          <Spin className='mt-50 custom-loading'/>
                      </div> :
                      <div>
                          <p className="text-warning mt-3">Selected Application Details</p>
                          <Row>
                              <Col xs={6} sm={4} md={2}>
                                  <b>Application Name: </b>
                              </Col>
                              <Col xs={6} sm={4} md={3}>
                                  <p>{appName}</p>
                              </Col>
                              <Col xs={6} sm={4} md={2} className={'marginTop-sm-1'}>
                                  <b>App Owner Group:</b>
                              </Col>
                              <Col xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                  <p>{ownerGroup}</p>
                              </Col>
                          </Row>
                          <Row>
                              <Col xs={6} sm={4} md={2}>
                                  <b>Application Code:</b>
                              </Col>
                              <Col xs={6} sm={4} md={3}>
                                  <p>{appCode}</p>
                              </Col>
                              <Col xs={6} sm={4} md={2} className={'marginTop-sm-1'}>
                                  <b>Application Description:</b>
                              </Col>
                              <Col xs={6} sm={4} md={3} className={'marginTop-sm-1'}>
                                  <p>{appDescription}</p>
                              </Col>
                          </Row>

                          <p className="text-warning">Roles</p>
                          <Table
                            rowKey={"id"}
                            columns={rolesListColumn}
                            size={"small"}
                            dataSource={rolesList || []}
                            pagination={false}
                            expandedRowRender={record => (
                             <div>
                                 <span>
                                     <b>Role Description:</b>{"    "}{record.roleDescription}
                                 </span>
                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                 <span>
                                     <b>Creation Date:</b>{"    "}{moment(record.creationDate).format("MM/DD/YYYY")}
                                 </span>
                             </div>
                            )}
                          />
                          <Row>
                              <Col sm={12} md={12}>
                                  <Row>
                                      <Col className="pt-2" md={3}>
                                          <Form.Control
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
                                  </Row>
                              </Col>
                          </Row>
                      </div>
                    }
                </div>
            </Container>
        );
    }
}


export default RoleManagement;
