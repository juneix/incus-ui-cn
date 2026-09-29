import type { FC } from "react";
import {
  Button,
  MainTable,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import useSortTableData from "util/useSortTableData";
import { Link } from "react-router-dom";
import ClusterMemberActions from "pages/cluster/ClusterMemberActions";
import { useClusterMembers } from "context/useClusterMembers";
import usePanelParams from "util/usePanelParams";
import ClusterMemberStatus from "pages/cluster/ClusterMemberStatus";
import { useMemberLoading } from "context/memberLoading";
import { useServerEntitlements } from "util/entitlements/server";

const ClusterMemberList: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: members = [], error, isLoading } = useClusterMembers();
  const memberLoading = useMemberLoading();
  const { canEditServerConfiguration } = useServerEntitlements();

  if (error) {
    notify.failure("加载集群成员失败", error);
  }

  const headers = [
    {
      content: "名称",
      className: "name",
      sortKey: "name",
    },
    {
      content: <span className="status-header">状态</span>,
      className: "status",
      sortKey: "status",
    },
    { content: "角色", sortKey: "roles", className: "roles" },
    {
      content: "故障域",
      className: "failure-domain",
      sortKey: "failureDomain",
    },
    {
      content: "描述",
      sortKey: "description",
      className: "description",
    },
    {
      content: "分组",
      className: "groups u-align--right",
      sortKey: "groups",
    },
    { "aria-label": "操作", className: "u-align--right actions" },
  ];

  const rows = members.map((member) => {
    const groupCount = (member.groups ?? []).length;
    const openMemberEdit = () => {
      panelParams.openEditMember(member.server_name);
    };
    const loadingType = memberLoading.getType(member.server_name);

    return {
      key: member.server_name,
      name: member.server_name,
      columns: [
        {
          content: (
            <>
              <div>
                <Link
                  to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
                >
                  {member.server_name}
                </Link>
              </div>
              <div className="u-text--muted">{member.url}</div>
            </>
          ),
          role: "rowheader",
          "aria-label": "名称和地址",
          className: "name",
        },
        {
          content: (
            <>
              <div>
                <ClusterMemberStatus member={member} />
              </div>
              <div className="u-text--muted status-header">
                {loadingType ? "进行中" : member.message}
              </div>
            </>
          ),
          role: "cell",
          "aria-label": "状态",
          className: "status",
        },
        {
          content: member.roles.join(", "),
          role: "cell",
          "aria-label": "角色",
          className: "roles",
        },
        {
          content: member.failure_domain,
          role: "cell",
          "aria-label": "故障域",
          className: "failure-domain",
        },
        {
          content: member.description,
          role: "cell",
          "aria-label": "描述",
          className: "description",
        },
        {
          content: canEditServerConfiguration() ? (
            <Button appearance="link" dense onClick={openMemberEdit}>
              {groupCount}
            </Button>
          ) : (
            groupCount
          ),
          role: "cell",
          className: "groups u-align--right",
          "aria-label": "分组",
        },
        {
          content: <ClusterMemberActions member={member} />,
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "操作",
        },
      ],
      sortData: {
        name: member.server_name.toLowerCase(),
        status: member.status.toLowerCase(),
        failureDomain: member.failure_domain.toLowerCase(),
        roles: member.roles,
        description: member.description?.toLowerCase(),
        groups: groupCount,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  return (
    <BaseLayout
      mainClassName="cluster-list"
      title={
        <HelpLink
          docPath="/explanation/clustering/"
          title="了解更多集群信息"
        >
          集群成员
        </HelpLink>
      }
    >
      <NotificationRow />
      <Row>
        <ScrollableTable
          dependencies={[members, notify.notification]}
          tableId="cluster-table"
          belowIds={["status-bar"]}
        >
          <TablePagination
            data={sortedRows}
            id="pagination"
            itemName="集群成员"
            className="u-no-margin--top"
            aria-label="表格分页控件"
          >
            <MainTable
              id="cluster-table"
              headers={headers}
              sortable
              responsive
              onUpdateSort={updateSort}
              emptyStateMsg={
                isLoading && (
                  <Spinner
                    className="u-loader"
                    text="正在加载集群成员..."
                  />
                )
              }
            />
          </TablePagination>
        </ScrollableTable>
      </Row>
    </BaseLayout>
  );
};

export default ClusterMemberList;
