import type { FC } from "react";
import { EmptyState, Icon, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import ClusterMemberHardware from "pages/cluster/ClusterMemberHardware";
import BaseLayout from "components/BaseLayout";
import TabLinks from "components/TabLinks";
import EnableClusteringBtn from "pages/cluster/actions/EnableClusteringBtn";
import DocLink from "components/DocLink";

interface Props {
  activeTab?: string;
}

const Server: FC<Props> = ({ activeTab }) => {
  const tabs = [
    { label: "硬件信息", path: "overview" },
    { label: "集群", path: "clustering" },
  ];

  return (
    <BaseLayout
      title="服务器"
      contentClassName="detail-page cluster-member-details"
    >
      <NotificationRow />
      <Row>
        <TabLinks tabs={tabs} activeTab={activeTab} tabUrl={`/ui/server`} />
        {!activeTab && <ClusterMemberHardware />}
        {activeTab === "clustering" && (
          <EmptyState
            className="empty-state"
            image={<Icon name="cluster-host" className="empty-state-icon" />}
            title="当前服务器尚未加入集群"
          >
            <p>
              <DocLink docPath="/explanation/clustering/" hasExternalIcon>
                了解更多集群信息
              </DocLink>
            </p>
            <EnableClusteringBtn />
          </EmptyState>
        )}
      </Row>
    </BaseLayout>
  );
};

export default Server;
