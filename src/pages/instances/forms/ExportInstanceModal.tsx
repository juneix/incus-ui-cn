import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useFormik } from "formik";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  Notification,
  Select,
  useToastNotification,
} from "@canonical/react-components";
import { createInstanceBackup } from "api/instances";
import { useEventQueue } from "context/eventQueue";
import InstanceLinkChip from "../InstanceLinkChip";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useSettings } from "context/useSettings";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { isDiskDevice } from "util/devices";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  instance: LxdInstance;
  close: () => void;
}

export interface LxdInstanceExport {
  compression: "gzip" | "none";
  exportVersion: string;
  expirationHours: number;
  instanceOnly: boolean;
  optimizedStorage: boolean;
}

const ExportInstanceModal: FC<Props> = ({ instance, close }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const instanceLink = <InstanceLinkChip instance={instance} />;
  const { hasBackupMetadataVersion } = useSupportedFeatures();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const backupMetadataVersionRange =
    settings?.environment?.backup_metadata_version_range ?? [];

  const startDownload = (backupName: string) => {
    const url = `/1.0/instances/${encodeURIComponent(instance.name)}/backups/${encodeURIComponent(backupName)}/export?project=${encodeURIComponent(instance.project)}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = backupName;
    a.click();
    window.URL.revokeObjectURL(url);

    toastNotify.success(
      <>
        Instance {instanceLink} download started:
        <br />
        <a href={url}>{backupName}</a>
      </>,
    );
  };

  const getNowInHours = (hours: number) => {
    const result = new Date();
    result.setHours(result.getHours() + hours);
    return result;
  };

  const exportInstance = (values: LxdInstanceExport) => {
    const currentTime = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .split(".")[0];
    const backupName = `${instance.name}-${currentTime}.tar${values.compression === "gzip" ? ".gz" : ""}`;

    const payload = JSON.stringify({
      name: backupName,
      expires_at: getNowInHours(values.expirationHours).toISOString(),
      compression_algorithm: values.compression,
      instance_only: values.instanceOnly,
      optimized_storage: values.optimizedStorage,
      version: hasBackupMetadataVersion
        ? Number(values.exportVersion)
        : undefined,
    });

    createInstanceBackup(instance.name, instance.project, payload)
      .then((operation) => {
        toastNotify.info(
          <>
            Backing up instance {instanceLink}.<br />
            Download will start, when the export is ready.
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          () => {
            startDownload(backupName);
          },
          (msg) =>
            toastNotify.failure(
              `Could not download instance ${instance.name}`,
              new Error(msg),
              instanceLink,
            ),
        );
      })
      .catch((e) =>
        toastNotify.failure(
          `Could not download instance ${instance.name}`,
          e,
          instanceLink,
        ),
      )
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.operations] });
        close();
      });
  };

  const formik = useFormik<LxdInstanceExport>({
    initialValues: {
      compression: "gzip",
      exportVersion: "2",
      expirationHours: 6,
      instanceOnly: false,
      optimizedStorage: true,
    },
    onSubmit: (values) => {
      exportInstance(values);
    },
  });

  const customDiskDevices = Object.values(instance?.expanded_devices ?? {})
    .filter(isDiskDevice)
    .filter((device) => device.path !== "/"); // ignore root disk device
  const hasCustomDisks = customDiskDevices.length > 0;

  return (
    <Modal
      close={close}
      className="export-instance-modal"
      title="导出实例"
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={close}
          >
            取消
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            onClick={() => void formik.submitForm()}
          >
            导出实例
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        {hasCustomDisks && (
          <Notification
            severity="information"
            title="自定义磁盘将被忽略"
          >
            此实例包含 {customDiskDevices.length} 个自定义磁盘，在导出时将被忽略。
          </Notification>
        )}
        <Select
          {...formik.getFieldProps("compression")}
          id="project"
          label="压缩方式"
          help="不压缩速度更快，但生成文件较大"
          options={[
            { value: "gzip", label: "Gzip" },
            { value: "none", label: "不压缩" },
          ]}
        />
        <Select
          {...formik.getFieldProps("expirationHours")}
          id="project"
          label="过期时间"
          help="备份在服务器上保留的时长"
          options={[
            { value: 1, label: "1 小时" },
            { value: 6, label: "6 小时" },
            { value: 12, label: "12 小时" },
            { value: 24, label: "1 天" },
            { value: 72, label: "3 天" },
            { value: 168, label: "7 天" },
          ]}
        />
        {hasBackupMetadataVersion && (
          <Select
            {...formik.getFieldProps("exportVersion")}
            id="exportVersion"
            label="导出格式版本"
            help="较低版本允许在较旧的 Incus/LXD 版本上导入"
            options={backupMetadataVersionRange.map((version) => ({
              value: version.toString(),
              label: version.toString(),
            }))}
          />
        )}
        <Input
          {...formik.getFieldProps("optimizedStorage")}
          type="checkbox"
          label="使用存储驱动优化的格式"
          help="仅能在相同类型的存储池上恢复"
          checked={formik.values.optimizedStorage}
        />
        <Input
          {...formik.getFieldProps("instanceOnly")}
          type="checkbox"
          label="仅导出实例（不含快照）"
          error={
            formik.touched.instanceOnly ? formik.errors.instanceOnly : null
          }
          checked={formik.values.instanceOnly}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default ExportInstanceModal;
