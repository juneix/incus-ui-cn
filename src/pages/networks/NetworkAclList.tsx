import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import PageHeader from "components/PageHeader";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import { useNetworkAcls } from "context/useNetworkAcls";
import DocLink from "components/DocLink";

const NetworkAclList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const { project: currentProject } = useCurrentProject();
  const { canCreateNetworkAcls } = useProjectEntitlements();

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: networkAcls = [], error, isLoading } = useNetworkAcls(project);

  useEffect(() => {
    if (error) {
      notify.failure("加载 ACL 失败", error);
    }
  }, [error]);

  const headers = [
    { content: "名称", sortKey: "name" },
    { content: "描述", sortKey: "description" },
    {
      content: "入站规则",
      sortKey: "ingress",
      className: "u-align--right",
    },
    { content: "出站规则", sortKey: "egress", className: "u-align--right" },
    { content: "被使用次数", sortKey: "usedBy", className: "u-align--right" },
  ];

  const rows = networkAcls.map((acl) => {
    return {
      columns: [
        {
          content: (
            <Link
              to={`/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(acl.name)}`}
            >
              {acl.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "名称",
        },
        {
          content: acl.description,
          role: "cell",
          "aria-label": "描述",
        },
        {
          content: acl.ingress.length,
          role: "cell",
          "aria-label": "入站规则",
          className: "u-align--right",
        },
        {
          content: acl.egress.length,
          role: "cell",
          "aria-label": "出站规则",
          className: "u-align--right",
        },
        {
          content: (acl.used_by ?? []).length,
          role: "cell",
          "aria-label": "被使用次数",
          className: "u-align--right",
        },
      ],
      sortData: {
        name: acl.name.toLowerCase(),
        description: acl.description?.toLowerCase(),
        ingress: acl.ingress.length,
        egress: acl.egress.length,
        usedBy: acl.used_by?.length ?? 0,
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  const createAclButton = (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      hasIcon
      onClick={async () =>
        navigate(
          `/ui/project/${encodeURIComponent(project)}/network-acls/create`,
        )
      }
      disabled={!canCreateNetworkAcls(currentProject)}
      title={
        canCreateNetworkAcls(currentProject)
          ? ""
          : "您没有权限在此项目中创建 ACL"
      }
    >
      <Icon name="plus" light />
      <span>创建 ACL</span>
    </Button>
  );

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/howto/network_acls/"
                title="了解更多关于网络 ACL 的信息"
              >
                网络 ACL
              </HelpLink>
            </PageHeader.Title>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            {networkAcls.length > 0 && createAclButton}
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {networkAcls.length > 0 && (
          <MainTable
            headers={headers}
            rows={rows}
            responsive
            sortable
            emptyStateMsg="暂无数据"
          />
        )}
        {!isLoading && networkAcls.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="未找到网络 ACL"
          >
            <p>当前项目中没有网络 ACL。</p>
            <p>
              <DocLink docPath="/howto/network_acls/" hasExternalIcon>
                了解更多关于网络 ACL 的信息
              </DocLink>
            </p>
            {createAclButton}
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkAclList;
