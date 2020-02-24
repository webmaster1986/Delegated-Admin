import React from "react";
import {Modal, Table} from 'antd';
import message from "antd/lib/message";
import Spin from "antd/lib/spin";
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
      this._apiService.getUserDetails(user.login),
      this._apiService.getRolesForUser(user.login)
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
        user: result1,
        roles: result2,
        isLoading: false
      })
    });
  }

  render(){
    const {user, isLoading, roles} = this.state
    return (
      <Modal
        title="User Info"
        visible={true}
        onOk={this.props.toggleModal}
        onCancel={this.props.toggleModal}
      >
        <>
          {
            isLoading ? <div className={'text-center'}><Spin className='mt-50 custom-loading'/></div> :
              <>
                {
                  user && Object.keys(user).map((key, i) =>
                    <div key={i.toString() + i}>
                      <b>{key.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()}:&nbsp;&nbsp;</b>
                      <span>{user[key]}</span>
                    </div>
                  )
                }
                <br/>
                <Table
                  rowKey={'id'}
                  columns={[
                    {
                      dataIndex: 'roleName',
                      title: 'Role'
                    },
                    {
                      dataIndex: 'roleDescription',
                      title: 'Application',
                    },
                    {
                      dataIndex: 'oimTarget',
                      title: 'OIM Target',
                    },
                    {
                      dataIndex: 'appCode',
                      title: 'App Code'
                    }
                  ]}
                  size="small"
                  dataSource={roles || []}
                  pagination={false}
                />
              </>
          }
        </>
      </Modal>
    )
  }
}

export default UserModal;
