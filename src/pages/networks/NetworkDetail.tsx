import type { FC } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import EditNetwork from "pages/networks/EditNetwork";
import NetworkDetailHeader from "pages/networks/NetworkDetailHeader";
import {
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import TabLinks from "components/TabLinks";
import NetworkForwards from "pages/networks/NetworkForwards";
import NetworkLoadBalancers from "pages/networks/NetworkLoadBalancers";
import { useNetwork } from "context/useNetworks";
import NetworkLeases from "pages/networks/NetworkLeases";
import { ovnType, typesWithForwards } from "util/networks";

const NetworkDetail: FC = () => {
  const notify = useNotify();

  const { name, project, member, activeTab } = useParams<{
    name: string;
    project: string;
    member: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>缺少网络名称</>;
  }

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: network, error, isLoading } = useNetwork(name, project, member);

  useEffect(() => {
    if (error) {
      notify.failure("加载网络失败", error);
    }
  }, [error]);

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  const isManagedNetwork = network?.managed;

  const getTabs = () => {
    const type = network?.type ?? "";
    if (!typesWithForwards.includes(type) || !isManagedNetwork) {
      return [{ label: "配置", path: "configuration" }];
    }

    if (network?.type === ovnType) {
      return [
        { label: "配置", path: "configuration" },
        { label: "转发", path: "forwards" },
        { label: "负载均衡", path: "load-balancers" },
        { label: "租约", path: "leases" },
      ];
    }

    return [
      { label: "配置", path: "configuration" },
      { label: "转发", path: "forwards" },
      { label: "租约", path: "leases" },
    ];
  };

  return (
    <CustomLayout
      header={
        <NetworkDetailHeader network={network} project={project} name={name} />
      }
      contentClassName="edit-network"
    >
      <Row>
        <TabLinks
          tabs={getTabs()}
          activeTab={activeTab}
          tabUrl={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(name)}`}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="配置">
            {network && <EditNetwork network={network} project={project} />}
          </div>
        )}
        {activeTab === "forwards" && (
          <div role="tabpanel" aria-labelledby="转发">
            {network && <NetworkForwards network={network} project={project} />}
          </div>
        )}
        {activeTab === "load-balancers" && (
          <div role="tabpanel" aria-labelledby="负载均衡">
            {network && (
              <NetworkLoadBalancers network={network} project={project} />
            )}
          </div>
        )}
        {activeTab === "leases" && (
          <div role="tabpanel" aria-labelledby="租约">
            {network && <NetworkLeases network={network} project={project} />}
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkDetail;
