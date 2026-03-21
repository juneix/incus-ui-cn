import type { FC } from "react";
import {
  Icon,
  Notification,
  Row,
  Strip,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import InstanceOverview from "./InstanceOverview";
import InstanceTerminal from "./InstanceTerminal";
import { useParams } from "react-router-dom";
import InstanceSnapshots from "./InstanceSnapshots";
import InstanceConsole from "pages/instances/InstanceConsole";
import InstanceLogs from "pages/instances/InstanceLogs";
import EditInstance from "./EditInstance";
import InstanceDetailHeader from "pages/instances/InstanceDetailHeader";
import TabLinks from "components/TabLinks";
import { useSettings } from "context/useSettings";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useInstance } from "context/useInstances";
import { buildGrafanaUrl } from "util/grafanaUrl";

const tabs = [
  { label: "概览", path: "overview" },
  { label: "配置", path: "configuration" },
  { label: "快照", path: "snapshots" },
  { label: "终端", path: "terminal" },
  { label: "控制台", path: "console" },
  { label: "日志", path: "logs" },
];

const InstanceDetail: FC = () => {
  const { data: settings } = useSettings();

  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>缺少实例名称</>;
  }
  if (!project) {
    return <>缺少项目参数</>;
  }

  const {
    data: instance,
    error,
    refetch: refreshInstance,
    isLoading,
  } = useInstance(name, project);

  const renderTabs: (string | TabLink)[] = [...tabs];

  const grafanaUrl = buildGrafanaUrl(name, project, settings);
  if (grafanaUrl) {
    renderTabs.push({
      label: (
        <div>
          <Icon name="external-link" /> 监控
        </div>
      ) as unknown as string,
      href: grafanaUrl,
      target: "_blank",
      rel: "noopener noreferrer",
    });
  }

  return (
    <CustomLayout
      header={
        <InstanceDetailHeader
          name={name}
          instance={instance}
          project={project}
          isLoading={isLoading}
        />
      }
      contentClassName="detail-page"
    >
      {isLoading && (
        <Spinner className="u-loader" text="正在加载实例详情..." />
      )}
      {!isLoading && !instance && !error && <>加载实例详情失败</>}
      {error && (
        <Strip>
          <Notification severity="negative" title="错误">
            {error.message}
          </Notification>
        </Strip>
      )}
      {!isLoading && instance && (
        <Row>
          <TabLinks
            tabs={renderTabs}
            activeTab={activeTab}
            tabUrl={`/ui/project/${encodeURIComponent(project)}/instance/${encodeURIComponent(name)}`}
          />

          {!activeTab && (
            <div role="tabpanel" aria-labelledby="概览">
              <InstanceOverview instance={instance} />
            </div>
          )}

          {activeTab === "configuration" && (
            <div role="tabpanel" aria-labelledby="配置">
              <EditInstance instance={instance} />
            </div>
          )}

          {activeTab === "snapshots" && (
            <div role="tabpanel" aria-labelledby="快照">
              <InstanceSnapshots instance={instance} />
            </div>
          )}

          {activeTab === "terminal" && (
            <div role="tabpanel" aria-labelledby="终端">
              <InstanceTerminal
                instance={instance}
                refreshInstance={refreshInstance}
              />
            </div>
          )}

          {activeTab === "console" && (
            <div role="tabpanel" aria-labelledby="控制台">
              <InstanceConsole instance={instance} />
            </div>
          )}

          {activeTab === "logs" && (
            <div role="tabpanel" aria-labelledby="日志">
              <InstanceLogs instance={instance} />
            </div>
          )}
        </Row>
      )}
    </CustomLayout>
  );
};

export default InstanceDetail;
