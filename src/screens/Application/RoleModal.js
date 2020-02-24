import React from "react";
import {Modal, Table} from 'antd';
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
import {ApiService} from "../../services/ApiService";

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
                <Table
                  rowKey={'id'}
                  columns={[
                    {
                      dataIndex: 'login',
                      title: 'Login'
                    },
                    {
                      dataIndex: 'name',
                      title: 'Name',
                    },
                    {
                      dataIndex: 'bureau',
                      title: 'Bureau',
                    },
                    {
                      dataIndex: 'email',
                      title: 'Email',
                    }
                  ]}
                  size="small"
                  dataSource={users || []}
                  pagination={false}
                />
              </div>
          }
        </>
      </Modal>
    )
  }
}

export default RoleModal;
