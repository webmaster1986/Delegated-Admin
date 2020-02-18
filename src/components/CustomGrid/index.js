import React from "react";
import DataGrid, {Scrolling, SearchPanel, ColumnChooser} from "devextreme-react/data-grid";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.material.blue.light.compact.css";
import "./CustomGrid.scss";

class CustomGrid extends React.Component {
  render() {
    const {refCallback, isTableBordered, children, title, isNoScroll, id, isHideSearchPanel, isColumnChooser, gridClass, ...rest} = this.props;
    const elementAttr = {class: `custom-data-grid ${gridClass ? gridClass : ''} ${!isNoScroll ? 'scrollable' : ''}`};
    if (id) {
      elementAttr.id = id;
    }
    return (
      <div className="grid-main">
        { title && <span className="grid-title">{title}</span> }
        <DataGrid
          ref={refCallback ? refCallback : null}
          dataSource={this.props.dataSource}
          elementAttr= {elementAttr}
          showBorders={!!isTableBordered}
          allowColumnResizing={true}
          allowColumnReordering={true}
          columnAutoWidth={true}
          {...rest}
        >
          <ColumnChooser enabled={!!isColumnChooser} />
          <SearchPanel visible={!isHideSearchPanel} width={240} placeholder={'Search...'} />
          <Scrolling mode={'virtual'} />
          {children}
        </DataGrid>
      </div>
    )
  }
}

// const mapStateToProps = (state) => ({
//   isShowFilterRow: state.settings.isShowFilterRow,
//   isTableBordered: state.settings.isTableBordered,
// });

// export default connect(mapStateToProps)(CustomGrid)
export default CustomGrid
