import type { FormikProps } from "formik";
import type { FC } from "react";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import { Input } from "@canonical/react-components";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormCephObject: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "存储桶名称前缀",
          name: "cephobject_bucket_name_prefix",
          defaultValue: "",
          children: (
            <Input type="text" placeholder="请输入存储桶名称前缀" />
          ),
        }),
        getConfigurationRow({
          formik,
          label: "集群名称",
          name: "cephobject_cluster_name",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入集群名称" />,
        }),
        getConfigurationRow({
          formik,
          label: "Ceph 用户名",
          name: "cephobject_user_name",
          defaultValue: "",
          children: <Input type="text" placeholder="请输入 Ceph 用户名" />,
        }),
      ]}
    />
  );
};

export default StoragePoolFormCephObject;
