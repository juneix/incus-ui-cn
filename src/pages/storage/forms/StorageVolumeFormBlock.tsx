import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { powerFlex } from "util/storageOptions";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  poolDriver?: string;
}

const StorageVolumeFormBlock: FC<Props> = ({ formik, poolDriver }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "块文件系统",
          name: "block_filesystem",
          defaultValue: "",
          children: (
            <Select
              options={[
                {
                  label: "自动 (auto)",
                  value: "",
                },
                {
                  label: "btrfs",
                  value: "btrfs",
                },
                {
                  label: "ext4",
                  value: "ext4",
                },
                {
                  label: "xfs",
                  value: "xfs",
                },
              ]}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "挂载选项",
          name: "block_mount_options",
          defaultValue: "",
          children: (
            <Input
              type="text"
              help={
                <>
                  关于可用挂载选项列表，请参考{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://manpages.ubuntu.com/manpages/jammy/en/man8/mount.8.html#filesystem-independent%20mount%20options"
                  >
                    mount 手册
                  </a>
                </>
              }
            />
          ),
        }),

        ...(poolDriver === powerFlex
          ? [
              getConfigurationRow({
                formik,
                label: "置备类型",
                name: "block_type",
                defaultValue: "thin",
                children: (
                  <Select
                    options={[
                      {
                        label: "精简置备 (thin)",
                        value: "thin",
                      },
                      {
                        label: "厚置备 (thick)",
                        value: "thick",
                      },
                    ]}
                  />
                ),
              }),
            ]
          : []),
      ]}
    />
  );
};

export default StorageVolumeFormBlock;
