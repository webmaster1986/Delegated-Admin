import React from "react";
import {Row, Col, Form, Button, Container} from "react-bootstrap";
import Select from "antd/lib/select";
import { ApiService } from "../../services/ApiService";
import message from "antd/lib/message";
import {Column} from "devextreme-react/data-grid";
import CustomGrid from "../../components/CustomGrid";

const { Option } = Select


class EditApp extends React.Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state= {
            isLoading: false,
            rolesList: [],
            rolesObject: {},
            appObject: {appName: '', appCode: '', appDescription: '', ownerGroup: ''}
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

    onRoleChange = (event) => {
        const { name, value } = event.target
        this.setState({
            rolesObject: {
                ...this.state.rolesObject,
                [name]: value
            }
        })
    }

    onChange = (event) => {
        const { name, value } = event.target
        this.setState({
            appObject: {
                ...this.state.appObject,
                [name]: value
            }
        })
    }

    onAddRole = () => {
        let { rolesList, rolesObject } = this.state
        if(rolesObject && Object.keys(rolesObject).length > 0){
            rolesList.push({...rolesObject, oimTarget: rolesObject.oimTarget || 'IDCS', id: rolesList.length})
            this.setState({
                rolesList,
                rolesObject: {}
            }, () => this.refreshGrid())
        }
    }

    refreshGrid = () => {
        if (this.dg && this.dg.instance) {
            this.dg.instance.refresh()
        }
    }

    onOnBoardApplication = async () => {
        const { rolesList, appObject } = this.state
        const payload = {...appObject, roles: rolesList}
        const data =  await this._apiService.applicationOnBoarding(payload)
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
    }


    render() {
        const { rolesObject, appObject, rolesList } = this.state
        const { appName, appCode, appDescription, ownerGroup } = appObject || {}
        const { roleName, roleDescription, oimTarget } = rolesObject || {}
        return (
            <Container className={'container-design'}>
                <div className="1px solid black">
                    <p className="text-warning mt-3">Enter details of the application to be onboarded</p>

                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column sm={12} md={4}>
                                Application Name
                            </Form.Label>
                            <Col sm={12} md={8}>
                                <Form.Control type="text" name={'appName'} value={appName || ""} onChange={this.onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column md={4}>
                                Application Code
                            </Form.Label>
                            <Col sm={10} md={8}>
                                <Form.Control type="text" name={'appCode'} value={appCode || ""} onChange={this.onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column md={4}>
                                Application Description
                            </Form.Label>
                            <Col sm={10} md={8}>
                                <Form.Control type="text" name={'appDescription'} value={appDescription || ""} onChange={this.onChange}/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label column md={4}>
                                Application Owner Group
                            </Form.Label>
                            <Col sm={10} md={8}>
                                <Form.Group as={Row}>
                                    <Col md={5}>
                                        <Form.Control type="text" name={'ownerGroup'} value={ownerGroup || ""} onChange={this.onChange}/>
                                    </Col>
                                    <Col md={2} className="text-center">(OR)</Col>
                                    <Col md={5}>

                                        <Select
                                            size={'large'}
                                            showSearch
                                            style={{ width: '100%' }}
                                            placeholder="Select a person"
                                            optionFilterProp="children"
                                            name={'ownerGroup'}
                                            value={ownerGroup || ""}
                                            onChange={(value) => this.onChange({target: {name: 'ownerGroup', value}})}
                                            filterOption={(input, option) =>
                                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            <Option value="jack">Jack</Option>
                                            <Option value="lucy">Lucy</Option>
                                            <Option value="tom">Tom</Option>
                                        </Select>

                                    </Col>
                                </Form.Group>
                            </Col>
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
                    >
                        <Column alignment={'left'} caption={'Role Name'} dataField={'roleName'}/>
                        <Column alignment={'left'} caption={'Role Description'} dataField={'roleDescription'}/>
                        <Column alignment={'left'} caption={'OIM Target'} dataField={'oimTarget'}/>
                        <Column alignment={'left'} allowSorting={false} caption={'Action'} dataField={'appCode'}
                                cellRender={(record) => {
                                    return (
                                        <h6 className="text-primary pointer-event"> <u> Remove </u></h6>
                                    )
                                }}/>
                    </CustomGrid>

                    <Form.Group as={Row}>
                        <Col sm={12} md={12}>
                            <Form.Group as={Row}>
                                <Col className="pt-2" md={3}>
                                    <Form.Control type="text" placeholder="Role Name" name={'roleName'} value={roleName || ""} onChange={this.onRoleChange}/>
                                </Col>
                                <Col className="pt-2" md={3}>
                                    <Form.Control type="text" placeholder="Role Description" name={'roleDescription'} value={roleDescription || ""} onChange={this.onRoleChange}/>
                                </Col>
                                <Col className="pt-2" md={3}>
                                    <Form.Group>
                                        <Form.Control as="select" placeholder="Role Description" name={'oimTarget'}  value={oimTarget || ""} onChange={this.onRoleChange}>
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
                            <Button type="submit" variant={'success'} onClick={this.onOnBoardApplication}>Submit</Button>
                        </Col>
                    </Form.Group>
                </div>
            </Container>
        );
    }
}
export default EditApp;
