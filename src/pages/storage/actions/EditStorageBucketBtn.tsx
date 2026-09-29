import type { FC } from "react";
import type { LxdStorageBucket } from "types/storage";
import { Button, Icon } from "@canonical/react-components";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import usePanelParams from "util/usePanelParams";

interface Props {
  bucket: LxdStorageBucket;
  classname?: string;
  isDetailPage?: boolean;
}

const EditStorageBucketBtn: FC<Props> = ({
  bucket,
  classname,
  isDetailPage,
}) => {
  const panelParams = usePanelParams();
  const { canEditBucket } = useStorageBucketEntitlements();

  return (
    <Button
      key={`${bucket.name}-edit`}
      className={classname}
      appearance={isDetailPage ? "default" : "base"}
      hasIcon
      onClick={() => {
        panelParams.openEditStorageBucket(
          bucket.name,
          bucket.pool,
          bucket.location,
        );
      }}
      title={
        canEditBucket(bucket)
          ? "编辑存储桶"
          : "您没有权限编辑此存储桶"
      }
    >
      <Icon name="edit" />
      {isDetailPage && <span>配置</span>}
    </Button>
  );
};

export default EditStorageBucketBtn;
