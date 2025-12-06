import { Modal, Form, Input, Select, DatePicker, message, Table } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { createDeveloper, getAllLogicDisbursement } from "../../service/api/DeveloperApi";

const { Option } = Select;

const ModalTambahDeveloper = ({ visible, title, setVisible, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [logicDisbursements, setLogicDisbursements] = useState([]);
  const [filteredStages, setFilteredStages] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchLogicDisbursement();
      form.setFieldValue("joinDate", dayjs());
    } else {
      form.resetFields();
      setFilteredStages([]);
    }
  }, [visible]);

  const fetchLogicDisbursement = async () => {
    try {
      const res = await getAllLogicDisbursement();
      const data = res.data || res;
      setLogicDisbursements(data);
    } catch (error) {
      console.error(error);
      message.error("Gagal memuat data logic disbursement");
    }
  };

  const handleTierChange = (tierValue) => {
    if (!tierValue) {
      setFilteredStages([]);
      return;
    }

    const stages = logicDisbursements.filter(
      (item) => item.developerType.toLowerCase() === tierValue.toLowerCase()
    );

    const stageOrder = ["Started", "Foundation", "Roofing", "Finishing"];
    stages.sort(
      (a, b) =>
        stageOrder.indexOf(a.progressStage) - stageOrder.indexOf(b.progressStage)
    );

    setFilteredStages(stages);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        companyName: values.companyName,
        classificationTier: values.classificationTier,
        joinDate: values.joinDate.format("YYYY-MM-DD"),
      };

      setLoading(true);
      await createDeveloper(payload);
      message.success("Developer berhasil ditambahkan!");
      setVisible(false);
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      message.error("Gagal menambahkan developer!");
    } finally {
      setLoading(false);
    }
  };

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
      render: (v) => `${v}%`,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
  ];

  const uniqueTiers = Object.values(
    logicDisbursements.reduce((acc, curr) => {
      const key = curr.developerType.toLowerCase();
      if (!acc[key]) acc[key] = curr;
      return acc;
    }, {})
  );

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      confirmLoading={loading}
      okText="Simpan"
      cancelText="Batal"
      centered
      width={750}
      Style={{
        maxHeight: "70vh",
        overflowY: "auto",
        paddingRight: "12px",
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
            onChange={handleTierChange}
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
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalTambahDeveloper;
