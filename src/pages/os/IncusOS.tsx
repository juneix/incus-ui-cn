import type { ChangeEvent, FC } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, CustomLayout } from "@canonical/react-components";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import TabLinks from "components/TabLinks";
import { useClusterMembers } from "context/useClusterMembers";
import OSOverview from "./OSOverview";
import OSLogs from "./OSLogs";
import OSNetwork from "./OSNetwork";
import OSSecurity from "./OSSecurity";
import OSServices from "./OSServices";
import OSServiceDetails from "./OSServiceDetails";
import OSStorage from "./OSStorage";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import OSActions from "pages/os/actions/OSActions";

const tabs: TabLink[] = [
  { label: "概览", path: "overview" },
  { label: "日志", path: "logs" },
  { label: "网络", path: "network" },
  { label: "存储", path: "storage" },
  { label: "安全", path: "security" },
  { label: "服务", path: "services" },
];

const IncusOS: FC = () => {
  const renderTabs: (string | TabLink)[] = [...tabs];
  const { activeTab, itemName } = useParams<{
    activeTab?: string;
    itemName?: string;
  }>();
  const [currentMember, setCurrentMember] = useState<string>("");
  const { data: clusterMembers = [] } = useClusterMembers();

  useEffect(() => {
    if (clusterMembers.length < 1) return;
    if (currentMember !== "") return;

    setCurrentMember(clusterMembers[0].server_name);
  }, [currentMember, clusterMembers]);

  const onMemberChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentMember(e.target.value);
  };

  return (
    <CustomLayout
      header={
        <div className="p-panel__header page-header">
          <div className="page-header__left">
            <h1 className="p-heading--4 u-no-margin--bottom">Incus OS</h1>
            <ClusterMemberSelector label="" onChange={onMemberChange} />
            <OSActions target={currentMember} />
          </div>
          <div className="page-header__search margin-right u-no-margin--bottom"></div>
        </div>
      }
      contentClassName="detail-page"
    >
      <Row>
        <TabLinks tabs={renderTabs} activeTab={activeTab} tabUrl={`/ui/os`} />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="概览">
            <OSOverview target={currentMember} />
          </div>
        )}

        {activeTab === "logs" && (
          <div role="tabpanel" aria-labelledby="日志">
            <OSLogs target={currentMember} />
          </div>
        )}

        {activeTab === "network" && (
          <div role="tabpanel" aria-labelledby="网络">
            <OSNetwork target={currentMember} />
          </div>
        )}

        {activeTab === "storage" && (
          <div role="tabpanel" aria-labelledby="存储">
            <OSStorage target={currentMember} />
          </div>
        )}

        {activeTab === "security" && (
          <div role="tabpanel" aria-labelledby="安全">
            <OSSecurity target={currentMember} />
          </div>
        )}

        {activeTab === "services" && !itemName && (
          <div role="tabpanel" aria-labelledby="服务">
            <OSServices target={currentMember} />
          </div>
        )}

        {activeTab === "services" && itemName && (
          <div role="tabpanel" aria-labelledby="服务">
            <OSServiceDetails name={itemName} target={currentMember} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default IncusOS;
