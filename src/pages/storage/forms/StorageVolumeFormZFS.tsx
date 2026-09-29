import type { FC } from "react";
import { Select } from "@canonical/react-components";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import type { FormikProps } from "formik/dist/types";
import { getConfigurationRow } from "components/ConfigurationRow";
import { optionTrueFalse } from "util/instanceOptions";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
}

const StorageVolumeFormZFS: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "ZFS 块大小",
          name: "zfs_blocksize",
          defaultValue: "",
          children: (
            <Select
              options={[
                {
                  label: "默认",
                  value: "",
                },
                {
                  label: "512",
                  value: "512",
                },
                {
                  label: "1024",
                  value: "1024",
                },
                {
                  label: "2048",
                  value: "2048",
                },
                {
                  label: "4096",
                  value: "4096",
                },
                {
                  label: "8192",
                  value: "8192",
                },
                {
                  label: "16384",
                  value: "16384",
                },
              ]}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "ZFS 块模式",
          name: "zfs_block_mode",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "ZFS 权限委托",
          name: "zfs_delegate",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "删除卷时自动删除快照",
          name: "zfs_remove_snapshots",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "使用 refquota 配额",
          name: "zfs_use_refquota",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),

        getConfigurationRow({
          formik,
          label: "ZFS 预留空间",
          name: "zfs_reserve_space",
          defaultValue: "",
          children: <Select options={optionTrueFalse} />,
        }),
      ]}
    />
  );
};

export default StorageVolumeFormZFS;
