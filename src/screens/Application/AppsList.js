import React, { Component } from 'react';
import { Container, Button, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Spin from 'antd/lib/spin'
import message from 'antd/lib/message'
import { ApiService } from '../../services/ApiService'
import {Select, Table} from "antd";


class AppsList extends Component {
    _apiService = new ApiService();
    constructor(props){
        super(props)
        this.state = {
            isLoading: false,
            applicationsList: [],
            searchString: "",
            searchList: []
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
    appListColumn =[
        {
            dataIndex:'appCode',
            title:'Application Code',
            defaultSortOrder: 'ascend',
            sorter: (a, b) => a.appCode.localeCompare(b.appCode),
            sortDirections: ['descend', 'ascend']
        },
        {
            dataIndex:'appName',
            title:'Application Name',
            sorter: (a, b) => a.appName.localeCompare(b.appName),
            sortDirections: ['descend', 'ascend']
        },
        {
            dataIndex:'appDescription',
            title:'Description',
            sorter: (a, b) => a.appDescription.localeCompare(b.appDescription),
            sortDirections: ['descend', 'ascend']
        },
        {
            dataIndex:'ownerGroup',
            title:'Owner Group',
            sorter: (a, b) => a.ownerGroup.localeCompare(b.ownerGroup),
            sortDirections: ['descend', 'ascend']
        },
        {
            dataIndex:'appCode',
            title:'Action',
            render: (appCode) => {
                return (
                    <div className="text-center">
                        <Link to={`/role-manage/${appCode}`}>
                            <Button variant={'primary'} size={'sm'}>Edit</Button>
                        </Link>
                    </div>
                )
            }
        }

    ];

    onSearch = (event) => {
        const {applicationsList} = this.state
        const searchString = (event && event.target.value) || ""
        let searchList = []
        if (searchString) {
            searchList = applicationsList && applicationsList.filter(obj =>
              ["appName", "appName", "ownerGroup", "appCode"].some(key => {
                  return (
                    obj && obj[key] && obj[key].toLowerCase().includes((searchString && searchString.toLowerCase()) || "")
                  )
              })
            )
        }
        this.setState({
            searchString,
            searchList
        })
    }

    render() {
        const { applicationsList, isLoading, searchString, searchList } = this.state
        const apps = searchString.length ? searchList : applicationsList
        return(
            <Container>
                <div className="container-design">
                    <Row>
                        <Col md={8}>
                            <h4 className="text-left">
                                Applications
                            </h4>
                        </Col>
                        <Col md={4}>
                            <div className="text-right marginTop-sm-1">
                                <Link to={'/create-apps'}> <Button variant="primary">OnBoard New Application </Button> </Link>
                            </div>
                        </Col>
                    </Row>
                    <hr/>

                    <InputGroup className="input-prepend">
                        <InputGroup.Prepend>
                            <InputGroup.Text><i className="fa fa-search" /></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="text"
                          placeholder="Search with application code or name"
                          name="searchString"
                          onChange={this.onSearch}
                        />
                    </InputGroup>
                    <br/>
                    {
                        isLoading ? <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
                          <Table
                            rowKey={'id'}
                            columns={this.appListColumn}
                            size={"small"}
                            dataSource={apps || [] }
                            pagination={false}

                          />
                    }
                </div>
            </Container>
        )
    }
}

export default AppsList
