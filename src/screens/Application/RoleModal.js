import React from "react";
import {Modal} from 'antd';
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
    Promise.all([
      this._apiService.getUsersByRoles(role)
    ]).then((results) => {
      console.log(results);
      let result1 = results[0]
      if (!result1 || result1.error) {
        result1 = {}
        message.error('something is wrong! please try again');
      }
      that.setState({
        users: result1,
        isLoading: false
      })
    });
  }

  render(){
    const {isLoading, users} = this.state
    const {role} = this.props
    const options = {
      hidePageListOnlyOnePage: true,
      hideSizePerPage: true
    };
    const displayFields = [
      { label: 'Application Name', key: 'appName' },
      { label: 'Application Code', key: 'appCode' },
      { label: 'Application description', key: 'appDescription' },
      { label: 'Application Owner Group', key: 'ownerGroup' },
      { label: 'Role Name', key: 'roleName' },
      { label: 'Role description', key: 'roleDescription' }
    ];
    return (
      <Modal
        title="Role Info"
        visible={true}
        width={800}
        onOk={this.props.toggleModal}
        onCancel={this.props.toggleModal}
      >
        <>
          {
            isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
              <div>
                <Row>
                  {displayFields.map((field, i) =>
                      <Col sm={12} md={6} key={i.toString() + i}>
                        <b>{field.label}:&nbsp;&nbsp;</b>
                        <span>{role[field.key] || ""}</span>
                      </Col>
                  )}
                </Row>
                <br/>
                <BootstrapTable
                  bootstrap4
                  striped
                  keyField='id'
                  data={users || [] }
                  headerClasses="styled-header"
                  pagination={ paginationFactory(options) }
                  columns={[
                    {
                      dataField: 'login',
                      text: 'Login',
                      sort: true
                    },
                    {
                      dataField: 'name',
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
