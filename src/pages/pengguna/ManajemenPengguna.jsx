import MainLayout from "../../layouts/MainLayout"
import { Table, Button, Spin, Tag, Popconfirm, message } from "antd";
import React, { useState } from "react";
// Asumsi Anda telah membuat hook ini
import UserData from "../../hook/UserData"; 
// Asumsi Anda telah membuat komponen modal ini
import ModalTambahPengguna from "./ModalTambahPengguna"; 
import ModalEditPengguna from "./ModalEditPengguna";
import '../../assets/css/Pengguna.css';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, DownloadOutlined, ImportOutlined } from '@ant-design/icons';


const ManajemenPengguna = () => {
    // State tidak perlu untuk currentPage dan pageSize jika sudah diurus oleh hook
    const [modalTambahVisible, setModalTambahVisible] = useState(false);
    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Mengganti PenggunaList/fetchPenggunas/handleDelete menjadi UserList/fetchUsers/handleDeleteUser
    // Asumsi UserData mengembalikan data dan fungsi yang relevan
    const { UserList, loading, pagination, fetchUsers, handleDeleteUser } = UserData({});

    const handleEdit = (record) => {
        // Asumsi record.user_id adalah ID unik dari skema DB users
        setSelectedUserId(record.user_id); 
        setModalEditVisible(true);
    };

    const handleDelete = async (userId) => {
        try {
            await handleDeleteUser(userId);
            message.success('Pengguna berhasil dihapus!');
            // Refresh data setelah penghapusan
            fetchUsers(pagination.current, pagination.pageSize); 
        } catch (error) {
            message.error('Gagal menghapus pengguna.');
            console.error(error);
        }
    };


    const handlePageChange = (page, size) => {
        fetchUsers(page, size);
    };

    const renderRoles = (roles) => {
        if (!roles || roles.length === 0) {
            return <Tag color="default">Tanpa Peran</Tag>;
        }
        // Asumsi data pengguna mencakup array peran, misalnya [{role_id: 1, role_name: 'Admin'}, ...]
        return (
            <div>
                {roles.map(role => (
                    <Tag key={role.role_id} color="blue" style={{ marginBottom: '4px' }}>
                        {role.role_name}
                    </Tag>
                ))}
            </div>
        );
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
            title: 'Nama Pengguna',
            dataIndex: 'full_name', // Sesuai dengan skema users.full_name
            key: 'full_name',
            align: 'left',
            sorter: (a, b) => a.full_name.localeCompare(b.full_name),
        },
        {
            title: 'Email',
            dataIndex: 'email', // Sesuai dengan skema users.email
            key: 'email',
            align: 'left',
        },
        {
            title: 'Peran',
            dataIndex: 'roles', // Asumsi data API menyertakan array 'roles'
            key: 'roles',
            align: 'center',
            render: renderRoles,
        },
        {
            title: 'Status Aktif',
            dataIndex: 'is_active', // Sesuai dengan skema users.is_active
            key: 'is_active',
            align: 'center',
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Aktif' : 'Non-aktif'}
                </Tag>
            ),
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
                    <Popconfirm
                        title="Hapus Pengguna"
                        description={`Apakah Anda yakin ingin menghapus pengguna ${record.full_name}?`}
                        onConfirm={() => handleDelete(record.user_id)}
                        okText="Ya"
                        cancelText="Tidak"
                    >
                        <div className="icon-wrapper">
                            <DeleteOutlined style={{ color: '#FF6E6F' }} />
                            <span className="icon-label" style={{ color: '#FF6E6F' }}>Hapus</span>
                        </div>
                    </Popconfirm>
                </div>
            ),
        }
    ];

    const handleView = (record) => console.log("Lihat detail pengguna:", record);

    return (
        <>
            <MainLayout pageTitle="Pengguna">
                <div className="Pengguna-container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 'bold', fontSize: '24px', color: '#101455' }}>Daftar Pengguna</h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <div className="icon-btn-wrapper" onClick={() => setModalTambahVisible(true)}>
                                <div className="icon-btn">
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        style={{ marginRight: 8, borderRadius: '50px' }}
                                    />
                                    <span className="btn-text">Tambah Pengguna</span>
                                </div>
                            </div>
                            <div className="icon-btn-wrapper">
                                <div className="icon-btn">
                                    <Button type="primary" icon={<ImportOutlined />} style={{ marginRight: 8, borderRadius: '50px' }} />
                                    <span className="btn-text">Impor Pengguna</span>
                                </div>
                            </div>
                            <div className="icon-btn-wrapper">
                                <div className="icon-btn">
                                    <Button type="primary" icon={<DownloadOutlined />} style={{ marginRight: 8, borderRadius: '50px' }} />
                                    <span className="btn-text">Download Template</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Spin spinning={loading}>
                        <Table
                            dataSource={UserList} // Mengganti PenggunaList menjadi UserList
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
                            rowKey="user_id" // Mengganti rowKey menjadi user_id
                            scroll={{ y: 500 }}
                        />
                    </Spin>
                </div>
                <ModalTambahPengguna
                    visible={modalTambahVisible}
                    title="Tambah Pengguna"
                    setVisible={setModalTambahVisible}
                    onSuccess={() => fetchUsers(pagination.current, pagination.pageSize)} // Mengganti fetchPenggunas menjadi fetchUsers
                />

                <ModalEditPengguna
                    visible={modalEditVisible}
                    setVisible={setModalEditVisible}
                    userId={selectedUserId} // Mengganti PenggunaId menjadi userId
                    onSuccess={() => fetchUsers(pagination.current, pagination.pageSize)} // Mengganti fetchPenggunas menjadi fetchUsers
                />
            </MainLayout>
        </>
    )
}

export default ManajemenPengguna;