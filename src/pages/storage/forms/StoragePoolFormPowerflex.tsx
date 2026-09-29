import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionNvmeSdc, optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormPowerflex: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "克隆副本",
          name: "powerflex_clone_copy",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "SDT (存储数据目标)",
          name: "powerflex_sdt",
          defaultValue: "",
          children: <Input type="text" />,
        }),
        getConfigurationRow({
          formik,
          label: "验证网关证书",
          name: "powerflex_gateway_verify",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "模式",
          name: "powerflex_mode",
          defaultValue: "",
          children: <Select options={optionNvmeSdc} />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormPowerflex;
