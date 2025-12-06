import React from "react";
import { Steps, Card } from "antd";

const DisbursementSteps = ({ disbursementTerms = [], currentStep, onStepChange }) => {
  const mapStatusToStep = (status) => {
    switch (status) {
      case "Disbursed":
        return "finish";
      case "Ready for Disbursement":
        return "process";
      case "Need Verification":
        return "wait";
      case "Rejected":
        return "error";
      default:
        return "wait";
    }
  };

  const ordered = [...disbursementTerms].sort((a, b) => a.id - b.id);

  return (
    ordered.length > 0 && (
      <Card
        title="Tracking Termin Pendanaan"
        style={{ borderRadius: 12, marginBottom: 20 }}
      >
        <Steps
          current={currentStep}
          onChange={onStepChange}
          responsive
          items={ordered.map((term, index) => ({
            key: term.id,
            title: term.progressStage,
            description: (
              <>
                <div>
                  <strong>Persentase:</strong> {term.physicalPercentage ?? 0}%
                </div>
                <div>
                  <strong>Nilai Cair:</strong>{" "}
                  {term.disbursementValue
                    ? `Rp ${term.disbursementValue.toLocaleString("id-ID")}`
                    : "-"}
                </div>
              </>
            ),
            status: mapStatusToStep(term.disbursementStatus),
            disabled:
              index > 0 && ordered[index - 1].disbursementStatus !== "Disbursed",
          }))}
        />
      </Card>
    )
  );
};

export default DisbursementSteps;
