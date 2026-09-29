import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import type { FormikProps } from "formik/dist/types";
import { optionAllowBlock, optionAllowBlockManaged } from "util/projectOptions";
import { optionRenderer } from "util/formFields";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";

export interface DeviceUsageRestrictionFormValues {
  restricted_devices_disk?: string;
  restricted_devices_disk_paths?: string;
  restricted_devices_gpu?: string;
  restricted_devices_infiniband?: string;
  restricted_devices_nic?: string;
  restricted_devices_pci?: string;
  restricted_devices_unix_block?: string;
  restricted_devices_unix_char?: string;
  restricted_devices_unix_hotplug?: string;
  restricted_devices_usb?: string;
}

export const deviceUsageRestrictionPayload = (
  values: DeviceUsageRestrictionFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("restricted_devices_disk")]: values.restricted_devices_disk,
    [getProjectKey("restricted_devices_disk_paths")]:
      values.restricted_devices_disk_paths,
    [getProjectKey("restricted_devices_gpu")]: values.restricted_devices_gpu,
    [getProjectKey("restricted_devices_infiniband")]:
      values.restricted_devices_infiniband,
    [getProjectKey("restricted_devices_nic")]: values.restricted_devices_nic,
    [getProjectKey("restricted_devices_pci")]: values.restricted_devices_pci,
    [getProjectKey("restricted_devices_unix_block")]:
      values.restricted_devices_unix_block,
    [getProjectKey("restricted_devices_unix_char")]:
      values.restricted_devices_unix_char,
    [getProjectKey("restricted_devices_unix_hotplug")]:
      values.restricted_devices_unix_hotplug,
    [getProjectKey("restricted_devices_usb")]: values.restricted_devices_usb,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const DeviceUsageRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_devices_disk",
          label: (
            <>
              磁盘设备
              <br />
              (根磁盘除外)
            </>
          ),
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowBlockManaged),
          children: <Select options={optionAllowBlockManaged} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_disk_paths",
          label: "磁盘设备路径限制",
          defaultValue: "",
          children: <Input placeholder="输入路径" type="text" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_gpu",
          label: "GPU 设备",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_infiniband",
          label: "Infiniband 设备",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_nic",
          label: "网络设备 (NIC)",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            optionRenderer(val, optionAllowBlockManaged),
          children: <Select options={optionAllowBlockManaged} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_pci",
          label: "PCI 设备",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_unix_block",
          label: "Unix-block 块设备",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_unix_char",
          label: "Unix-char 字符设备",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_unix_hotplug",
          label: "Unix-hotplug 热插拔设备",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_devices_usb",
          label: "USB 设备",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowBlock),
          children: <Select options={optionAllowBlock} />,
        }),
      ]}
    />
  );
};

export default DeviceUsageRestrictionForm;
