import { Table } from 'antd';   

const TableComponent = (props) => {
    const { columns, dataSource, loading } = props;
    
    return (
        <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{ pageSize: 10 }}
        rowKey="id"
        />
    );
}

export default TableComponent;