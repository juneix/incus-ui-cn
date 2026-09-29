import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input, Select } from "@canonical/react-components";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormCephFS: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "集群名称",
          name: "cephfs_cluster_name",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入集群名称" />,
        }),
        getConfigurationRow({
          formik,
          label: "自动创建缺失项",
          name: "cephfs_create_missing",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "文件系统缓存",
          name: "cephfs_fscache",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "PG 数量 (Placement groups)",
          name: "cephfs_osd_pg_num",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入数量" />,
        }),
        getConfigurationRow({
          formik,
          label: "路径",
          name: "cephfs_path",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入路径" />,
        }),
        getConfigurationRow({
          formik,
          label: "Ceph 用户名",
          name: "cephfs_user_name",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入 Ceph 用户名" />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormCephFS;
