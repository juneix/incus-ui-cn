import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageBucket } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucket } from "api/storage-buckets";
import { useCurrentProject } from "context/useCurrentProject";
import ResourceLabel from "components/ResourceLabel";
import { useNavigate } from "react-router-dom";

interface Props {
  bucket: LxdStorageBucket;
  classname?: string;
  isDetailPage?: boolean;
}

const DeleteStorageBucketBtn: FC<Props> = ({
  bucket,
  classname,
  isDetailPage,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeleteBucket } = useStorageBucketEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";
  const navigate = useNavigate();
  const toastNotify = useToastNotification();

  const onFinish = () => {
    navigate(`/ui/project/${project?.name}/storage/buckets`);
    toastNotify.success(
      <>
        存储桶 <ResourceLabel bold type="bucket" value={bucket.name} />{" "}
        已删除。
      </>,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteStorageBucket(bucket.name, bucket.pool, projectName)
      .then(onFinish)
      .catch((e) => {
        notify.failure("存储桶删除失败", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.storage, projectName, queryKeys.buckets],
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
            此操作将永久删除存储桶{" "}
            <ResourceLabel type="bucket" value={bucket.name} bold />。<br />
            此操作无法撤销，并可能导致数据丢失。
          </p>
        ),
        confirmButtonLabel: "删除",
        onConfirm: handleDelete,
      }}
      appearance={isDetailPage ? "default" : "base"}
      className={classname}
      shiftClickEnabled
      showShiftClickHint
      disabled={!canDeleteBucket(bucket)}
      onHoverText={
        canDeleteBucket(bucket)
          ? "删除存储桶"
          : "您没有权限删除此存储桶。"
      }
    >
      <Icon name="delete" />
      {isDetailPage && <span>删除</span>}
    </ConfirmationButton>
  );
};

export default DeleteStorageBucketBtn;
