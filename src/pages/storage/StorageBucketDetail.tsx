import type { FC } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { useBucket } from "context/useBuckets";
import StorageBucketHeader from "./StorageBucketHeader";
import StorageBucketKeys from "./StorageBucketKeys";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateStorageBucketKeyPanel from "./panels/CreateStorageBucketKeyPanel";
import EditStorageBucketPanel from "./panels/EditStorageBucketPanel";
import EditStorageBucketKeyPanel from "./panels/EditStorageBucketKeyPanel";

const StorageBucketDetail: FC = () => {
  const notify = useNotify();
  const {
    pool,
    project,
    member,
    bucket: bucketName,
  } = useParams<{
    bucket: string;
    pool: string;
    project: string;
    member?: string;
  }>();

  if (!pool) {
    return <>缺少存储池参数</>;
  }
  if (!project) {
    return <>缺少项目参数</>;
  }
  if (!bucketName) {
    return <>缺少存储桶参数</>;
  }
  const {
    data: bucket,
    error,
    isLoading,
  } = useBucket(bucketName, pool, project, member);

  const panelParams = usePanelParams();

  if (error) {
    notify.failure("加载存储桶失败", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  } else if (!bucket) {
    return <>加载存储桶失败</>;
  }

  return (
    <>
      <CustomLayout
        header={<StorageBucketHeader bucket={bucket} project={project} />}
        contentClassName="detail-page u-no-padding--bottom"
      >
        <Row>
          <StorageBucketKeys bucket={bucket} />
        </Row>
      </CustomLayout>

      {panelParams.panel === panels.editStorageBucket && (
        <EditStorageBucketPanel bucket={bucket} />
      )}
      {panelParams.panel === panels.createStorageBucketKey && (
        <CreateStorageBucketKeyPanel bucket={bucket} />
      )}
      {panelParams.panel === panels.editStorageBucketKey && (
        <EditStorageBucketKeyPanel bucket={bucket} />
      )}
    </>
  );
};

export default StorageBucketDetail;
