import type { FC } from "react";
import { Link } from "react-router-dom";
import RenameHeader from "components/RenameHeader";
import type { LxdStorageBucket } from "types/storage";
import StorageBucketActions from "./actions/StorageBucketActions";

interface Props {
  bucket: LxdStorageBucket;
  project: string;
}

const StorageBucketHeader: FC<Props> = ({ bucket, project }) => {
  return (
    <RenameHeader
      name={bucket.name}
      parentItems={[
        <Link
          to={`/ui/project/${encodeURIComponent(project)}/storage/buckets`}
          key={1}
        >
          存储桶
        </Link>,
      ]}
      controls={
        bucket ? <StorageBucketActions bucket={bucket} isDetailPage /> : null
      }
      isLoaded={true}
      renameDisabledReason="存储桶不支持重命名"
    />
  );
};

export default StorageBucketHeader;
