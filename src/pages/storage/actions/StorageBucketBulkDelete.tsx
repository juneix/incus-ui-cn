import type { FC } from "react";
import { useState } from "react";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useToastNotification } from "@canonical/react-components";
import type { LxdStorageBucket } from "types/storage";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import { deleteStorageBucketBulk } from "api/storage-buckets";
import { getPromiseSettledCounts } from "util/promises";
import { useCurrentProject } from "context/useCurrentProject";
import { useBulkDetails } from "context/useBulkDetails";

interface Props {
  buckets: LxdStorageBucket[];
  onStart: () => void;
  onFinish: () => void;
}

const StorageBucketBulkDelete: FC<Props> = ({ buckets, onStart, onFinish }) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canDeleteBucket } = useStorageBucketEntitlements();
  const viewBulkDetails = useBulkDetails();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";

  const deleteableBuckets = buckets.filter((bucket) => canDeleteBucket(bucket));
  const totalCount = buckets.length;
  const deleteCount = deleteableBuckets.length;

  const buttonText = `删除 ${buckets.length} 个存储桶`;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    const successMessage = `成功删除 ${deleteableBuckets.length} 个存储桶`;

    deleteStorageBucketBulk(deleteableBuckets, projectName)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);

        if (fulfilledCount === deleteCount) {
          toastNotify.success(successMessage, viewBulkDetails(results));
        } else if (rejectedCount === deleteCount) {
          toastNotify.failure(
            "存储桶批量删除失败",
            undefined,
            <>
              <b>{deleteCount}</b> 个存储桶未能删除。
            </>,
            viewBulkDetails(results),
          );
        } else {
          toastNotify.failure(
            "存储桶批量删除部分失败",
            undefined,
            <>
              <b>{fulfilledCount}</b> 个存储桶已删除。
              <br />
              <b>{rejectedCount}</b> 个存储桶未能删除。
            </>,
            viewBulkDetails(results),
          );
        }

        queryClient.invalidateQueries({
          queryKey: [queryKeys.storage, projectName, queryKeys.buckets],
        });
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("存储桶批量删除失败", e);
      });
  };

  const getBulkDeleteBreakdown = () => {
    if (deleteCount === totalCount) {
      return undefined;
    }

    const restrictedCount = totalCount - deleteCount;
    return [
      `将删除 ${deleteCount} 个存储桶。`,
      `您没有权限删除的 ${restrictedCount} 个存储桶将被忽略。`,
    ];
  };

  return (
    <BulkDeleteButton
      entities={buckets}
      deletableEntities={deleteableBuckets}
      entityType="bucket"
      onDelete={handleDelete}
      disabledReason={
        deleteCount === 0
          ? `您没有权限删除所选存储桶`
          : undefined
      }
      confirmationButtonProps={{
        disabled: isLoading || deleteCount === 0,
        loading: isLoading,
      }}
      buttonLabel={buttonText}
      bulkDeleteBreakdown={getBulkDeleteBreakdown()}
      className="u-no-margin--bottom"
    />
  );
};

export default StorageBucketBulkDelete;
