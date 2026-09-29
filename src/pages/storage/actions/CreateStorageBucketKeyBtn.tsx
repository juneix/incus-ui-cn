import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import usePanelParams from "util/usePanelParams";

interface Props {
  className?: string;
}

const CreateStorageBucketKeyBtn: FC<Props> = ({ className }) => {
  const isSmallScreen = useIsScreenBelow();
  const { canCreateStorageBuckets } = useProjectEntitlements();
  const { project } = useCurrentProject();
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="positive"
      hasIcon={!isSmallScreen}
      onClick={() => {
        panelParams.openCreateStorageBucketKey(project?.name || "");
      }}
      className={className}
      disabled={!canCreateStorageBuckets(project)}
      title={
        canCreateStorageBuckets(project)
          ? "创建存储桶密钥"
          : "您没有权限为此存储桶创建密钥"
      }
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>创建密钥</span>
    </Button>
  );
};

export default CreateStorageBucketKeyBtn;
