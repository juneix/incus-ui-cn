import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import classnames from "classnames";
import { useInstanceLoading } from "context/instanceLoading";
import { Icon } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const InstanceStatusIcon: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const loadingType = instanceLoading.getType(instance);
  const labelMap: Record<string, string> = {
    Error: "错误",
    Frozen: "已冻结",
    Freezing: "冻结中",
    Ready: "就绪",
    Running: "运行中",
    Stopped: "已停止",
    Starting: "启动中",
    Stopping: "停止中",
    Restarting: "重启中",
    Migrating: "迁移中",
  };

  const getIconNameForStatus = (status: string) => {
    return (
      {
        Error: "status-failed-small",
        Frozen: "status-in-progress-small",
        Freezing: "spinner",
        Ready: "status-waiting-small",
        Running: "status-succeeded-small",
        Stopped: "status-queued-small",
      }[status] ?? ""
    );
  };

  return loadingType ? (
    <>
      <Icon className="u-animation--spin status-icon" name="spinner" />
      <i>{labelMap[loadingType] ?? loadingType}</i>
    </>
  ) : (
    <>
      <Icon
        name={getIconNameForStatus(instance.status)}
        className={classnames("status-icon", {
          "u-animation--spin": instance.status === "Freezing",
        })}
      />
      {labelMap[instance.status] ?? instance.status}
    </>
  );
};

export default InstanceStatusIcon;
