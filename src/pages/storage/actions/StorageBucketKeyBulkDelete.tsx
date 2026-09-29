import type { FC } from "react";
import { useState } from "react";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import BulkDeleteButton from "components/BulkDeleteButton";
import { useToastNotification } from "@canonical/react-components";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { deleteStorageBucketKeyBulk } from "api/storage-buckets";
import { getPromiseSettledCounts } from "util/promises";
import { useCurrentProject } from "context/useCurrentProject";
import ResourceLink from "components/ResourceLink";
import { getStorageBucketURL } from "util/storageBucket";
import { useBulkDetails } from "context/useBulkDetails";

interface Props {
  keys: LxdStorageBucketKey[];
  bucket: LxdStorageBucket;
  onStart: () => void;
  onFinish: () => void;
}

const StorageBucketKeyBulkDelete: FC<Props> = ({
  keys,
  bucket,
  onStart,
  onFinish,
}) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const viewBulkDetails = useBulkDetails();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";
  const totalCount = keys.length;

  const buttonText = `删除 ${keys.length} 个密钥`;

  const handleDelete = () => {
    setLoading(true);
    onStart();
    const successMessage = (
      <>
        已成功删除存储桶{" "}
        <ResourceLink
          type="bucket"
          value={bucket.name}
          to={getStorageBucketURL(
            bucket.name,
            bucket.pool,
            project?.name ?? "",
          )}
        />{" "}
        的 {keys.length} 个密钥。
      </>
    );

    deleteStorageBucketKeyBulk(bucket, keys, projectName)
      .then((results) => {
        const { fulfilledCount, rejectedCount } =
          getPromiseSettledCounts(results);

        if (fulfilledCount === totalCount) {
          toastNotify.success(successMessage, viewBulkDetails(results));
        } else if (rejectedCount === totalCount) {
          toastNotify.failure(
            "批量删除密钥失败",
            undefined,
            <>
              <b>{totalCount}</b> 个密钥未能删除。
            </>,
            viewBulkDetails(results),
          );
        } else {
          toastNotify.failure(
            "批量删除密钥部分失败",
            undefined,
            <>
              <b>{fulfilledCount}</b> 个密钥已删除。
              <br />
              <b>{rejectedCount}</b> 个密钥未能删除。
            </>,
            viewBulkDetails(results),
          );
        }

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
        setLoading(false);
        onFinish();
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure(
          `存储桶 ${bucket.name} 的密钥批量删除失败`,
          e,
        );
      });
  };

  return (
    <BulkDeleteButton
      entities={keys}
      deletableEntities={keys}
      entityType="key"
      onDelete={handleDelete}
      disabledReason={
        totalCount === 0
          ? `您没有权限删除所选密钥`
          : undefined
      }
      confirmationButtonProps={{
        disabled: isLoading || totalCount === 0,
        loading: isLoading,
      }}
      buttonLabel={buttonText}
    />
  );
};

export default StorageBucketKeyBulkDelete;
