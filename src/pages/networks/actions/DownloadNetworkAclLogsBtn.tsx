import type { FC } from "react";
import type { LxdNetworkAcl } from "types/network";
import {
  Button,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { fetchNetworkAclLog } from "api/network-acls";

interface Props {
  networkAcl: LxdNetworkAcl;
  project: string;
}

const DownloadNetworkAclLogsBtn: FC<Props> = ({ networkAcl, project }) => {
  const isSmallScreen = useIsScreenBelow();
  const toastNotify = useToastNotification();

  const startDownload = () => {
    fetchNetworkAclLog(networkAcl.name, project)
      .then((logData) => {
        const blob = new Blob([logData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const currentTime = new Date()
          .toISOString()
          .replaceAll(":", "-")
          .split(".")[0];
        const backupName = `${networkAcl.name}-${currentTime}.log`;

        const a = document.createElement("a");
        a.href = url;
        a.download = backupName;
        a.click();
        window.URL.revokeObjectURL(url);

        toastNotify.success(
          <>
            已开始下载网络 ACL{" "}
            <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
            的日志。
          </>,
        );
      })
      .catch((error) => {
        toastNotify.failure(
          `下载网络 ACL ${networkAcl.name} 的日志失败`,
          error,
        );
      });
  };

  return (
    <Button appearance="" type="button" onClick={startDownload} hasIcon>
      {!isSmallScreen && <Icon name="begin-downloading" />}
      <span>下载日志</span>
    </Button>
  );
};

export default DownloadNetworkAclLogsBtn;
