import React, { Component } from 'react';
import { Container, Button} from 'react-bootstrap'
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

const products = [
    {
        appCode: 1,
        appName: 'First App',
        description: 'First App Description',
        ownerGroup: 'asdasda',
    },{
        appCode: 2,
        appName: 'Second App',
        description: 'Second App Description',
        ownerGroup: 'asdasda',
    },{
        appCode: 3,
        appName: 'Third App',
        description: 'Third App Description',
        ownerGroup: 'asdasda',
    },{
        appCode: 4,
        appName: 'Fourth App',
        description: 'Fourth App Description',
        ownerGroup: 'asdasda',
    }
];

class ReviewApps extends Component {
    constructor(props){
        super(props)
        this.state = {}
    }

    render() {
        const productsColumn = [
            {
                dataField:'appCode',
                text:'App Code',
                sort: true
            },
            {
                dataField:'description',
                text:'Description',
                sort: true
            },
            {
                dataField:'ownerGroup',
                text:'Owner Group',
                sort: true
            },
            {
                dataField:'appCode',
                text:'Action',
                headerStyle: {width: 100},
                formatter: () => {
                    return (
                        <div>
                            <Button variant={'outline-success'} size={'sm'}>Approve</Button>&nbsp;&nbsp;
                            <Button variant={'outline-danger'} size={'sm'}>Revoke</Button>
                        </div>
                    )}
            }
        ];

        const options = {
            hidePageListOnlyOnePage: true,
            hideSizePerPage: true
        };
        return(
            <Container className={'container-design'}>
                <h4 className="text-left">
                    Applications
                </h4>
                <hr/>
                <BootstrapTable
                  bootstrap4
                  striped
                  keyField='id'
                  data={products || [] }
                  headerClasses="styled-header"
                  columns={ productsColumn }
                  pagination={ paginationFactory(options) }
                />

            </Container>
        )
    }
}

export default ReviewApps
