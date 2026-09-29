import {
  Button,
  EmptyState,
  Icon,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import type { FC } from "react";
import { useEffect, useState } from "react";
import useSortTableData from "util/useSortTableData";
import { getIdentityIdsForGroup } from "util/permissionIdentities";
import usePanelParams, { panels } from "util/usePanelParams";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import GroupActions from "./actions/GroupActions";
import CreateGroupPanel from "./panels/CreateGroupPanel";
import EditGroupPanel from "./panels/EditGroupPanel";
import PermissionGroupsFilter from "./PermissionGroupsFilter";
import EditGroupIdentitiesBtn from "./actions/EditGroupIdentitiesBtn";
import EditGroupIdentitiesPanel from "./panels/EditGroupIdentitiesPanel";
import BulkDeleteGroupsBtn from "./actions/BulkDeleteGroupsBtn";
import { useAuthGroups } from "context/useAuthGroups";
import { useServerEntitlements } from "util/entitlements/server";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import DocLink from "components/DocLink";

const PermissionGroups: FC = () => {
  const notify = useNotify();
  const { data: groups = [], error, isLoading } = useAuthGroups();
  const panelParams = usePanelParams();
  const [search, setSearch] = useState("");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const { canCreateGroups } = useServerEntitlements();
  const isSmallScreen = useIsScreenBelow();

  if (error) {
    notify.failure("加载用户组失败", error);
  }

  useEffect(() => {
    const validSelections = selectedGroupNames.filter((name) =>
      groups.some((group) => group.name === name),
    );
    if (validSelections.length !== selectedGroupNames.length) {
      setSelectedGroupNames(validSelections);
    }
  }, [groups]);

  useEffect(() => {
    if (panelParams.group) {
      setSelectedGroupNames([panelParams.group]);
    }
  }, [panelParams.group, groups]);

  const headers = [
    { content: "名称", className: "name", sortKey: "name" },
    {
      content: "描述",
      className: "description",
      sortKey: "description",
    },
    {
      content: "身份",
      sortKey: "identities",
      className: "u-align--right identities",
    },
    {
      content: "权限",
      sortKey: "permissions",
      className: "u-align--right permissions",
    },
    { "aria-label": "操作", className: "u-align--right actions" },
  ];

  const filteredGroups = groups.filter(
    (group) =>
      !search ||
      group.name.toLowerCase().includes(search) ||
      group.description.toLowerCase().includes(search),
  );

  const selectedGroups = groups.filter((group) =>
    selectedGroupNames.includes(group.name),
  );

  const panelGroup = groups.find((group) => group.name === panelParams.group);

  const rows = filteredGroups.map((group) => {
    const allIdentityIds = getIdentityIdsForGroup(group);
    return {
      key: group.name,
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          role: "rowheader",
          "aria-label": "名称",
          className: "u-truncate name",
          title: group.name,
        },
        {
          content: <span>{group.description}</span>,
          role: "cell",
          "aria-label": "描述",
          className: "description",
          title: group.description,
        },
        {
          content: (
            <Button
              appearance="link"
              dense
              onClick={() => {
                panelParams.openEditGroup(group.name, "identity");
              }}
            >
              {allIdentityIds.length}
            </Button>
          ),
          role: "cell",
          className: "u-align--right identities",
          "aria-label": "该用户组中的身份",
        },
        {
          content: (
            <Button
              appearance="link"
              dense
              onClick={() => {
                panelParams.openEditGroup(group.name, "permission");
              }}
            >
              {group.permissions?.length || 0}
            </Button>
          ),
          role: "cell",
          className: "u-align--right permissions",
          "aria-label": "该用户组的权限",
        },
        {
          className: "actions u-align--right",
          content: <GroupActions group={group} />,
          role: "cell",
          "aria-label": "操作",
        },
      ],
      sortData: {
        name: group.name.toLowerCase(),
        description: group.description.toLowerCase(),
        permissions: group.permissions?.length || 0,
        identities: allIdentityIds.length,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "name",
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  const getTablePaginationDescription = () => {
    if (selectedGroupNames.length > 0) {
      return (
        <SelectedTableNotification
          totalCount={groups.length ?? 0}
          itemName="用户组"
          parentName=""
          selectedNames={selectedGroupNames}
          setSelectedNames={setSelectedGroupNames}
          filteredNames={filteredGroups.map((item) => item.name)}
          hideActions={!!panelParams.panel}
        />
      );
    } else {
      return null;
    }
  };

  const hasGroups = groups.length > 0;
  const content = hasGroups ? (
    <ScrollableTable
      dependencies={[groups]}
      tableId="groups-table"
      belowIds={["status-bar"]}
    >
      <TablePagination
        data={sortedRows}
        id="pagination"
        itemName="用户组"
        className="u-no-margin--top"
        aria-label="表格分页控件"
        description={getTablePaginationDescription()}
      >
        <SelectableMainTable
          id="groups-table"
          className="groups-table"
          headers={headers}
          rows={sortedRows}
          sortable
          emptyStateMsg="没有匹配搜索条件的用户组"
          onUpdateSort={updateSort}
          itemName="用户组"
          parentName=""
          selectedNames={selectedGroupNames}
          setSelectedNames={setSelectedGroupNames}
          disabledNames={[]}
          filteredNames={filteredGroups.map((item) => item.name)}
          disableSelect={!!panelParams.panel}
        />
      </TablePagination>
    </ScrollableTable>
  ) : (
    <EmptyState
      className="empty-state"
      image={<Icon name="user-group" className="empty-state-icon" />}
      title="暂无用户组"
    >
      <p>
        用户组可以帮助你更方便地统一管理权限分配。
      </p>
      <p>
        <DocLink docPath="/explanation/authorization" hasExternalIcon>
          了解更多权限管理
        </DocLink>
      </p>
      <Button
        className="empty-state-button"
        appearance="positive"
        onClick={() => {
          panelParams.openCreateGroup();
        }}
        disabled={!canCreateGroups()}
        title={
          canCreateGroups() ? "" : "你没有权限创建用户组"
        }
        hasIcon={!isSmallScreen}
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>创建用户组</span>
      </Button>
    </EmptyState>
  );

  return (
    <>
      <CustomLayout
        mainClassName="permission-groups-list"
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/explanation/authorization"
                  title="了解更多权限管理"
                >
                  授权用户组
                </HelpLink>
              </PageHeader.Title>
              {!selectedGroupNames.length && hasGroups && (
                <PageHeader.Search>
                  <PermissionGroupsFilter
                    onChange={setSearch}
                    value={search}
                    disabled={!!panelParams.group}
                    className="u-no-margin--bottom"
                  />
                </PageHeader.Search>
              )}
              {selectedGroupNames.length > 0 && !panelParams.panel && (
                <>
                  <EditGroupIdentitiesBtn
                    groups={selectedGroups}
                    className="u-no-margin--bottom"
                  />
                  <BulkDeleteGroupsBtn
                    groups={selectedGroups}
                    className="u-no-margin--bottom"
                    onDelete={() => {
                      setSelectedGroupNames([]);
                    }}
                  />
                </>
              )}
            </PageHeader.Left>
            {hasGroups && (
              <PageHeader.BaseActions>
                {!selectedGroupNames.length && (
                  <Button
                    appearance="positive"
                    className="u-no-margin--bottom u-float-right"
                    onClick={() => {
                      panelParams.openCreateGroup();
                    }}
                    disabled={!canCreateGroups()}
                    title={
                      canCreateGroups()
                        ? ""
                        : "你没有权限创建用户组"
                    }
                    hasIcon={!isSmallScreen}
                  >
                    {!isSmallScreen && <Icon name="plus" light />}
                    <span>创建用户组</span>
                  </Button>
                )}
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row className="permission-groups">{content}</Row>
      </CustomLayout>

      {panelParams.panel === panels.createGroup && <CreateGroupPanel />}

      {panelParams.panel === panels.editGroup && panelGroup && (
        <EditGroupPanel
          group={panelGroup}
          onClose={() => {
            setSelectedGroupNames([]);
          }}
        />
      )}

      {panelParams.panel === panels.groupIdentities &&
        !!selectedGroups.length && (
          <EditGroupIdentitiesPanel groups={selectedGroups} />
        )}
    </>
  );
};

export default PermissionGroups;
