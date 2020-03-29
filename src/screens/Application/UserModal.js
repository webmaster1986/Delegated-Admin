import React from "react";
import {Modal, Button} from 'antd';
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import { Row, Col } from 'react-bootstrap';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import {ApiService} from "../../services/ApiService";

class UserModal extends React.Component {
  _apiService = new ApiService();
  state = {
    isLoading: true,
    user: {},
    roles: [],
  }

  async componentDidMount() {
    const {user} = this.props
    const that = this
    Promise.all([
      this._apiService.getUserDetails(user.userLogin),
      this._apiService.getRolesForUser(user.userLogin)
    ]).then((results) => {
      let result1 = results[0]
      let result2 = results[1]
      if (!result1 || result1.error) {
        result1 = {}
        message.error('An error has occurred. Please try again.');
      }
      if (!result2 || result2.error) {
        message.error('An error has occurred. Please try again.');
      }
      that.setState({
        user: (result1 && result1.user) || {},
        roles: (result2 && result2.userRoles) || [],
        isLoading: false
      })
    });
  }

  render(){
    const {user, isLoading, roles} = this.state
    const options = {
      hidePageListOnlyOnePage: true,
      hideSizePerPage: true
    };
    if(roles.length > 5) options.sizePerPage = 5;

    const displayFields = [
      { label: 'Display Name', key: 'displayName' },
      { label: 'Email', key: 'email' },
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'User Login', key: 'userLogin' },
      { label: 'Bureau', key: 'bureau' }
    ];
    return (
      <Modal
        title="User Info"
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
              <>
                <Row>
                  {displayFields.map((field, i) =>
                    <Col sm={12} md={6} key={i.toString() + i}>
                      <b>{field.label}:&nbsp;&nbsp;</b>
                      <span>{user[field.key] || ""}</span>
                    </Col>
                  )}
                </Row>
                <br/>
                <h6>Assigned Roles</h6>
                <BootstrapTable
                  bootstrap4
                  striped
                  keyField='id'
                  data={roles || [] }
                  headerClasses="styled-header"
                  pagination={ paginationFactory(options) }
                  columns={[
                    {
                      dataField: 'roleName',
                      text: 'Role',
                      sort: true
                    },
                    {
                      dataField: 'oimTargets',
                      text: 'OIM Targets',
                      formatter: (record, data, index) => {
                        return(
                            (record || []).join(" ,")
                        )
                      }
                    },
                    {
                      dataField: 'roleDescription',
                      text: 'Description',
                      sort: true
                    },
                    {
                      dataField: 'appCode',
                      text: 'App Code',
                      sort: true
                    }
                  ]}
                />
              </>
          }
        </>
      </Modal>
    )
  }
}

export default UserModal;
