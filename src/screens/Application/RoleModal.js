import React from "react";
import {Button, Modal} from 'antd';
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import {ApiService} from "../../services/ApiService";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import {Col, Row} from "react-bootstrap";

class RoleModal extends React.Component {
  _apiService = new ApiService();
  state = {
    isLoading: true,
    role: {},
    users: []
  }

  async componentDidMount() {
    const that = this
    const {role} = this.props
    const data = await this._apiService.getUsersByRoles(role)
    const appDetails = await this._apiService.getAppDetailByAppCode(role.appCode)
    let result1 = (data && data.users) || []
    if (!result1 || result1.error) {
      message.error('something is wrong! please try again');
    }
    that.setState({
      users: result1 || [],
      role: {...role, ...(appDetails && appDetails.application)},
      isLoading: false
    })
  }

  render(){
    const {isLoading, users, role} = this.state
    // const {role} = this.props
    const options = {
      hidePageListOnlyOnePage: true,
      hideSizePerPage: true
    };
    if(users.length > 5) options.sizePerPage = 5;

    const displayFields = [
      { label: 'Application Name', key: 'appName' },
      { label: 'Application Code', key: 'appCode' },
      { label: 'Application description', key: 'appDescription' },
      { label: 'Application Owner Group', key: 'ownerGroup' },
      { label: 'Role Name', key: 'roleName' },
      { label: 'Role description', key: 'roleDescription' },
      { label: 'Available Targets', key: 'oimTargets' },
      { label: 'Role Creation Date', key: 'creationDate' },
    ];
    return (
      <Modal
        title="Role Info"
        visible={true}
        width={"50%"}
        // onOk={this.props.toggleModal}
        onCancel={this.props.toggleModal}
        footer={
          <div>
            <Button className="ant-btn-primary" onClick={this.props.toggleModal}>Close</Button>
          </div>
        }
      >
        <>
          {
            isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
              <div>
                <Row>
                  {displayFields.map((field, i) =>
                    <Col sm={12} md={6} key={i.toString() + i}>
                      <b>{field.label}:&nbsp;&nbsp;</b>
                      <span>
                        { field.key === 'oimTargets' ?
                            (role[field.key] || []).map(x => x.name).join(",") :
                            role[field.key] || ""
                        }
                      </span>
                    </Col>
                  )}
                </Row>
                <br/>
                <h6>Users Assigned</h6>
                <BootstrapTable
                  bootstrap4
                  striped
                  keyField='id'
                  data={users || [] }
                  headerClasses="styled-header"
                  pagination={ paginationFactory(options) }
                  columns={[
                    {
                      dataField: 'userLogin',
                      text: 'Login',
                      sort: true
                    },
                    {
                      dataField: 'displayName',
                      text: 'Name',
                      sort: true
                    },
                    {
                      dataField: 'bureau',
                      text: 'Bureau',
                      sort: true
                    },
                    {
                      dataField: 'email',
                      text: 'Email',
                      sort: true
                    }
                  ]}
                />
              </div>
          }
        </>
      </Modal>
    )
  }
}

export default RoleModal;
