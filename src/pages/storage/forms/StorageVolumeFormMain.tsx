import type { FC } from "react";
import { Col, Input, Label, Row, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { getFormProps } from "pages/storage/forms/StorageVolumeForm";
import ConfigurationTable from "components/ConfigurationTable";
import { getConfigurationRow } from "components/ConfigurationRow";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { optionTrueFalse } from "util/instanceOptions";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import { hasMemberLocalVolumes } from "util/hasMemberLocalVolumes";
import type { LxdStoragePool } from "types/storage";
import type { LxdSettings } from "types/server";
import type { LxdClusterMember } from "types/cluster";
import DiskSizeQuotaLimitation from "components/forms/DiskSizeQuotaLimitation";

interface Props {
  formik: FormikProps<StorageVolumeFormValues>;
  poolError?: string;
  clusterMembers?: LxdClusterMember[];
  pools?: LxdStoragePool[];
  settings?: LxdSettings;
  showClusterMember: boolean;
  project: string;
}

const StorageVolumeFormMain: FC<Props> = ({
  formik,
  poolError,
  clusterMembers = [],
  pools = [],
  settings,
  showClusterMember,
  project,
}) => {
  const poolDriver = pools.find(
    (item) => item.name === formik.values.pool,
  )?.driver;

  const setMember = formik.values.isCreating
    ? (member: string) => void formik.setFieldValue("clusterMember", member)
    : undefined;

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Label
            forId="storage-pool-selector-volume"
            required={formik.values.isCreating}
          >
            所属存储池
          </Label>
          <StoragePoolSelector
            value={formik.values.pool}
            setValue={(pool) => {
              void formik.setFieldValue("pool", pool);
              if (
                hasMemberLocalVolumes(pool, pools, settings) &&
                clusterMembers.length > 0
              ) {
                formik.setFieldValue(
                  "clusterMember",
                  clusterMembers[0].server_name,
                );
              } else {
                formik.setFieldValue("clusterMember", undefined);
              }
            }}
            selectProps={{
              id: "storage-pool-selector-volume",
              disabled: !formik.values.isCreating,
              error: poolError,
              help: formik.values.isCreating
                ? undefined
                : "如需移动存储卷到其他存储池，请使用顶部的迁移按钮。",
            }}
            project={project}
          />
          {formik.values.clusterMember !== undefined &&
            formik.values.clusterMember !== "none" && (
              <Select
                id="clusterMember"
                label="集群成员"
                onChange={(e) => {
                  formik.setFieldValue("clusterMember", e.target.value);
                }}
                value={formik.values.clusterMember}
                options={clusterMembers.map((member) => {
                  return {
                    label: member.server_name,
                    value: member.server_name,
                  };
                })}
                disabled={!formik.values.isCreating}
                required={formik.values.isCreating}
                help={
                  formik.values.isCreating
                    ? undefined
                    : "创建后无法更改所属集群成员。"
                }
              />
            )}
          <Input
            {...getFormProps(formik, "name")}
            type="text"
            label="名称"
            disabled={!formik.values.isCreating}
            required={formik.values.isCreating}
            help={
              formik.values.isCreating
                ? undefined
                : "点击顶部的名称可重命名此存储卷。"
            }
          />
          <DiskSizeSelector
            label="容量大小"
            value={formik.values.size}
            help={
              (
                <>
                  <DiskSizeQuotaLimitation driver={poolDriver} />
                  {formik.values.volumeType === "custom"
                    ? "存储卷容量限制。留空表示在存储池内不设容量上限。"
                    : "非自定义存储卷的容量不可修改。"}
                </>
              ) as unknown as string
            }
            setMemoryLimit={(val?: string) => {
              ensureEditMode(formik);
              formik.setFieldValue("size", val);
            }}
            disabled={
              !!formik.values.editRestriction ||
              formik.values.volumeType !== "custom"
            }
          />
          <Select
            {...getFormProps(formik, "content_type")}
            options={[
              {
                label: "文件系统 (filesystem)",
                value: "filesystem",
              },
              {
                label: "块设备 (block)",
                value: "block",
              },
            ]}
            label="内容类型"
            help={
              formik.values.isCreating
                ? "文件系统类型可直接挂载并写入文件；块设备类型只能挂载给虚拟机，作为裸块设备使用。"
                : "创建后内容类型不可更改。"
            }
            onChange={(e) => {
              if (e.target.value === "block") {
                formik.setFieldValue("block_filesystem", undefined);
                formik.setFieldValue("block_mount_options", undefined);
                formik.setFieldValue("block_type", undefined);
                formik.setFieldValue("security_shifted", undefined);
                formik.setFieldValue("security_unmapped", undefined);
              }
              formik.setFieldValue("content_type", e.target.value);
            }}
            disabled={!formik.values.isCreating}
          />
          {showClusterMember && (
            <ClusterMemberSelector
              {...getFormProps(formik, "clusterMember")}
              id="clusterMember"
              label="集群成员"
              value={formik.values.clusterMember}
              setMember={setMember}
              disabled={!formik.values.isCreating}
            />
          )}
        </Col>
      </Row>
      {formik.values.content_type === "filesystem" && (
        <ConfigurationTable
          rows={[
            getConfigurationRow({
              formik,
              label: "安全 uid/gid 映射转换 (shifted)",
              name: "security_shifted",
              defaultValue: "",
              disabled: formik.values.security_unmapped === "true",
              disabledReason:
                "当启用 security_unmapped 时无法修改此设置",
              children: <Select options={optionTrueFalse} />,
            }),

            getConfigurationRow({
              formik,
              label: "禁用安全 uid/gid 映射 (unmapped)",
              name: "security_unmapped",
              defaultValue: "",
              disabled: formik.values.security_shifted === "true",
              disabledReason:
                "当启用 security_shifted 时无法修改此设置",
              children: <Select options={optionTrueFalse} />,
            }),
          ]}
        />
      )}
    </ScrollableForm>
  );
};

export default StorageVolumeFormMain;
