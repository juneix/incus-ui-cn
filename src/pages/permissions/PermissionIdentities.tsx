import {
  Button,
  Icon,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  Spinner,
  CustomLayout,
  NotificationConsumer,
} from "@canonical/react-components";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSortTableData from "util/useSortTableData";
import type { PermissionIdentitiesFilterType } from "./PermissionIdentitiesFilter";
import { isSystemIdentity } from "./PermissionIdentitiesFilter";
import { SYSTEM_IDENTITIES } from "./PermissionIdentitiesFilter";
import PermissionIdentitiesFilter, {
  AUTH_METHOD,
  QUERY,
} from "./PermissionIdentitiesFilter";
import { useSettings } from "context/useSettings";
import EditIdentityGroupsBtn from "./actions/EditIdentityGroupsBtn";
import usePanelParams, { panels } from "util/usePanelParams";
import PageHeader from "components/PageHeader";
import HelpLink from "components/HelpLink";
import EditIdentityGroupsPanel from "./panels/EditIdentityGroupsPanel";
import Tag from "components/Tag";
import BulkDeleteIdentitiesBtn from "./actions/BulkDeleteIdentitiesBtn";
import DeleteIdentityBtn from "./actions/DeleteIdentityBtn";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { isUnrestricted } from "util/helpers";
import CreateTlsIdentityBtn from "./CreateTlsIdentityBtn";
import { useIdentities } from "context/useIdentities";
import { useIdentityEntitlements } from "util/entitlements/identities";
import { pluralize } from "util/instanceBulkActions";
import { getIdentityName } from "util/permissionIdentities";
import CreateTLSIdentity from "./CreateTLSIdentity";
import ResourceLabel from "components/ResourceLabel";
import type { ResourceIconType } from "components/ResourceIcon";
import SsoNotification from "pages/permissions/SsoNotification";

const PermissionIdentities: FC = () => {
  const notify = useNotify();
  const { data: identities = [], error, isLoading } = useIdentities();
  const { data: settings } = useSettings();
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const [selectedIdentityIds, setSelectedIdentityIds] = useState<string[]>([]);
  const { hasAccessManagementTLS } = useSupportedFeatures();
  const { canEditIdentity } = useIdentityEntitlements();
  const hasOidc = settings?.auth_methods?.includes("oidc");

  useEffect(() => {
    const validIdentityIds = new Set(identities.map((identity) => identity.id));

    const validSelections = selectedIdentityIds.filter((identity) =>
      validIdentityIds.has(identity),
    );

    if (validSelections.length !== selectedIdentityIds.length) {
      setSelectedIdentityIds(validSelections);
    }
  }, [identities]);

  if (error) {
    notify.failure("加载身份列表失败", error);
  }

  const headers = [
    { content: "名称", className: "name", sortKey: "name" },
    { content: "ID", sortKey: "id", className: "identity-id" },
    { content: "认证方式", sortKey: "authmethod", className: "auth-method" },
    { content: "类型", sortKey: "type", className: "identity-type" },
    {
      content: "用户组",
      sortKey: "groups",
      className: "u-align--right group-count",
    },
    { "aria-label": "操作", className: "u-align--right actions" },
  ];

  const filters: PermissionIdentitiesFilterType = {
    queries: searchParams.getAll(QUERY),
    authMethod: searchParams.getAll(AUTH_METHOD),
    systemIdentities: searchParams.get(SYSTEM_IDENTITIES),
  };

  const filteredIdentities = identities.filter((identity) => {
    if (filters.systemIdentities === "hide" && isSystemIdentity(identity)) {
      return false;
    }

    if (
      !filters.queries.every(
        (q) =>
          getIdentityName(identity).toLowerCase().includes(q) ||
          identity.id.toLowerCase().includes(q),
      )
    ) {
      return false;
    }

    if (
      filters.authMethod.length > 0 &&
      !filters.authMethod.includes(identity.authentication_method)
    ) {
      return false;
    }

    return true;
  });

  const selectedIdentities = identities.filter((identity) =>
    selectedIdentityIds.includes(identity.id),
  );

  const rows = filteredIdentities.map((identity) => {
    const isLoggedInIdentity = settings?.auth_user_name === identity.id;
    const openGroupPanelForIdentity = () => {
      panelParams.openIdentityGroups(identity.id);
      setSelectedIdentityIds([identity.id]);
    };

    const getGroupLink = () => {
      if (canEditIdentity(identity)) {
        return (
          <Button appearance="link" dense onClick={openGroupPanelForIdentity}>
            {identity.groups?.length || 0}
          </Button>
        );
      }

      const groupsText = pluralize("group", identity.groups?.length ?? 0);
      const groupsList = identity.groups?.join("\n- ");
      const groupsTitle = `已分配${groupsText}：\n- ${groupsList}`;
      return (
        <div title={identity.groups?.length ? groupsTitle : ""}>
          {identity.groups?.length || 0}
        </div>
      );
    };
    const name = getIdentityName(identity);

    const getType = (): ResourceIconType => {
      if (identity.type.startsWith("Client certificate")) {
        return "certificate";
      }
      if (identity.type.startsWith("OIDC client")) {
        return "oidc-identity";
      }
      if (identity.type.startsWith("Server certificate")) {
        return "cluster-member";
      }
      if (identity.type.startsWith("Metrics certificate")) {
        return "metric";
      }
      return "certificate";
    };

    return {
      key: identity.id,
      name: isUnrestricted(identity) ? "" : identity.id,
      className: "u-row",
      columns: [
        {
          content: (
            <>
              <ResourceLabel type={getType()} value={name} />{" "}
              <Tag isVisible={isLoggedInIdentity}>当前用户</Tag>
            </>
          ),
          role: "rowheader",
          "aria-label": "名称",
          className: "u-truncate",
          title: name,
        },
        {
          content: identity.id,
          role: "cell",
          "aria-label": "ID",
          className: "u-truncate identity-id",
          title: identity.id,
        },
        {
          content: identity.authentication_method.toUpperCase(),
          role: "cell",
          "aria-label": "认证方式",
          className: "auth-method",
        },
        {
          content: (() => {
            if (identity.type.startsWith("Client certificate")) {
              return identity.type.replace("Client certificate", "客户端证书");
            }
            if (identity.type.startsWith("OIDC client")) {
              return identity.type.replace("OIDC client", "OIDC 客户端");
            }
            if (identity.type.startsWith("Server certificate")) {
              return identity.type.replace("Server certificate", "服务器证书");
            }
            if (identity.type.startsWith("Metrics certificate")) {
              return identity.type.replace("Metrics certificate", "指标证书");
            }
            return identity.type;
          })(),
          role: "cell",
          "aria-label": "类型",
          className: "u-truncate identity-type",
        },
        {
          content: getGroupLink(),
          role: "cell",
          className: "u-align--right group-count",
          "aria-label": "该身份所属用户组",
        },
        {
          content: !isUnrestricted(identity) && (
            <>
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                hasIcon
                dense
                onClick={openGroupPanelForIdentity}
                type="button"
                aria-label="管理用户组"
                title={
                  canEditIdentity()
                    ? "管理用户组"
                    : "你没有权限修改该身份"
                }
                disabled={!canEditIdentity(identity)}
              >
                <Icon name="user-group" />
              </Button>
              {hasAccessManagementTLS && (
                <DeleteIdentityBtn identity={identity} />
              )}
            </>
          ),
          className: "actions u-align--right",
          role: "cell",
          "aria-label": "操作",
        },
      ],
      sortData: {
        id: identity.id,
        name: name.toLowerCase(),
        authentication_method: identity.authentication_method,
        type: identity.type,
        groups: identity.groups?.length || 0,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "name",
  });

  const fineGrainedIdentities = identities.filter((identity) => {
    return !isUnrestricted(identity);
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  const getTablePaginationDescription = () => {
    // This is needed because TablePagination does not cater for plural identity
    const defaultPaginationDescription =
      rows.length > 1
        ? `显示全部 ${rows.length} 个身份`
        : "显示 1 个身份，共 1 个";

    if (selectedIdentityIds.length > 0) {
      return (
        <SelectedTableNotification
          totalCount={fineGrainedIdentities.length ?? 0}
          itemName="身份"
          selectedNames={selectedIdentityIds}
          setSelectedNames={setSelectedIdentityIds}
          filteredNames={fineGrainedIdentities.map((item) => item.id)}
          hideActions={!!panelParams.panel}
        />
      );
    }

    return defaultPaginationDescription;
  };

  return (
    <>
      <CustomLayout
        mainClassName="permission-identities-list"
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/explanation/authorization"
                  title="了解更多权限管理"
                >
                  身份
                </HelpLink>
              </PageHeader.Title>
              {!selectedIdentityIds.length && !panelParams.panel && (
                <PageHeader.Search>
                  <PermissionIdentitiesFilter />
                </PageHeader.Search>
              )}
              {!!selectedIdentityIds.length && (
                <EditIdentityGroupsBtn
                  identities={selectedIdentities}
                  className="u-no-margin--bottom"
                />
              )}
              {!!selectedIdentityIds.length && hasAccessManagementTLS && (
                <BulkDeleteIdentitiesBtn identities={selectedIdentities} />
              )}
            </PageHeader.Left>
            <PageHeader.BaseActions>
              <CreateTlsIdentityBtn
                openPanel={panelParams.openCreateTLSIdentity}
              />
            </PageHeader.BaseActions>
          </PageHeader>
        }
      >
        {!panelParams.panel && (
          <div className="row">
            <NotificationConsumer />
            <SsoNotification hasOidc={hasOidc ?? false} />
          </div>
        )}
        <Row>
          <ScrollableTable
            dependencies={[identities]}
            tableId="identities-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="身份"
              className="u-no-margin--top"
              aria-label="表格分页控件"
              description={getTablePaginationDescription()}
            >
              <SelectableMainTable
                id="identities-table"
                className="permission-identities-table"
                headers={headers}
                rows={sortedRows}
                sortable
                emptyStateMsg="没有匹配搜索条件的身份"
                onUpdateSort={updateSort}
                itemName="身份"
                parentName=""
                selectedNames={selectedIdentityIds}
                setSelectedNames={setSelectedIdentityIds}
                disabledNames={[]}
                filteredNames={fineGrainedIdentities.map(
                  (identity) => identity.id,
                )}
                disableSelect={!!panelParams.panel}
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </CustomLayout>
      <CreateTLSIdentity />

      {panelParams.panel === panels.identityGroups && (
        <EditIdentityGroupsPanel
          identities={selectedIdentities}
          onClose={() => {
            setSelectedIdentityIds([]);
          }}
        />
      )}
    </>
  );
};

export default PermissionIdentities;
