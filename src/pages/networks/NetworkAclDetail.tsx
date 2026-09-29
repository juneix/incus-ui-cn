import type { FC } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import {
  Row,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import NetworkAclDetailHeader from "pages/networks/NetworkAclDetailHeader";
import EditNetworkAcl from "pages/networks/forms/EditNetworkAcl";
import { useNetworkAcl } from "context/useNetworkAcls";

const NetworkAclDetail: FC = () => {
  const notify = useNotify();

  const { name, project } = useParams<{
    name: string;
    project: string;
  }>();

  if (!name) {
    return <>缺少名称参数</>;
  }

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: networkAcl, error, isLoading } = useNetworkAcl(name, project);

  useEffect(() => {
    if (error) {
      notify.failure("加载 ACL 失败", error);
    }
  }, [error]);

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  return (
    <CustomLayout
      header={
        <NetworkAclDetailHeader
          networkAcl={networkAcl}
          project={project}
          name={name}
        />
      }
      contentClassName="edit-network-acl"
    >
      <Row>
        <NotificationRow />
        {networkAcl && (
          <EditNetworkAcl networkAcl={networkAcl} project={project} />
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkAclDetail;
