import type { FC } from "react";
import { Col, Row } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import type { LxdClusterMember } from "types/cluster";
import ClusterMemberStatus from "pages/cluster/ClusterMemberStatus";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberOverview: FC<Props> = ({ member }) => {
  return (
    <Row className="general">
      <Col size={3}>
        <h2 className="p-heading--5">基本信息</h2>
      </Col>
      <Col size={7}>
        <table>
          <tbody>
            <tr>
              <th className="u-text--muted">服务器名称</th>
              <td>{member.server_name}</td>
            </tr>
            <tr>
              <th className="u-text--muted">描述</th>
              <td>{member.description || "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">状态</th>
              <td>
                <ClusterMemberStatus member={member} />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">消息</th>
              <td>{member.message}</td>
            </tr>
            <tr>
              <th className="u-text--muted">地址</th>
              <td>{member.url}</td>
            </tr>
            <tr>
              <th className="u-text--muted">角色</th>
              <td>{member.roles.join(", ")}</td>
            </tr>
            <tr>
              <th className="u-text--muted">分组</th>
              <td>
                {member.groups?.map((group) => (
                  <>
                    <ResourceLink
                      type="cluster-group"
                      value={group}
                      to="/ui/cluster/groups"
                      key={group}
                    />{" "}
                  </>
                )) ?? "-"}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">架构</th>
              <td>{member.architecture}</td>
            </tr>
            <tr>
              <th className="u-text--muted">故障域</th>
              <td>{member.failure_domain}</td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  );
};

export default ClusterMemberOverview;
