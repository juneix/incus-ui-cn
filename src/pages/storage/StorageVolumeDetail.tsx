import type { FC } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import StorageVolumeHeader from "pages/storage/StorageVolumeHeader";
import StorageVolumeOverview from "pages/storage/StorageVolumeOverview";
import EditStorageVolume from "pages/storage/forms/EditStorageVolume";
import TabLinks from "components/TabLinks";
import StorageVolumeSnapshots from "./StorageVolumeSnapshots";
import { useStorageVolume } from "context/useVolumes";
import { linkForVolumeDetail } from "util/storageVolume";

const tabs = [
  { label: "概览", path: "overview" },
  { label: "配置", path: "configuration" },
  { label: "快照", path: "snapshots" },
];

const StorageVolumeDetail: FC = () => {
  const notify = useNotify();
  const {
    pool,
    project,
    member,
    activeTab,
    type,
    volume: volumeName,
  } = useParams<{
    pool: string;
    project: string;
    member?: string;
    activeTab?: string;
    type: string;
    volume: string;
  }>();

  if (!pool) {
    return <>缺少存储池参数</>;
  }
  if (!project) {
    return <>缺少项目参数</>;
  }
  if (!type) {
    return <>缺少类型参数</>;
  }
  if (!volumeName) {
    return <>缺少存储卷名称</>;
  }

  const {
    data: volume,
    error,
    isLoading,
  } = useStorageVolume(pool, project, type, volumeName, member);

  if (error) {
    notify.failure("加载存储卷失败", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  } else if (!volume) {
    return <>加载存储卷失败</>;
  }

  return (
    <CustomLayout
      header={<StorageVolumeHeader volume={volume} project={project} />}
      contentClassName="detail-page storage-volume-form u-no-padding--bottom"
    >
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={linkForVolumeDetail(volume)}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="概览">
            <StorageVolumeOverview volume={volume} project={project} />
          </div>
        )}

        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="配置">
            <EditStorageVolume volume={volume} />
          </div>
        )}

        {activeTab === "snapshots" && (
          <div role="tabpanel" aria-labelledby="快照">
            <StorageVolumeSnapshots volume={volume} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default StorageVolumeDetail;
