import type { FC, ReactNode } from "react";
import { Input, Notification, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";
import { useCurrentProject } from "context/useCurrentProject";
import { isSnapshotsDisabled } from "util/snapshots";
import SnapshotDisabledWarningLink from "components/SnapshotDisabledWarningLink";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("snapshots_pattern")]: values.snapshots_pattern,
    [getInstanceField("snapshots_schedule_stopped")]:
      values.snapshots_schedule_stopped,
    [getInstanceField("snapshots_schedule")]: values.snapshots_schedule,
    [getInstanceField("snapshots_expiry")]: values.snapshots_expiry,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  children?: ReactNode;
}

const InstanceSnapshotsForm: FC<Props> = ({ formik }) => {
  const { project } = useCurrentProject();
  const snapshotDisabled = isSnapshotsDisabled(project);

  return (
    <>
      {snapshotDisabled && (
        <Notification
          severity="caution"
          title={`项目 ${project?.name} 中已禁用实例的快照创建`}
        >
          <SnapshotDisabledWarningLink project={project} />
        </Notification>
      )}
      <ScrollableConfigurationTable
        rows={[
          getConfigurationRow({
            formik,
            label: "快照名称格式",
            name: "snapshots_pattern",
            defaultValue: "",
            children: <Input placeholder="输入名称格式 (如 snap-%d)" type="text" />,
          }),

          getConfigurationRow({
            formik,
            label: "过期时间",
            name: "snapshots_expiry",
            defaultValue: "",
            children: (
              <Input placeholder="输入过期表达式 (如 30d)" type="text" />
            ),
          }),

          getConfigurationRow({
            formik,
            label: "对已停止的实例创建快照",
            name: "snapshots_schedule_stopped",
            defaultValue: "",
            readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
            children: <Select options={optionYesNo} />,
          }),

          getConfigurationRow({
            formik,
            label: "计划表达式",
            name: "snapshots_schedule",
            defaultValue: "",
            children: (
              <SnapshotScheduleInput
                value={formik.values.snapshots_schedule}
                setValue={(val) =>
                  void formik.setFieldValue("snapshots_schedule", val)
                }
              />
            ),
          }),
        ]}
      />
    </>
  );
};

export default InstanceSnapshotsForm;
