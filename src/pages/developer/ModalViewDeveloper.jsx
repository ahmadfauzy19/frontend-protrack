import { Modal, Descriptions, Table } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getDeveloperById, getAllLogicDisbursement } from "../../service/api/DeveloperApi";

const ModalViewDeveloper = ({ visible, setVisible, developerId }) => {
  const [loading, setLoading] = useState(false);
  const [developer, setDeveloper] = useState(null);
  const [filteredStages, setFilteredStages] = useState([]);

  useEffect(() => {
    if (visible && developerId) {
      fetchData();
    }
  }, [visible, developerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devRes, logicRes] = await Promise.all([
        getDeveloperById(developerId),
        getAllLogicDisbursement(),
      ]);

      const devData = devRes.data ?? devRes;
      const logicData = logicRes.data || logicRes;

      setDeveloper(devData);

      // Filter sesuai tier developer
      if (devData.classificationTier) {
        const stages = logicData.filter(
          (item) =>
            item.developerType.toLowerCase() ===
            devData.classificationTier.toLowerCase()
        );

        const stageOrder = ["Started", "Foundation", "Roofing", "Finishing"];
        stages.sort(
          (a, b) =>
            stageOrder.indexOf(a.progressStage) -
            stageOrder.indexOf(b.progressStage)
        );

        setFilteredStages(stages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Stage", dataIndex: "progressStage", key: "progressStage" },
    {
      title: "Cumulative (%)",
      dataIndex: "cumulativePercentage",
      key: "cumulativePercentage",
      render: (v) => `${v}%`,
    },
    { title: "Notes", dataIndex: "notes", key: "notes" },
  ];

  return (
    <Modal
      title="Detail Developer"
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      centered
      width={750}
      Style={{
        maxHeight: "70vh",
        overflowY: "auto",
        paddingRight: "12px",
      }}
    >
      {developer && (
        <>
          <Descriptions bordered size="middle" column={1}>
            <Descriptions.Item label="Nama Perusahaan">
              {developer.companyName}
            </Descriptions.Item>
            <Descriptions.Item label="Tier">
              {developer.classificationTier}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Bergabung">
              {developer.joinDate
                ? dayjs(developer.joinDate).format("DD MMMM YYYY")
                : "-"}
            </Descriptions.Item>
          </Descriptions>

          {filteredStages.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>Progress Detail</h3>
              <Table
                dataSource={filteredStages}
                columns={columns}
                pagination={false}
                rowKey="id"
                size="small"
                bordered
              />
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default ModalViewDeveloper;
