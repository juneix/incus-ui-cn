import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import ClusteredZfsNameSelector from "./ClusteredZfsNameSelector";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormZFS: FC<Props> = ({ formik }) => {
  const isClustered = useIsClustered();

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "ZFS 池名称",
          name: "zfs_pool_name",
          defaultValue: "",
          children: isClustered ? (
            <ClusteredZfsNameSelector
              formik={formik}
              placeholder="请输入 ZFS 池名称"
            />
          ) : (
            <Input type="text" placeholder="请输入 ZFS 池名称" />
          ),
          readOnlyRenderer: (value) =>
            isClustered && value !== "-" ? (
              <ClusteredZfsNameSelector
                formik={formik}
                placeholder="请输入 ZFS 池名称"
              />
            ) : (
              <>{value}</>
            ),
          disabled: !formik.values.isCreating || formik.values.readOnly,
          disabledReason: "ZFS 池名称创建后无法修改",
        }),
        getConfigurationRow({
          formik,
          label: "克隆副本",
          name: "zfs_clone_copy",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "导出",
          name: "zfs_export",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormZFS;
