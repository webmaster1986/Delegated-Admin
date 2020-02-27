import React, { Component } from "react";
import {
  Container,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Dropdown
} from "react-bootstrap";
import { Link } from "react-router-dom";
import Spin from "antd/lib/spin";
import message from "antd/lib/message";
import { ApiService } from "../../services/ApiService";
import { Select } from "antd";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

const { Option } = Select;

class AppOwners extends Component {
  _apiService = new ApiService();
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      onCategorySelect: false,
      applicationsList: [],
      selectBy: "",
      searchString: "",
      searchList: []
    };
  }

  async componentDidMount() {
    this.setState({
      isLoading: true
    });

    const data = await this._apiService.getAllApplications();
    if (!data || data.error) {
      this.setState({
        isLoading: false
      });
      return message.error("something is wrong! please try again");
    } else {
      this.setState({
        isLoading: false,
        applicationsList: data || []
      });
    }
  }

  appOwnersColumn = [
    {
      dataField: "appCode",
      text: "Application Code",
      sort: true
    },
    {
      dataField: "appName",
      text: "Application Name",
      sort: true
    },
    {
      dataField: "appDescription",
      text: "Description",
      sort: true
    },
    {
      dataField: "ownerGroup",
      text: "Owner Group",
      sort: true
    },
    {
      dataField: "appCode",
      text: "Action",
      headerStyle: {width: 100},
      formatter: appCode => {
        return (
          <div className="text-center">
            <Select defaultValue="manage access">
              <Option value="manage access" disabled>
                Manage Access
              </Option>
              <Option value="grant access" onClick={() => this.props.history.push(`/grant-access?app=${appCode}`)}>
                <Link to={`/grant-access?app=${appCode}`}>
                  Grant Access
                </Link>
              </Option>
              <Option value="revoke access" onClick={() => this.props.history.push(`/revoke-access?app=${appCode}`)}>
                <Link to={`/revoke-access?app=${appCode}`}>
                  Revoke Access
                </Link>
              </Option>
            </Select>
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
    const {
      applicationsList,
      isLoading,
      searchString,
      searchList
    } = this.state;
    const apps = searchString.length ? searchList : applicationsList
    const options = {
      hidePageListOnlyOnePage: true,
      hideSizePerPage: true
    };

    return (
      <Container className={"container-design"}>
        <h4 className="text-left">Applications</h4>
        <hr />
        {
          <>
            <Row>
              <Col md={12}>
                <InputGroup className="input-prepend">
                  <InputGroup.Prepend>
                    <InputGroup.Text><i className="fa fa-search" /></InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="text"
                    placeholder="search"
                    name="searchString"
                    onChange={this.onSearch}
                  />
                </InputGroup>
              </Col>
            </Row>
            <br />
            {isLoading ? (
              <div className={"text-center"}>
                {" "}
                <Spin className="mt-50 custom-loading" />{" "}
              </div>
            ) : (
                <BootstrapTable
                  bootstrap4
                  striped
                  keyField='id'
                  data={apps || [] }
                  columns={ this.appOwnersColumn }
                  headerClasses="styled-header"
                  pagination={ paginationFactory(options) }
                />
            )}
          </>
        }
      </Container>
    );
  }
}

export default AppOwners;
