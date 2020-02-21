import React, { Component } from 'react';
import { Container, Button, Row, Col, Form, InputGroup, Dropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Spin from 'antd/lib/spin'
import message from 'antd/lib/message'
import { ApiService } from '../../services/ApiService'
import {Column} from "devextreme-react/data-grid";
import CustomGrid from "../../components/CustomGrid";


class AppOwners extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            isLoading: false,
            applicationsList: []
        }
    }

    async componentDidMount() {
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
    }

    render() {
        const { applicationsList, isLoading } = this.state
        return(
            <Container className={'container-design'}>
                <h4 className="text-right">
                    Applications
                </h4>
                <hr/>
                <Row>
                    <Col md={12}>
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

                {
                    isLoading ? <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
                        <CustomGrid
                            refCallback={(dg) => this.dg = dg}
                            dataSource={applicationsList}
                            keyExpr="appCode"
                            columnHidingEnabled={false}
                            showBorders={true}
                            isHideSearchPanel={true}
                        >
                            <Column alignment={'left'} sortOrder={'asc'} caption={'Application Code'} dataField={'appCode'}/>
                            <Column alignment={'left'} caption={'Application Name'} dataField={'appName'}/>
                            <Column alignment={'left'} caption={'Description'} dataField={'appDescription'}/>
                            <Column alignment={'left'} caption={'Owner Group'} dataField={'ownerGroup'}/>
                            <Column alignment={'left'} allowSorting={false} caption={'Action'} dataField={'appCode'}
                                cellRender={(record) => {
                                    return (
                                        <div className="text-center" style={{overflowY: "auto"}}>
                                            <Dropdown>
                                                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                                    Manage Access
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu>
                                                    <Dropdown.Item><Link to={`/grant-access?app=${record.data.appCode}`}>Grant Access</Link></Dropdown.Item>
                                                    <Dropdown.Item href="#/action-2">Revoke Access</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    )
                                }}
                            />
                        </CustomGrid>
                }

            </Container>
        )
    }
}

export default AppOwners
