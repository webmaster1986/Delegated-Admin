import React from "react";
import {Icon} from 'antd';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

const Review = (props) => {
  const options = {
    hidePageListOnlyOnePage: true,
    hideSizePerPage: true
  };

  const columnsByUser = [
    {
      text: 'User Login',
      dataField: 'userLogin',
      formatter: (cell, row) => {
        return (
          <div className="link-text"><u onClick={(e) => props.toggleUserModal(e, row)}>{cell}</u></div>
        )
      }
    },
    {text: 'User Name', dataField: 'displayName'},
    /* {text: 'Email', dataField: 'email'}, */
    {text: 'Bureau', dataField: 'bureau'},
    {
      text: 'Action',
      dataField: 'id',
      headerStyle: {width: 100},
      formatter: (cell, row) => {
        return (
          <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => props.onUserRemove(row)}/>
        )
      }
    }
  ];

  const columnsByRole = [
    {
      text: 'Role Name',
      dataField: 'roleName',
      formatter: (cell, row) => {
        return (
          <div className="link-text"><u onClick={(e) => props.toggleModal(e, row)}>{cell}</u></div>
        )
      }
    },
    {
      text: 'OIM targets',
      dataField: 'oimTargets',
      headerStyle: {width: "30%"},
      formatter: (record) => {
        return (
          (record || []).map((role, i) => (
            <span className="static-tag" key={i.toString()}>
              {role}
            </span>
          ))
        )
      }
    },
    {text: 'App Code', dataField: 'appCode', headerStyle: {width: "20%"}},
    /* {text: 'Role Description', dataField: 'roleDescription'}, */
    /* {text: 'OIM Target', dataField: 'oimTargets'}, */
    {
      text: 'Action',
      dataField: 'id',
      headerStyle: {width: 100},
      formatter: (cell, row) => {
        return (
          <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => props.onUserRemove(row)}/>
        )
      }
    }
  ];

  const userColumn = (rootRecord) => {
    return (
      [
        {
          text: 'Login',
          dataField: 'userLogin',
          formatter: (cell, row) => {
            return (
              <div className="link-text"><u onClick={(e) => props.toggleUserModal(e, row)}>{cell}</u></div>
            )
          }
        },
        {text: 'Name', dataField: 'displayName'},
        /* {text: 'Email', dataField: 'email'}, */
        {text: 'Bureau', dataField: 'bureau'},
        {
          text: 'Action',
          dataField: 'id',
          headerStyle: {width: 100},
          formatter: (cell, row) => {
            return (
              <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => props.onTagRemove(rootRecord.roleName, row.userLogin)}/>
            )
          }
        }
      ]
    )
  }

  const tagColumn = (rootRecord) => {
    return (
      [
        // {text: 'Role Name', dataField: 'roleName'},
        {
          text: 'Role Name',
          dataField: 'roleName',
          formatter: (cell, row) => {
            return (
                <div className="link-text"><u onClick={(e) => props.toggleModal(e, row)}>{cell}</u></div>
            )
          }
        },
        {
          text: 'OIM targets',
          dataField: 'oimTargets',
          headerStyle: {width: "30%"},
          formatter: (record) => {
            return (
              (record || []).join(",")
            )
          }
        },
        {
          text: 'App Code',
          dataField: 'appCode',
          headerStyle: {width: "20%"},
          formatter: (cell, row) => {
            return (
              <div className="link-text"><u onClick={(e) => props.toggleModal(e, row)}>{cell}</u></div>
            )
          }
        },
        /* {text: 'Role Description', dataField: 'roleDescription'}, */
        /* {text: 'OIM Target', dataField: 'oimTargets'}, */
        {
          text: 'Action',
          dataField: 'id',
          headerStyle: {width: 100},
          formatter: (cell, row) => {
            return (
              <Icon className="text-danger" style={{fontSize: 20}} type="delete" onClick={() => props.onTagRemove(rootRecord.userLogin, row.roleName)}/>
            )
          }
        }
      ]
    )
  }

  const expandRow = {
    renderer: row => {
      if (props.category === "roles") {
        return (
          <BootstrapTable
            bootstrap4
            striped
            keyField={'id'}
            data={(row && row.users) || []}
            headerClasses="styled-header"
            columns={userColumn(row)}
            pagination={ paginationFactory(options) }
          />
        )
      }
      return (
        <BootstrapTable
          bootstrap4
          striped
          keyField={'id'}
          data={(row && row.roles) || []}
          headerClasses="styled-header"
          columns={tagColumn(row)}
          pagination={ paginationFactory(options) }
        />
      )
    },
    showExpandColumn: true,
    expandByColumnOnly: true,
    expandColumnRenderer: ({ expanded }) =>  <Icon className="cursor-pointer" type={expanded ? 'up' : 'down'} theme="outlined"/>,
    expandHeaderColumnRenderer: ({ isAnyExpands }) =>  <Icon className="cursor-pointer" type={isAnyExpands ? 'up' : 'down'} theme="outlined"/>
  };

  return (
    <>
      <BootstrapTable
        bootstrap4
        striped
        keyField={'id'}
        data={(props && props.data) || []}
        headerClasses="styled-header"
        columns={props.category === "roles" ? columnsByRole : columnsByUser}
        expandRow={expandRow}
        pagination={ paginationFactory(options) }
        wrapperClasses="table-responsive"
      />

      <div className="text-right mt-3">
        <button className="btn btn-danger btn-sm" onClick={() => props.history.push('/DelegatedAdmin/app-owner')}>Cancel</button>
        &nbsp;&nbsp;
        <button className="btn btn-success btn-sm" onClick={() => props.onSubmit()} disabled={props && props.isSave}>
          { (props && props.isSave) ? <div className="spinner-border spinner-border-sm text-dark"/> : null }
          {' '}Submit
        </button>
      </div>
    </>
  );
}

export default Review;
