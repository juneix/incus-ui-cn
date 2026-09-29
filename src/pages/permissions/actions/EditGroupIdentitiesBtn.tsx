import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { LxdAuthGroup } from "types/permissions";
import usePanelParams from "util/usePanelParams";

interface Props {
  groups: LxdAuthGroup[];
  className?: string;
}

const EditGroupIdentitiesBtn: FC<Props> = ({ groups, className }) => {
  const panelParams = usePanelParams();
  return (
    <>
      <Button
        onClick={() => {
          panelParams.openGroupIdentities();
        }}
        aria-label="管理身份"
        title="管理身份"
        className={className}
        disabled={!groups.length}
        hasIcon
      >
        <Icon name="user-group" />
        <span>管理身份</span>
      </Button>
    </>
  );
};

export default EditGroupIdentitiesBtn;
