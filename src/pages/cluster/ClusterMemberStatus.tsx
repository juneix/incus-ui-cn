import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import type { LxdClusterMember } from "types/cluster";
import { useMemberLoading } from "context/memberLoading";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberStatus: FC<Props> = ({ member }) => {
  const memberLoading = useMemberLoading();
  const loadingType = memberLoading.getType(member.server_name);

  if (loadingType) {
    return (
      <>
        <Icon className="u-animation--spin status-icon" name="spinner" />
        <i>{loadingType}</i>
      </>
    );
  }

  const statusLabel = {
    Evacuated: "已疏散",
    Online: "在线",
    Offline: "离线",
    Blocked: "已阻塞",
  };

  const getIconName = () => {
    return (
      {
        Evacuated: "status-queued-small",
        Online: "status-succeeded-small",
        Offline: "status-failed-small",
        Blocked: "status-waiting-small",
      }[member.status] ?? ""
    );
  };

  return (
    <>
      <Icon name={getIconName()} className="status-icon" />
      {statusLabel[member.status] ?? member.status}
    </>
  );
};

export default ClusterMemberStatus;
