import MainLayout from "../../layouts/MainLayout"
import { Table, Button,Spin } from "antd";
import React,{useState} from "react";
import '../../assets/css/developer.css';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, ImportOutlined } from '@ant-design/icons';
import ModalTambahDeveloper from "./ModalTambahDeveloper";
import ModalEditDeveloper from "./ModalEditDeveloper";
import DeveloperData from "../../hook/DeveloperData";
import ModalViewDeveloper from "./ModalViewDeveloper";


const Developer = () => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [modalTambahVisible, setModalTambahVisible] = useState(false);
    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [modalViewVisible, setModalViewtVisible] = useState(false);
    const [selectedDeveloperId, setSelectedDeveloperId] = useState(null);
    const { developerList, loading, pagination, fetchDevelopers, handleDelete } = DeveloperData({});

    const handleEdit = (record) => {
        setSelectedDeveloperId(record.id);
        setModalEditVisible(true);
    };

    const handleView = (record) => {
        setSelectedDeveloperId(record.id);
        setModalViewtVisible(true);
    };

    const handlePageChange = (page, size) => {
        fetchDevelopers(page, size);
    };


    const columns = [
    {
        title: 'No',
        key: 'no',
        width: 60,
        align: 'center',
        render: (_text, _record, index) =>
            (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
        title: 'Nama Developer',
        dataIndex: 'companyName',
        key: 'companyName',
        align: 'center',
    },
    {
        title: 'Tier',
        dataIndex: 'classificationTier',
        key: 'classificationTier',
        align: 'center',
    },
    {
        title: 'Tanggal Bergabung',
        dataIndex: 'joinDate',
        key: 'joinDate',
        align: 'center',
    },
    {
        title: 'Aksi',
        key: 'action',
        width: 200,
        align: 'center',
        render: (_, record) => (
            <div className="action-icons">
            <div className="icon-wrapper">
                <EyeOutlined style={{ color: '#35A6F9' }} onClick={() => handleView(record)} />
                <span className="icon-label" style={{ color: '#35A6F9' }}>Lihat</span>
            </div>
            <div className="icon-wrapper">
                <EditOutlined style={{ color: '#f9e235ff' }} onClick={() => handleEdit(record)} />
                <span className="icon-label" style={{ color: '#f9e235ff' }}>Edit</span>
            </div>
            <div className="icon-wrapper">
                <DeleteOutlined style={{ color: '#FF6E6F' }} onClick={() => handleDelete(record.id)} />
                <span className="icon-label" style={{ color: '#FF6E6F' }}>Hapus</span>
            </div>
            </div>
        ),
        }
    ];
    return (
        <>
            <MainLayout pageTitle="Developer">
                <div className="developer-container">
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                    }}>
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 'bold', fontSize: '24px', color: '#101455' }}>Daftar Developer</h2>
                        <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',}}>
                            <div className="icon-btn-wrapper" onClick={() => setModalTambahVisible(true)}>
                                <div className="icon-btn">
                                    <Button 
                                        type="primary" 
                                        icon={<PlusOutlined />} 
                                        style={{ marginRight: 8, borderRadius: '50px' }}
                                    />
                                    <span className="btn-text">Tambah Developer</span>
                                </div>
                            </div>
                            <div className="icon-btn-wrapper">
                                <div className="icon-btn">
                                    <Button type="primary" icon={<ImportOutlined />} style={{ marginRight: 8, borderRadius: '50px' }}/>
                                    <span className="btn-text">Impor Developer</span>
                                </div>
                            </div>
                            <div className="icon-btn-wrapper">
                                <div className="icon-btn">
                                    <Button type="primary" icon={<DownloadOutlined />} style={{ marginRight: 8, borderRadius: '50px' }}/>
                                    <span className="btn-text">Download Template</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Spin spinning={loading}>
                        <Table
                            dataSource={developerList}
                            columns={columns}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'],
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
                                onChange: handlePageChange,
                            }}
                            rowKey="id"
                            scroll={{ y: 500 }}
                        />
                        </Spin>
                </div>
                <ModalTambahDeveloper
                    visible={modalTambahVisible}
                    title="Tambah Developer"
                    setVisible={setModalTambahVisible}
                    onSuccess={() => fetchDevelopers(pagination.current, pagination.pageSize)}
                />

                <ModalEditDeveloper
                    visible={modalEditVisible}
                    setVisible={setModalEditVisible}
                    developerId={selectedDeveloperId}
                    onSuccess={() => fetchDevelopers(pagination.current, pagination.pageSize)}
                />

                <ModalViewDeveloper
                    visible={modalViewVisible}
                    setVisible={setModalViewtVisible}
                    developerId={selectedDeveloperId}
                />
                
            </MainLayout>
        </>
    )
}

export default Developer;