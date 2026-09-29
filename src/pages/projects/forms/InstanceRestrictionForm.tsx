import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import type { FormikProps } from "formik/dist/types";
import {
  optionAllowBlock,
  optionAllowIsolatedUnprivileged,
} from "util/projectOptions";
import { optionRenderer } from "util/formFields";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";

export interface InstanceRestrictionFormValues {
  restricted_virtual_machines_low_level?: string;
  restricted_containers_low_level?: string;
  restricted_containers_nesting?: string;
  restricted_containers_privilege?: string;
  restricted_container_interception?: string;
  restrict_backups?: string;
  restrict_snapshots?: string;
  restricted_idmap_uid?: string;
  restricted_idmap_gid?: string;
}

export const instanceRestrictionPayload = (
  values: ProjectFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("restricted_virtual_machines_low_level")]:
      values.restricted_virtual_machines_low_level,
    [getProjectKey("restricted_containers_low_level")]:
      values.restricted_containers_low_level,
    [getProjectKey("restricted_containers_nesting")]:
      values.restricted_containers_nesting,
    [getProjectKey("restricted_containers_privilege")]:
      values.restricted_containers_privilege,
    [getProjectKey("restricted_container_interception")]:
      values.restricted_container_interception,
    [getProjectKey("restrict_backups")]: values.restrict_backups,
    [getProjectKey("restrict_snapshots")]: values.restrict_snapshots,
    [getProjectKey("restricted_idmap_uid")]: values.restricted_idmap_uid,
    [getProjectKey("restricted_idmap_gid")]: values.restricted_idmap_gid,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const InstanceRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_virtual_machines_low_level",
          label: "虚拟机底层操作限制",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_containers_low_level",
          label: "容器底层操作限制",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_containers_nesting",
          label: "容器嵌套限制",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_containers_privilege",
          label: "容器特权限制",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowIsolatedUnprivileged),
          children: <Select options={optionAllowIsolatedUnprivileged} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_container_interception",
          label: "容器系统调用拦截限制",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restrict_backups",
          label: "备份创建限制",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restrict_snapshots",
          label: "快照创建限制",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_idmap_uid",
          label: "ID 映射 UID 限制",
          defaultValue: "",
          children: <Input placeholder="输入 UID 范围" type="text" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_idmap_gid",
          label: "ID 映射 GID 限制",
          defaultValue: "",
          children: <Input placeholder="输入 GID 范围" type="text" />,
        }),
      ]}
    />
  );
};

export default InstanceRestrictionForm;
