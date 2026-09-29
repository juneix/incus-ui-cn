import { Button, Icon } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import type { FC } from "react";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  openPanel: () => void;
}

const CreateTlsIdentityBtn: FC<Props> = ({ openPanel }) => {
  const isSmallScreen = useIsScreenBelow();
  const { canCreateIdentities } = useServerEntitlements();

  return (
    <>
      <Button
        appearance="positive"
        className="u-float-right u-no-margin--bottom"
        onClick={openPanel}
        hasIcon={!isSmallScreen}
        title={
          canCreateIdentities()
            ? ""
            : "你没有权限创建身份"
        }
        disabled={!canCreateIdentities()}
      >
        {!isSmallScreen && <Icon name="plus" light />}
        <span>创建 TLS 身份</span>
      </Button>
    </>
  );
};

export default CreateTlsIdentityBtn;
