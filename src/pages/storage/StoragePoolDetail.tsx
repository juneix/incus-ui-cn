import type { FC } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Icon,
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import StoragePoolHeader from "pages/storage/StoragePoolHeader";
import NotificationRow from "components/NotificationRow";
import StoragePoolOverview from "pages/storage/StoragePoolOverview";
import EditStoragePool from "pages/storage/EditStoragePool";
import TabLinks from "components/TabLinks";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useStoragePool } from "context/useStoragePools";
import classnames from "classnames";
import { cephObject, isBucketCompatibleDriver } from "util/storageOptions";

interface LocalTab {
  label: string;
  path: string;
}

const StoragePoolDetail: FC = () => {
  const notify = useNotify();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>缺少存储池名称</>;
  }
  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: pool, error, isLoading } = useStoragePool(name);
  const isVolumeCompatible = pool?.driver !== cephObject;
  const isBucketCompatible = isBucketCompatibleDriver(pool?.driver || "");

  if (error) {
    notify.failure("加载存储详情失败", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  } else if (!pool) {
    return <>加载存储详情失败</>;
  }

  const tabs: (LocalTab | TabLink)[] = [
    { label: "概览", path: "overview" },
    { label: "配置", path: "configuration" },
    {
      component: () => {
        return (
          <Link
            to={
              isVolumeCompatible
                ? `/ui/project/${encodeURIComponent(project)}/storage/volumes?pool=${encodeURIComponent(pool.name)}`
                : "#"
            }
            className={classnames("p-tabs__link", {
              "is-disabled": !isVolumeCompatible,
            })}
            title={
              isVolumeCompatible
              ? "存储卷"
              : "该存储池不支持存储卷"
            }
          >
            存储卷 <Icon name="external-link" />
          </Link>
        );
      },
      label: "存储卷",
    },
    {
      component: () => (
        <Link
          to={
            isBucketCompatible
              ? `/ui/project/${encodeURIComponent(project)}/storage/buckets?pool=${encodeURIComponent(pool.name)}`
              : "#"
          }
          className={classnames("p-tabs__link", {
            "is-disabled": !isBucketCompatible,
          })}
          title={
            isBucketCompatible
              ? "存储桶"
              : "该存储池不支持存储桶"
          }
        >
          存储桶 <Icon name="external-link" />
        </Link>
      ),
      label: "存储桶",
    },
  ];

  return (
    <CustomLayout
      header={<StoragePoolHeader name={name} pool={pool} project={project} />}
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(name)}`}
        />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="概览">
            <StoragePoolOverview pool={pool} project={project} />
          </div>
        )}

        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="配置">
            <EditStoragePool pool={pool} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default StoragePoolDetail;
