import type { FC } from "react";
import { useState } from "react";
import {
  Button,
  Col,
  EmptyState,
  Icon,
  MainTable,
  Notification,
  Row,
  ScrollableTable,
  SearchBox,
  TablePagination,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { useNavigate, useParams } from "react-router-dom";
import { getProfileInstances } from "util/usedBy";
import usePanelParams, { panels } from "util/usePanelParams";
import { defaultFirst } from "util/helpers";
import ProfileLink from "./ProfileLink";
import { isProjectWithProfiles } from "util/projects";
import { useCurrentProject } from "context/useCurrentProject";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import ProfileDetailPanel from "./ProfileDetailPanel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProfiles } from "context/useProfiles";
import ResourceLink from "components/ResourceLink";

const ProfileList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { project: projectName } = useParams<{ project: string }>();
  const [query, setQuery] = useState<string>("");
  const isSmallScreen = useIsScreenBelow();

  if (!projectName) {
    return <>缺少项目参数</>;
  }
  const isDefaultProject = projectName === "default";

  const { project, isLoading: isProjectLoading } = useCurrentProject();
  const { canCreateProfiles } = useProjectEntitlements();

  const {
    data: profiles = [],
    error,
    isLoading: isProfilesLoading,
  } = useProfiles(projectName);

  if (error) {
    notify.failure("加载配置模板失败", error);
  }

  const isLoading = isProfilesLoading || isProjectLoading;

  const featuresProfiles = isProjectWithProfiles(project);

  profiles.sort(defaultFirst);

  const instanceCountMap = profiles.map((profile) => {
    const usedByInstances = getProfileInstances(
      projectName,
      isDefaultProject,
      profile.used_by,
    );
    return {
      name: profile.name,
      count: usedByInstances.filter(
        (instance) => instance.project === projectName,
      ).length,
      total: usedByInstances.length,
    };
  });

  const filteredProfiles = profiles.filter((item) => {
    if (query) {
      const q = query.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const headers = [
    { content: "名称", sortKey: "name" },
    { content: "描述", sortKey: "description" },
    {
      content: "使用情况",
      sortKey: "used_by",
    },
  ];

  const rows = filteredProfiles.map((profile) => {
    const openSummary = () => {
      panelParams.openProfileSummary(profile.name, projectName);
    };

    const usedBy =
      instanceCountMap.find((item) => profile.name === item.name)?.count ?? 0;
    const total =
      instanceCountMap.find((item) => profile.name === item.name)?.total ?? 0;

    return {
      key: profile.name,
      className:
        panelParams.profile === profile.name ? "u-row-selected" : "u-row",
      columns: [
        {
          content: (
            <div className="u-truncate" title={`配置模板 ${profile.name}`}>
              <ProfileLink
                profile={{
                  name: profile.name,
                  project: profile.project ?? "default",
                }}
              />
            </div>
          ),
          role: "rowheader",
          "aria-label": "名称",
          onClick: openSummary,
        },
        {
          content: (
            <div
              className="table-description"
              title={`描述 ${profile.description}`}
            >
              {profile.description}
            </div>
          ),
          role: "cell",
          "aria-label": "描述",
          onClick: openSummary,
          className: "clickable-cell",
        },
        {
          content: (
            <>
              {usedBy} {usedBy === 1 ? "个实例" : "个实例"}
              {isDefaultProject && (
                <>
                  <div className="u-text--muted">所有项目共 {total} 个</div>
                </>
              )}
            </>
          ),
          role: "cell",
          "aria-label": "使用情况",
          onClick: openSummary,
          className: "clickable-cell",
        },
      ],
      sortData: {
        name: profile.name.toLowerCase(),
        description: profile.description.toLowerCase(),
        used_by: usedBy,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  return (
    <>
      <CustomLayout
        mainClassName="profile-list"
        contentClassName="profile-content"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/profiles/"
                  title="了解如何使用配置模板"
                >
                  配置模板
                </HelpLink>
              </PageHeader.Title>
              {profiles.length > 0 && (
                <PageHeader.Search>
                  <SearchBox
                    className="search-box margin-right u-no-margin--bottom"
                    name="search-profile"
                    type="text"
                    onChange={(value) => {
                      setQuery(value);
                    }}
                    placeholder="搜索"
                    value={query}
                    aria-label="搜索"
                  />
                </PageHeader.Search>
              )}
            </PageHeader.Left>
            {featuresProfiles && (
              <PageHeader.BaseActions>
                <Button
                  appearance="positive"
                  className="u-no-margin--bottom u-float-right"
                  onClick={async () =>
                    navigate(
                      `/ui/project/${encodeURIComponent(projectName)}/profiles/create`,
                    )
                  }
                  hasIcon={!isSmallScreen}
                  disabled={!canCreateProfiles(project)}
                  title={
                    canCreateProfiles(project)
                      ? ""
                      : "你没有权限在此项目中创建配置模板"
                  }
                >
                  {!isSmallScreen && <Icon name="plus" light />}
                  <span>创建配置模板</span>
                </Button>
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row className="no-grid-gap">
          <Col size={12}>
            {!featuresProfiles && (
              <Notification severity="information">
                当前展示的是{" "}
                <ResourceLink
                  to="/ui/project/default/profiles"
                  type="project"
                  value="default"
                /> 项目中的配置模板。
                <br />
                <span className="u-text--muted">
                  如需项目专属配置模板，请在项目配置中启用配置模板隔离。
                </span>
              </Notification>
            )}
            {profiles.length === 0 && (
              <EmptyState
                className="empty-state"
                image={<Icon name="repository" className="empty-state-icon" />}
                title="未找到配置模板"
              >
                <p>当前项目中没有配置模板。</p>
              </EmptyState>
            )}
            {profiles.length > 0 && (
              <ScrollableTable
                dependencies={[filteredProfiles, notify.notification]}
                tableId="profile-table"
                belowIds={["status-bar"]}
              >
                <TablePagination
                  id="pagination"
                  data={sortedRows}
                  itemName="配置模板"
                  className="u-no-margin--top"
                  aria-label="表格分页控件"
                >
                  <MainTable
                    id="profile-table"
                    headers={headers}
                    sortable
                    emptyStateMsg="没有匹配搜索条件的配置模板"
                    onUpdateSort={updateSort}
                  />
                </TablePagination>
              </ScrollableTable>
            )}
          </Col>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.profileSummary && <ProfileDetailPanel />}
    </>
  );
};

export default ProfileList;
