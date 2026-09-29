import type { FC } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import EditProfile from "pages/profiles/EditProfile";
import ProfileDetailOverview from "pages/profiles/ProfileDetailOverview";
import ProfileDetailHeader from "./ProfileDetailHeader";
import NotificationRow from "components/NotificationRow";
import TabLinks from "components/TabLinks";
import { useProfile } from "context/useProfiles";

const tabs = [
  { label: "概览", path: "overview" },
  { label: "配置", path: "configuration" },
];

const ProfileDetail: FC = () => {
  const notify = useNotify();
  const {
    name,
    project: projectName,
    activeTab,
  } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>缺少配置模板名称</>;
  }
  if (!projectName) {
    return <>缺少项目参数</>;
  }

  const { data: profile, error, isLoading } = useProfile(name, projectName);

  if (error) {
    notify.failure("加载配置模板失败", error);
  }

  return (
    <CustomLayout
      header={
        <ProfileDetailHeader
          name={name}
          profile={profile}
          project={projectName}
        />
      }
      contentClassName="detail-page"
    >
      <NotificationRow />
      {isLoading && (
        <Spinner className="u-loader" text="正在加载配置模板详情..." />
      )}
      {!isLoading && !profile && <>加载配置模板失败</>}
      {!isLoading && profile && (
        <Row>
          <TabLinks
            tabs={tabs}
            activeTab={activeTab}
            tabUrl={`/ui/project/${encodeURIComponent(projectName)}/profile/${encodeURIComponent(name)}`}
          />

          {!activeTab && (
            <div role="tabpanel" aria-labelledby="概览">
              <ProfileDetailOverview profile={profile} />
            </div>
          )}

          {activeTab === "configuration" && (
            <div role="tabpanel" aria-labelledby="配置">
              <EditProfile profile={profile} />
            </div>
          )}
        </Row>
      )}
    </CustomLayout>
  );
};

export default ProfileDetail;
