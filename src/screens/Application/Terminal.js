import React from "react"
import {Col, Container, Form, InputGroup, Row, Badge, Dropdown, ButtonToolbar} from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

const headerStyle = { backgroundColor: '#0d78af', color: '#ffffff' }
const columns = [
    {
        dataField: 'ref',
        text: 'REF#',
        headerStyle,
        sort: true
    },
    {
        dataField: 'boro',
        text: 'BORO',
        headerStyle,
        sort: true
    },
    {
        dataField: 'box',
        text: 'BOX',
        headerStyle,
        sort: true
    },
    {
        dataField: 'terminal',
        text: 'Terminals',
        headerStyle,
        sort: true
    },
    {
        dataField: 'monitored-premise',
        text: 'MONITORED PREMISE',
        headerStyle,
        sort: true
    },
    {
        dataField: 'comp',
        text: 'COMP',
        headerStyle,
        sort: true
    }
];

const products = [
    {
        "ref": 1245,
        "boro": "MAN",
        "box": 413,
        "terminal": "26 - Manual 27 - Value",
        "monitored-premise": "102 Gold Street",
        "comp": "HFC",
    },
    {
        "ref": 2878,
        "boro": "SI",
        "box": 363,
        "terminal": "26 - Class E",
        "monitored-premise": "6 W 20 Street",
        "comp": "HPC",
    },
    {
        "ref": 1247,
        "boro": "QNS",
        "box": 124,
        "terminal": "56 - Value",
        "monitored-premise": "65 Bleeker Street",
        "comp": "AFA",
    },
    {
        "ref": 2145,
        "boro": "BX",
        "box": 459,
        "terminal": "12 - Class E",
        "monitored-premise": "166 Montague Street",
        "comp": "AFA",
    },
]

class Terminal extends React.Component {

    render() {
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total ml-2">
                Showing { from } to { to } of { size } Results
            </span>
        );

        const options = {
            paginationSize: 4,
            pageStartIndex: 0,
            // alwaysShowAllBtns: true, // Always show next and previous button
            // withFirstAndLast: false, // Hide the going to First and Last page button
            // hideSizePerPage: true, // Hide the sizePerPage dropdown always
            // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
            firstPageText: 'First',
            prePageText: 'Back',
            nextPageText: 'Next',
            lastPageText: 'Last',
            nextPageTitle: 'First page',
            prePageTitle: 'Pre page',
            firstPageTitle: 'Next page',
            lastPageTitle: 'Last page',
            showTotal: true,
            paginationTotalRenderer: customTotal,
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: 'All', value: products.length
            }] // A numeric array is also available. the purpose of above example is custom the text
        };

        return (
            <Container className={"container-design"}>
                <h4 className="text-right">Terminal</h4>
                <hr />
                {
                    <>
                        <Row>
                            <Col md={5}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search..."
                                        aria-describedby="inputGroupPrepend"
                                        name="username"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={5}>
                                <ButtonToolbar>
                                    <Dropdown className="ml-2 mt-1">
                                        <Dropdown.Toggle id="dropdown-basic">Borough</Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#/action-1">Italy</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">France</Dropdown.Item>
                                            <Dropdown.Item href="#/action-3">Poland</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    <Dropdown className="ml-2 mt-1">
                                        <Dropdown.Toggle id="dropdown-basic">Terminal</Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#/action-1">1</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">2</Dropdown.Item>
                                            <Dropdown.Item href="#/action-3">3</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    <Dropdown className="ml-2 mt-1">
                                        <Dropdown.Toggle id="dropdown-basic">Comp.</Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#/action-1">SFC</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">HPA</Dropdown.Item>
                                            <Dropdown.Item href="#/action-3">AFA</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <button type="button" className="btn btn-primary ml-2 mt-1">Search</button>
                                </ButtonToolbar>
                            </Col>
                            <Col md={2}>
                                <span className="terminal-font ml-2">All filters </span><span> | </span><span className="terminal-font"> Clear <Badge variant="secondary">2</Badge></span>
                            </Col>
                        </Row>
                        <hr/>
                        <Row className="m-2">
                            <Col md={8}>
                                <h4>Terminal Assignment List</h4>
                            </Col>
                            <Col md={4}>
                                <button type="button" className="btn btn-primary float-right">New</button>
                            </Col>
                        </Row>
                        <BootstrapTable
                            bootstrap4
                            keyField="id"
                            data={ products }
                            columns={ columns }
                            striped
                            headerClasses="header-class"
                            pagination={ paginationFactory(options) }
                        />
                    </>
                }
            </Container>
        );
    }

}

export default Terminal;
