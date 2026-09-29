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

const StoragePoolFormCeph: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "集群名称",
          name: "ceph_cluster_name",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入集群名称" />,
        }),
        getConfigurationRow({
          formik,
          label: "PG 数量 (Placement groups)",
          name: "ceph_osd_pg_num",
          defaultValue: "",
          children: (
            <Input
              type="number"
              placeholder="请输入 PG 数量"
            />
          ),
        }),
        getConfigurationRow({
          formik,
          label: "RBD 克隆副本",
          name: "ceph_rbd_clone_copy",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "RBD 磁盘用量 (du)",
          name: "ceph_rbd_du",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
        getConfigurationRow({
          formik,
          label: "Ceph 用户名",
          name: "ceph_user_name",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入 Ceph 用户名" />,
        }),
        getConfigurationRow({
          formik,
          label: "RBD 特性",
          name: "ceph_rbd_features",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入 RBD 特性" />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormCeph;
