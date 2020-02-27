import React from "react";
import {Modal} from 'antd';
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import {ApiService} from "../../services/ApiService";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

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
      this._apiService.getRoleByRoleName(role),
      this._apiService.getUsersByRoles(role)
    ]).then((results) => {
      console.log(results);
      let result1 = results[0]
      let result2 = results[1]
      if (!result1 || result1.error) {
        result1 = {}
        message.error('something is wrong! please try again');
      }
      if (!result2 || result2.error) {
        result2 = []
        message.error('something is wrong! please try again');
      }
      that.setState({
        role: result1,
        users: result2,
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

    return (
      <Modal
        title="Role Info"
        visible={true}
        onOk={this.props.toggleModal}
        onCancel={this.props.toggleModal}
      >
        <>
          {
            isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
              <div>
                <div>
                  <b>Application Name:&nbsp;&nbsp;</b>
                  <span>{role.appName || ""}</span>
                </div>
                <div>
                  <b>Application Code:&nbsp;&nbsp;</b>
                  <span>{role.appCode || ""}</span>
                </div>
                <div>
                  <b>Application description:&nbsp;&nbsp;</b>
                  <span>{role.appDescription || ""}</span>
                </div>
                <div>
                  <b>Application Owner Group:&nbsp;&nbsp;</b>
                  <span>{role.ownerGroup || ""}</span>
                </div>
                <div>
                  <b>Role Name:&nbsp;&nbsp;</b>
                  <span>{role.roleName || ""}</span>
                </div>
                <div>
                  <b>Role description:&nbsp;&nbsp;</b>
                  <span>{role.roleDescription || ""}</span>
                </div>
                <div>
                  <b>OIM Target:&nbsp;&nbsp;</b>
                  <span>{role.oimTarget || ""}</span>
                </div>
                <div>
                  <b>Role Status:&nbsp;&nbsp;</b>
                  <span>{role.status || "" }</span>
                </div>
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
