import type { FC } from "react";
import { Input, Notification } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";
import DocLink from "components/DocLink";
import { useCurrentProject } from "context/useCurrentProject";
import { isSnapshotsDisabled } from "util/snapshots";
import SnapshotDisabledWarningLink from "components/SnapshotDisabledWarningLink";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormSnapshots: FC<Props> = ({ formik }) => {
  const { project } = useCurrentProject();
  const snapshotDisabled = isSnapshotsDisabled(project);

  return (
    <>
      {snapshotDisabled && (
        <Notification
          severity="caution"
          title={`项目 ${project?.name} 中的存储卷已禁用快照创建`}
        >
          <SnapshotDisabledWarningLink project={project} />
        </Notification>
      )}
      <ScrollableConfigurationTable
        rows={[
          getConfigurationRow({
            formik,
            label: "快照命名模式",
            name: "snapshots_pattern",
            defaultValue: "",
            children: (
              <Input
                placeholder="请输入命名模式"
                help={
                  <>
                    表示快照名称的 Pongo2 模板字符串（用于定时计划快照与未命名快照），详见{" "}
                    <DocLink docPath="/reference/instance_options/#instance-options-snapshots-names">
                      自动快照命名
                    </DocLink>
                  </>
                }
                type="text"
              />
            ),
          }),

          getConfigurationRow({
            formik,
            label: "过期时间",
            name: "snapshots_expiry",
            defaultValue: "",
            children: (
              <Input
                placeholder="请输入过期表达式"
                type="text"
                help="格式形如：1M（分钟）2H（小时）3d（天）4w（周）5m（月）6y（年）"
              />
            ),
          }),

          getConfigurationRow({
            formik,
            label: "计划周期",
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

export default StorageVolumeFormSnapshots;
