import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateClusterGroupPanel from "pages/cluster/panels/CreateClusterGroupPanel";
import { useServerEntitlements } from "util/entitlements/server";

const CreateClusterGroupBtn: FC = () => {
  const panelParams = usePanelParams();
  const { canEditServerConfiguration } = useServerEntitlements();

  const hasPermission = canEditServerConfiguration();

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom"
        disabled={!hasPermission}
        title={
          hasPermission
            ? undefined
            : "你没有权限创建集群分组"
        }
        hasIcon
        onClick={panelParams.openCreateClusterGroup}
      >
        <Icon name="plus" light />
        <span>创建分组</span>
      </Button>
      {panelParams.panel === panels.createClusterGroup && (
        <CreateClusterGroupPanel />
      )}
    </>
  );
};

export default CreateClusterGroupBtn;
