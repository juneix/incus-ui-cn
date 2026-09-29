import type { FC } from "react";
import {
  Row,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { Link, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import RenameHeader from "components/RenameHeader";
import TabLinks from "components/TabLinks";
import { useClusterMember } from "context/useClusterMembers";
import ClusterMemberActions from "pages/cluster/ClusterMemberActions";
import ClusterMemberHardware from "pages/cluster/ClusterMemberHardware";
import ClusterMemberOverview from "pages/cluster/ClusterMemberOverview";

const ClusterMemberDetail: FC = () => {
  const notify = useNotify();
  const { name: memberName, activeTab } = useParams<{
    name: string;
    activeTab?: string;
  }>();

  const { data: member, error, isLoading } = useClusterMember(memberName ?? "");

  if (error) {
    notify.failure("加载集群成员详情失败", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  const tabs = [
    { label: "概览", path: "overview" },
    { label: "硬件信息", path: "hardware" },
  ];

  return (
    <CustomLayout
      header={
        <RenameHeader
          name={memberName ?? ""}
          parentItems={[
            <Link to="/ui/cluster/members" key={1}>
              集群成员
            </Link>,
          ]}
          isLoaded
          renameDisabledReason="暂不支持重命名集群成员"
          controls={<ClusterMemberActions member={member} isDetailPage />}
        />
      }
      contentClassName="detail-page cluster-member-details"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/cluster/member/${encodeURIComponent(memberName ?? "")}`}
        />

        {!activeTab && member && <ClusterMemberOverview member={member} />}

        {activeTab === "hardware" && member && (
          <ClusterMemberHardware member={member} />
        )}
      </Row>
    </CustomLayout>
  );
};

export default ClusterMemberDetail;
