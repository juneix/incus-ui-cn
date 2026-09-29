import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface BootFormValues {
  boot_autostart?: string;
  boot_autostart_delay?: string;
  boot_autostart_priority?: string;
  boot_host_shutdown_timeout?: string;
  boot_stop_priority?: string;
}

export const bootPayload = (values: InstanceAndProfileFormValues) => {
  return {
    [getInstanceField("boot_autostart")]: values.boot_autostart?.toString(),
    [getInstanceField("boot_autostart_delay")]:
      values.boot_autostart_delay?.toString(),
    [getInstanceField("boot_autostart_priority")]:
      values.boot_autostart_priority?.toString(),
    [getInstanceField("boot_host_shutdown_timeout")]:
      values.boot_host_shutdown_timeout?.toString(),
    [getInstanceField("boot_stop_priority")]:
      values.boot_stop_priority?.toString(),
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const BootForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "自动启动",
          name: "boot_autostart",
          defaultValue: "",
          readOnlyRenderer: (val) =>
            val === "-" ? "-" : optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getConfigurationRow({
          formik,
          label: "自动启动延迟",
          name: "boot_autostart_delay",
          defaultValue: "",
          children: <Input placeholder="输入数字" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "自动启动优先级",
          name: "boot_autostart_priority",
          defaultValue: "",
          children: <Input placeholder="输入数字" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "宿主机关机超时",
          name: "boot_host_shutdown_timeout",
          defaultValue: "",
          children: <Input placeholder="输入数字" type="number" />,
        }),

        getConfigurationRow({
          formik,
          label: "停止优先级",
          name: "boot_stop_priority",
          defaultValue: "",
          children: <Input placeholder="输入数字" type="number" />,
        }),
      ]}
    />
  );
};

export default BootForm;
