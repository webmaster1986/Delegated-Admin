import React, { Component } from 'react';
import { Button, Row, Col, Form, InputGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Spin from 'antd/lib/spin'
import message from 'antd/lib/message'
import { ApiService } from '../../services/ApiService'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';


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
                applicationsList: (data && data.applications && data.applications.map((f, i) => ({ ...f, id: i}))) || []
            })
        }
    }

    appListColumn = [
        {
            dataField:'appCode',
            text:'Application Code',
            sort: true,
            headerStyle: {width: "15%"},
        },
        {
            dataField:'appName',
            text:'Application Name',
            sort: true,
            headerStyle: {width: "15%"},
        },
        {
            dataField:'appDescription',
            text:'Description',
            headerStyle: {width: "35%"},
        },
        {
            dataField:'ownerGroup',
            text:'Owner Group',
            sort: true,
            headerStyle: {width: "15%"},
        },
        {
            dataField:'id',
            text:'Action',
            headerStyle: {width: 60},
            formatter: (cell, row) => {
                return (
                  <Link to={`/DelegatedAdmin/role-manage/${row.appCode}`}>
                      <Button variant={'primary'} size={'sm'}>Edit</Button>
                  </Link>
            )},
        }
    ];

    onSearch = (event) => {
        const {applicationsList} = this.state
        const searchString = (event && event.target.value) || ""
        let searchList = []
        if (searchString) {
            searchList = applicationsList && applicationsList.filter(obj =>
              ["appName", "appCode"].some(key => {
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
        const options = {
            hidePageListOnlyOnePage: true,
            hideSizePerPage: true
        };

        return(
            <>
                <div className="container-design">
                    <Row>
                        <Col md={8}>
                            <h4 className="text-left">
                                Applications
                            </h4>
                        </Col>
                        <Col md={4}>
                            <div className="text-right marginTop-sm-1">
                                <Link to={'/DelegatedAdmin/create-apps'}> <Button variant="primary">OnBoard New Application </Button> </Link>
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
                          value={searchString || ""}
                          onChange={this.onSearch}
                        />
                        <InputGroup.Append>
                            <Button variant="outline-secondary" onClick={() => this.onSearch({ target: { value: '' } })}>Clear</Button>
                        </InputGroup.Append>
                    </InputGroup>
                    <br/>
                    {
                        isLoading ? <div className={'text-center'}> <Spin className='mt-50 custom-loading'/> </div> :
                            <BootstrapTable
                                bootstrap4
                                striped
                                keyField='id'
                                data={ apps || [] }
                                headerClasses="styled-header"
                                columns={ this.appListColumn }
                                pagination={ paginationFactory(options) }
                                wrapperClasses="table-responsive"
                            />
                    }
                </div>
            </>
        )
    }
}

export default AppsList
