import type { FC, ReactNode } from "react";
import { Row, Input, Select, Col } from "@canonical/react-components";
import type { FormikProps } from "formik";
import {
  zfsDriver,
  dirDriver,
  getSourceHelpForDriver,
  cephDriver,
  getStorageDriverOptions,
  powerFlex,
  pureStorage,
  cephObject,
  alletraDriver,
  isClusterWideSourceDriver,
} from "util/storageOptions";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import {
  getAlletraStoragePoolFormFields,
  getCephObjectPoolFormFields,
  getCephPoolFormFields,
  getPowerflexPoolFormFields,
  getPureStoragePoolFormFields,
  getZfsStoragePoolFormFields,
} from "util/storagePool";
import { useSettings } from "context/useSettings";
import ScrollableForm from "components/ScrollableForm";
import { ensureEditMode } from "util/instanceEdit";
import ClusteredSourceSelector from "./ClusteredSourceSelector";
import { isClusteredServer } from "util/settings";
import ClusteredDiskSizeSelector from "components/forms/ClusteredDiskSizeSelector";
import {
  isStoragePoolWithSize,
  isStoragePoolWithSource,
} from "util/storagePoolForm";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormMain: FC<Props> = ({ formik }) => {
  const { data: settings } = useSettings();

  const getFormProps = (id: "name" | "description" | "size" | "source") => {
    const labels: Record<string, string> = {
      name: "名称",
      description: "描述",
      size: "大小",
      source: "源路径",
    };
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id],
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `请输入${labels[id] ?? id}`,
    };
  };

  const isCephObjectDriver = formik.values.driver === cephObject;
  const isPowerFlexDriver = formik.values.driver === powerFlex;
  const isPureDriver = formik.values.driver === pureStorage;
  const isAlletraDriver = formik.values.driver === alletraDriver;
  const storageDriverOptions = getStorageDriverOptions(settings);
  const isClusterWideSource = isClusterWideSourceDriver(formik.values.driver);

  const hasSource =
    !isPureDriver &&
    !isPowerFlexDriver &&
    !isCephObjectDriver &&
    !isAlletraDriver;

  const sourceHelpText = formik.values.isCreating
    ? getSourceHelpForDriver(formik.values.driver)
    : "源路径不可修改";
  const nameHelpText = !formik.values.isCreating
    ? "存储池创建后不支持重命名"
    : undefined;

  const cephObjectNotice = (
    <>
      Ceph Object 驱动需要启用 Rados 网关。若使用 microcloud 或 microceph，请运行{" "}
      <code>microceph enable rgw --port 8080</code>。
    </>
  );

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <Input
            {...getFormProps("name")}
            type="text"
            label="名称"
            required
            disabled={!formik.values.isCreating}
            help={nameHelpText}
          />
          <AutoExpandingTextArea
            {...getFormProps("description")}
            label="描述"
            onChange={(e) => {
              ensureEditMode(formik);
              formik.handleChange(e);
            }}
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
          <Select
            id="driver"
            name="driver"
            help={
              !formik.values.isCreating
                ? "驱动不可修改"
                : formik.values.driver === zfsDriver
                  ? "ZFS 能提供最佳性能与可靠性"
                  : formik.values.driver === cephObject
                    ? cephObjectNotice
                    : undefined
            }
            label="驱动"
            options={storageDriverOptions}
            onChange={(target) => {
              const val = target.target.value;
              if (val !== cephDriver) {
                const cephFields = getCephPoolFormFields();
                for (const field of cephFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== cephObject) {
                const cephobjectFields = getCephObjectPoolFormFields();
                for (const field of cephobjectFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== powerFlex) {
                const powerflexFields = getPowerflexPoolFormFields();
                for (const field of powerflexFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== pureStorage) {
                const pureFields = getPureStoragePoolFormFields();
                for (const field of pureFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (val !== zfsDriver) {
                const zfsFields = getZfsStoragePoolFormFields();
                for (const field of zfsFields) {
                  formik.setFieldValue(field, undefined);
                }
                formik.setFieldValue("zfsPoolNamePerClusterMember", "");
              }
              if (val !== alletraDriver) {
                const alletraFields = getAlletraStoragePoolFormFields();
                for (const field of alletraFields) {
                  formik.setFieldValue(field, undefined);
                }
              }
              if (!isStoragePoolWithSize(val)) {
                formik.setFieldValue("size", undefined);
                formik.setFieldValue("sizePerClusterMember", undefined);
              }
              if (!isStoragePoolWithSource(val)) {
                formik.setFieldValue("source", undefined);
                formik.setFieldValue("sourcePerClusterMember", undefined);
              }
              formik.setFieldValue("driver", val);
            }}
            value={formik.values.driver}
            required
            disabled={!formik.values.isCreating}
          />
          {isStoragePoolWithSize(formik.values.driver) &&
            (isClusteredServer(settings) ? (
              <ClusteredDiskSizeSelector
                id="sizePerClusterMember"
                values={formik.values.sizePerClusterMember}
                setValue={(value) => {
                  ensureEditMode(formik);
                  formik.setFieldValue("sizePerClusterMember", value);
                }}
                helpText={
                  "留空时默认使用 20% 可用磁盘空间（介于 5GiB 与 30GiB 之间）"
                }
                disabledReason={formik.values.editRestriction}
              />
            ) : (
              <DiskSizeSelector
                label="容量大小"
                value={formik.values.size}
                help={
                  formik.values.driver === dirDriver
                    ? "不可用"
                    : "留空时默认使用 20% 可用磁盘空间（介于 5GiB 与 30GiB 之间）"
                }
                setMemoryLimit={(val?: string) => {
                  ensureEditMode(formik);
                  formik.setFieldValue("size", val);
                }}
                disabled={
                  !!formik.values.editRestriction ||
                  formik.values.driver === dirDriver
                }
                disabledReason={formik.values.editRestriction}
              />
            ))}
          {hasSource &&
            (isClusteredServer(settings) ? (
              <ClusteredSourceSelector
                formik={formik}
                helpText={sourceHelpText}
                disabledReason={formik.values.editRestriction}
                canToggleMemberSpecific={!isClusterWideSource}
              />
            ) : (
              <Input
                {...getFormProps("source")}
                type="text"
                disabled={
                  !!formik.values.editRestriction || !formik.values.isCreating
                }
                help={sourceHelpText}
                label="源路径"
                title={formik.values.editRestriction}
              />
            ))}
          {isCephObjectDriver && (
            <>
              <Input
                {...formik.getFieldProps("cephobject_radosgw_endpoint")}
                type="text"
                label="Rados 网关端点"
                placeholder="请输入 Rados 网关端点"
                help="Rados 网关进程 URL"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
            </>
          )}
          {isPowerFlexDriver && (
            <>
              <Input
                {...formik.getFieldProps("powerflex_pool")}
                type="text"
                label="PowerFlex 存储池"
                placeholder="请输入 PowerFlex 存储池"
                help="远端 PowerFlex 存储池的 ID 或名称"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("powerflex_domain")}
                type="text"
                label="保护域 (Domain)"
                placeholder="请输入保护域"
                help="PowerFlex 保护域名称。若存储池为名称则必填。"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
              />
              <Input
                {...formik.getFieldProps("powerflex_gateway")}
                type="text"
                label="网关地址"
                placeholder="请输入网关地址"
                help="PowerFlex 网关地址"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("powerflex_user_name")}
                type="text"
                label="用户名"
                placeholder="请输入用户名"
                help={
                  <>
                    PowerFlex 网关认证用户名。留空默认为 <code>admin</code>。
                  </>
                }
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
              />
              <Input
                {...formik.getFieldProps("powerflex_user_password")}
                type="password"
                label="密码"
                placeholder="请输入密码"
                help="PowerFlex 网关认证密码"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
            </>
          )}
          {isPureDriver && (
            <>
              <Input
                {...formik.getFieldProps("pure_api_token")}
                type="text"
                label="API 令牌 (Token)"
                placeholder="请输入 Pure Storage API 令牌"
                help="具有 Pure Storage 阵列管理权限的 API 令牌"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("pure_gateway")}
                type="text"
                label="API 网关"
                placeholder="请输入 Pure Storage API 网关"
                help="Pure Storage API 的访问 URL"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
            </>
          )}
          {isAlletraDriver && (
            <>
              <Input
                {...formik.getFieldProps("alletra_wsapi")}
                type="text"
                label="地址"
                placeholder="请输入 Alletra WSAPI 地址"
                help="HPE Alletra Storage UI/WSAPI 地址"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("alletra_user_name")}
                type="text"
                label="用户名"
                placeholder="请输入 Alletra 用户名"
                help="HPE Alletra 存储管理员用户名"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("alletra_user_password")}
                type="password"
                label="密码"
                placeholder="请输入 Alletra 密码"
                help="HPE Alletra 存储管理员密码"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
              <Input
                {...formik.getFieldProps("alletra_cpg")}
                type="text"
                label="通用配置组 (CPG)"
                placeholder="请输入 Alletra CPG"
                help="HPE Alletra 通用配置组（CPG）名称"
                onChange={(e) => {
                  ensureEditMode(formik);
                  formik.handleChange(e);
                }}
                required
              />
            </>
          )}
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default StoragePoolFormMain;
