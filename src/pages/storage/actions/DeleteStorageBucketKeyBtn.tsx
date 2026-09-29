import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucketKey } from "api/storage-buckets";
import { useCurrentProject } from "context/useCurrentProject";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  bucket: LxdStorageBucket;
  bucketKey: LxdStorageBucketKey;
}

const DeleteStorageBucketKeyBtn: FC<Props> = ({ bucket, bucketKey }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canEditBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";
  const toastNotify = useToastNotification();

  const onFinish = () => {
    toastNotify.success(
      <>
        存储桶 <ResourceLabel bold type="bucket" value={bucket.name} /> 的密钥{" "}
        <ResourceLabel bold type="bucket-key" value={bucketKey.name} /> 已删除。
      </>,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteStorageBucketKey(
      bucket.name,
      bucketKey.name,
      bucket.pool,
      projectName,
    )
      .then(onFinish)
      .catch((e) => {
        notify.failure("存储桶密钥删除失败", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [
            queryKeys.storage,
            bucket.pool,
            project?.name ?? "",
            queryKeys.buckets,
            bucket.name,
            queryKeys.keys,
          ],
        });
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "确认删除",
        children: (
          <p>
            此操作将永久删除密钥{" "}
            <ResourceLabel type="bucket-key" value={bucketKey.name} bold />。
            <br />
            此操作无法撤销，并可能导致数据无法访问。
          </p>
        ),
        confirmButtonLabel: "删除",
        onConfirm: handleDelete,
      }}
      appearance="base"
      className="has-icon"
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditBucket(bucket)}
      onHoverText={
        canEditBucket(bucket)
          ? "删除密钥"
          : "您没有权限删除此密钥。"
      }
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteStorageBucketKeyBtn;
