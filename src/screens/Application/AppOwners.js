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
import { Select, Table } from "antd";

const { Option } = Select;

class AppOwners extends Component {
  _apiService = new ApiService();
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      onCategorySelect: false,
      applicationsList: [],
      selectBy: ""
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
      dataIndex: "appCode",
      title: "Application Code",
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.appCode.localeCompare(b.appCode),
      sortDirections: ['descend', 'ascend']
    },
    {
      dataIndex: "appName",
      title: "Application Name",
      sorter: (a, b) => a.appName.localeCompare(b.appName),
      sortDirections: ['descend', 'ascend']
    },
    {
      dataIndex: "appDescription",
      title: "Description",
      sorter: (a, b) => a.appDescription.localeCompare(b.appDescription),
      sortDirections: ['descend', 'ascend']
    },
    {
      dataIndex: "ownerGroup",
      title: "Owner Group",
      sorter: (a, b) => a.ownerGroup.localeCompare(b.ownerGroup),
      sortDirections: ['descend', 'ascend']
    },
    {
      dataIndex: "appCode",
      title: "Action",
      render: appCode => {
        return (
          <div className="text-center">
            <Select defaultValue="manage access">
              <Option value="manage access" disabled>
                Manage Access
              </Option>
              <Option value="grant access">
                <Link to={`/grant-access/${appCode}`}>
                  Grant Access
                </Link>
              </Option>
              <Option value="revoke access">
                <Link to={`/revoke-access/${appCode}`}>
                  Revoke Access
                </Link>
              </Option>
            </Select>
          </div>
        );
      }
    }
  ];
  render() {
    const {
      applicationsList,
      isLoading,
      onCategorySelect,
      id,
      selectBy
    } = this.state;
    return (
      <Container className={"container-design"}>
        <h4 className="text-right">Applications</h4>
        <hr />
        {
          <>
            <Row>
              <Col md={12}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    aria-describedby="inputGroupPrepend"
                    name="username"
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
                <Table
                    rowKey={"id"}
                    columns={this.appOwnersColumn}
                    size={"small"}
                    dataSource={applicationsList || []}
                    pagination={false}
                />
            )}
          </>
        }
      </Container>
    );
  }
}

export default AppOwners;
