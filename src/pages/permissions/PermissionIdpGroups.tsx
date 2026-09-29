import {
  Button,
  EmptyState,
  Icon,
  List,
  Notification,
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
import usePanelParams, { panels } from "util/usePanelParams";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import PermissionGroupsFilter from "./PermissionGroupsFilter";
import CreateIdpGroupPanel from "./panels/CreateIdpGroupPanel";
import BulkDeleteIdpGroupsBtn from "./actions/BulkDeleteIdpGroupsBtn";
import EditIdpGroupPanel from "./panels/EditIdpGroupPanel";
import DeleteIdpGroupBtn from "./actions/DeleteIdpGroupBtn";
import { useSettings } from "context/useSettings";
import { Link } from "react-router-dom";
import { useIdpGroups } from "context/useIdpGroups";
import { useServerEntitlements } from "util/entitlements/server";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";
import { pluralize } from "util/instanceBulkActions";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import DocLink from "components/DocLink";

const PermissionIdpGroups: FC = () => {
  const notify = useNotify();
  const { data: groups = [], error, isLoading } = useIdpGroups();
  const panelParams = usePanelParams();
  const [search, setSearch] = useState("");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const { data: settings } = useSettings();
  const hasCustomClaim = settings?.config?.["oidc.groups.claim"];
  const { canCreateIdpGroups } = useServerEntitlements();
  const { canEditIdpGroup } = useIdpGroupEntitlements();
  const isSmallScreen = useIsScreenBelow();

  if (error) {
    notify.failure("加载身份提供商用户组失败", error);
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
    if (panelParams.idpGroup) {
      setSelectedGroupNames([panelParams.idpGroup]);
    }
  }, [panelParams.idpGroup, groups]);

  const headers = [
    { content: "名称", className: "name", sortKey: "name" },
    {
      content: "映射用户组",
      sortKey: "groups",
      className: "u-align--right mapped-groups",
    },
    { "aria-label": "操作", className: "u-align--right actions" },
  ];

  const filteredGroups = groups.filter(
    (idpGroup) => !search || idpGroup.name.toLowerCase().includes(search),
  );

  const selectedGroups = groups.filter((group) =>
    selectedGroupNames.includes(group.name),
  );

  const rows = filteredGroups.map((idpGroup) => {
    const getGroupLink = () => {
      if (canEditIdpGroup(idpGroup)) {
        return (
          <Button
            appearance="link"
            dense
            onClick={() => {
              panelParams.openEditIdpGroup(idpGroup.name);
            }}
          >
            {idpGroup.groups.length}
          </Button>
        );
      }

      const groupsText = pluralize("group", idpGroup.groups?.length ?? 0);
      const groupsList = idpGroup.groups?.join("\n- ");
      const groupsTitle = `已分配${groupsText}：\n- ${groupsList}`;
      return (
        <div title={idpGroup.groups?.length ? groupsTitle : ""}>
          {idpGroup.groups?.length || 0}
        </div>
      );
    };

    return {
      key: idpGroup.name,
      name: idpGroup.name,
      className: "u-row",
      columns: [
        {
          content: idpGroup.name,
          role: "rowheader",
          "aria-label": "名称",
          className: "u-truncate",
          title: idpGroup.name,
        },
        {
          content: getGroupLink(),
          role: "cell",
          className: "u-align--right mapped-groups",
          "aria-label": "映射用户组数量",
        },
        {
          className: "actions u-align--right",
          content: (
            <List
              inline
              className="u-no-margin--bottom actions-list"
              items={[
                <Button
                  key={`edit-${idpGroup.name}`}
                  appearance="base"
                  hasIcon
                  dense
                  onClick={() => {
                    panelParams.openEditIdpGroup(idpGroup.name);
                  }}
                  type="button"
                  aria-label="编辑 IDP 用户组详情"
                  title={
                    canEditIdpGroup(idpGroup)
                      ? "编辑详情"
                      : "你没有权限修改该 IDP 用户组"
                  }
                  disabled={!canEditIdpGroup(idpGroup)}
                >
                  <Icon name="edit" />
                </Button>,
                <DeleteIdpGroupBtn
                  key={`delete-${idpGroup.name}`}
                  idpGroup={idpGroup}
                />,
              ]}
            />
          ),
          role: "cell",
          "aria-label": "操作",
        },
      ],
      sortData: {
        name: idpGroup.name.toLowerCase(),
        groups: idpGroup.groups.length,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  const getTablePaginationDescription = () => {
    if (selectedGroupNames.length > 0) {
      return (
        <SelectedTableNotification
          totalCount={groups.length ?? 0}
          itemName="IDP 用户组"
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
  const idpGroupsInfo = (
    <>
      <>
        身份提供商用户组用于将你的身份提供商中的认证实体映射到 LXD 内部的用户组。
      </>
      {!hasCustomClaim && (
        <>
          <br />
          你需要在服务器{" "}
          <Link to="/ui/settings">
            配置中设置 <code>oidc.groups.claim</code>
          </Link>{" "}
          为提供 IDP 用户组的自定义声明名称。
        </>
      )}
      <br />
      <DocLink docPath="/explanation/authorization/#use-groups-defined-by-the-identity-provider">
        了解更多 IDP 用户组
      </DocLink>
    </>
  );

  const content = hasGroups ? (
    <>
      <Notification severity="information">{idpGroupsInfo}</Notification>
      <ScrollableTable
        dependencies={[groups]}
        tableId="idp-groups-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="IDP 用户组"
          className="u-no-margin--top"
          aria-label="表格分页控件"
          description={getTablePaginationDescription()}
        >
          <SelectableMainTable
            id="idp-groups-table"
            className="permission-idp-group-table"
            headers={headers}
            rows={sortedRows}
            sortable
            emptyStateMsg="没有匹配搜索条件的身份提供商用户组"
            onUpdateSort={updateSort}
            itemName="IDP 用户组"
            parentName=""
            selectedNames={selectedGroupNames}
            setSelectedNames={setSelectedGroupNames}
            disabledNames={[]}
            filteredNames={filteredGroups.map((item) => item.name)}
            disableSelect={!!panelParams.panel}
          />
        </TablePagination>
      </ScrollableTable>
    </>
  ) : (
    <EmptyState
      className="empty-state"
      image={<Icon name="user-group" className="empty-state-icon" />}
      title="暂无 IDP 用户组映射"
    >
      <p>{idpGroupsInfo}</p>
      <Button
        className="empty-state-button"
        appearance="positive"
        onClick={panelParams.openCreateIdpGroup}
        disabled={!canCreateIdpGroups()}
        title={
          canCreateIdpGroups()
            ? ""
            : "你没有权限创建 IDP 用户组"
        }
        hasIcon={!isSmallScreen}
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>创建 IDP 用户组</span>
      </Button>
    </EmptyState>
  );

  return (
    <>
      <CustomLayout
        mainClassName="permission-idp-groups-list"
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/explanation/authorization"
                  title="了解更多权限管理"
                >
                  IDP&nbsp;用户组
                </HelpLink>
              </PageHeader.Title>
              {!selectedGroupNames.length && hasGroups ? (
                <PageHeader.Search>
                  <PermissionGroupsFilter
                    onChange={setSearch}
                    value={search}
                    disabled={!!panelParams.idpGroup}
                  />
                </PageHeader.Search>
              ) : null}
              {selectedGroupNames.length > 0 && !panelParams.panel && (
                <>
                  <BulkDeleteIdpGroupsBtn idpGroups={selectedGroups} />
                </>
              )}
            </PageHeader.Left>
            {hasGroups && (
              <PageHeader.BaseActions>
                {!selectedGroupNames.length && (
                  <Button
                    appearance="positive"
                    className="u-no-margin--bottom u-float-right"
                    onClick={panelParams.openCreateIdpGroup}
                    disabled={!canCreateIdpGroups()}
                    title={
                      canCreateIdpGroups()
                        ? ""
                        : "你没有权限创建 IDP 用户组"
                    }
                    hasIcon={!isSmallScreen}
                  >
                    {!isSmallScreen && <Icon name="plus" light />}
                    <span>创建 IDP 用户组</span>
                  </Button>
                )}
              </PageHeader.BaseActions>
            )}
          </PageHeader>
        }
      >
        {!panelParams.panel && <NotificationRow />}
        <Row>{content}</Row>
      </CustomLayout>

      {panelParams.panel === panels.createIdpGroup && <CreateIdpGroupPanel />}

      {panelParams.panel === panels.editIdpGroup &&
        selectedGroups.length > 0 && (
          <EditIdpGroupPanel
            idpGroup={selectedGroups[0]}
            onClose={() => {
              setSelectedGroupNames([]);
            }}
          />
        )}
    </>
  );
};

export default PermissionIdpGroups;
