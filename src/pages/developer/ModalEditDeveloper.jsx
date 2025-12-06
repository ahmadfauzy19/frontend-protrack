import { Modal, Form, Input, Select, DatePicker, message, Table } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  updateDeveloper,
  getDeveloperById,
  getAllLogicDisbursement,
} from "../../service/api/DeveloperApi";

const { Option } = Select;

const ModalEditDeveloper = ({ visible, setVisible, developerId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logicDisbursements, setLogicDisbursements] = useState([]);
  const [filteredStages, setFilteredStages] = useState([]);

  // Reset form saat modal ditutup
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setFilteredStages([]);
    }
  }, [visible]);

  // Load data logic + developer secara berurutan
  useEffect(() => {
    if (!visible) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Ambil semua logic disbursement terlebih dahulu
        const resLogic = await getAllLogicDisbursement();
        const logicData = resLogic.data || resLogic;
        setLogicDisbursements(logicData);

        // 2️⃣ Jika ada developerId, ambil datanya
        if (developerId) {
          const resDev = await getDeveloperById(developerId);
          const data = resDev.data ?? resDev;

          form.setFieldsValue({
            companyName: data.companyName || "",
            classificationTier: data.classificationTier || undefined,
            joinDate: data.joinDate ? dayjs(data.joinDate) : null,
          });

          // 3️⃣ Jalankan handleTierChange setelah logic data siap
          if (data.classificationTier) {
            handleTierChange(data.classificationTier, logicData);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data developer:", err);
        message.error("Gagal memuat data developer atau tier");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, developerId]);

  // Saat user pilih Tier
  const handleTierChange = (tierValue, sourceData) => {
    const logicList = sourceData || logicDisbursements;
    if (!tierValue) {
      setFilteredStages([]);
      return;
    }

    // Filter semua stage berdasarkan tier
    const stages = logicList.filter(
      (item) => item.developerType.toLowerCase() === tierValue.toLowerCase()
    );

    // Urutkan sesuai urutan logis
    const stageOrder = ["Started", "Foundation", "Roofing", "Finishing"];
    stages.sort(
      (a, b) =>
        stageOrder.indexOf(a.progressStage) - stageOrder.indexOf(b.progressStage)
    );

    setFilteredStages(stages);
  };

  // Submit perubahan developer
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        companyName: values.companyName,
        classificationTier: values.classificationTier,
        joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
      };

      setLoading(true);
      await updateDeveloper(developerId, payload);
      message.success("Developer berhasil diperbarui!");
      setVisible(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      message.error("Gagal memperbarui developer!");
    } finally {
      setLoading(false);
    }
  };

  // Kolom tabel progress stage
  const columns = [
    {
      title: "Stage",
      dataIndex: "progressStage",
      key: "progressStage",
    },
    {
      title: "Cumulative (%)",
      dataIndex: "cumulativePercentage",
      key: "cumulativePercentage",
      render: (value) => `${value}%`,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
  ];

  // Ambil tier unik untuk dropdown
  const uniqueTiers = Object.values(
    logicDisbursements.reduce((acc, curr) => {
      const key = curr.developerType.toLowerCase();
      if (!acc[key]) acc[key] = curr;
      return acc;
    }, {})
  );

  return (
    <Modal
      title="Edit Developer"
      open={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      confirmLoading={loading}
      okText="Simpan"
      cancelText="Batal"
      centered
      width={750}
      style={{
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="companyName"
          label="Nama Perusahaan"
          rules={[{ required: true, message: "Nama perusahaan wajib diisi" }]}
        >
          <Input placeholder="Masukkan nama perusahaan developer" />
        </Form.Item>

        <Form.Item
          name="classificationTier"
          label="Tier"
          rules={[{ required: true, message: "Silakan pilih tier" }]}
        >
          <Select
            placeholder="Pilih tier"
            allowClear
            onChange={(val) => handleTierChange(val)}
            showSearch
            optionFilterProp="children"
          >
            {uniqueTiers.map((item) => (
              <Option key={item.id} value={item.developerType}>
                {item.developerType}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {filteredStages.length > 0 && (
          <Form.Item label="Progress Detail">
            <Table
              dataSource={filteredStages}
              columns={columns}
              pagination={false}
              rowKey="id"
              size="small"
              bordered
            />
          </Form.Item>
        )}

        <Form.Item
          name="joinDate"
          label="Tanggal Bergabung"
          rules={[{ required: true, message: "Tanggal bergabung wajib diisi" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            placeholder="Pilih tanggal bergabung"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalEditDeveloper;
