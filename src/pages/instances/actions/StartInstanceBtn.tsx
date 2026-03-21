import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useInstanceStart } from "util/instanceStart";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
}

const StartInstanceBtn: FC<Props> = ({ instance }) => {
  const { handleStart, isLoading, isDisabled } = useInstanceStart(instance);
  const { canUpdateInstanceState } = useInstanceEntitlements();

  return (
    <Button
      appearance="base"
      hasIcon
      dense={true}
      disabled={isDisabled || !canUpdateInstanceState(instance)}
      onClick={handleStart}
      type="button"
      aria-label={isLoading ? "启动中" : "启动"}
      title={
        canUpdateInstanceState(instance)
          ? "启动"
          : "你没有启动此实例的权限"
      }
    >
      <Icon
        className={classnames({ "u-animation--spin": isLoading })}
        name={isLoading ? "spinner" : "play"}
      />
    </Button>
  );
};

export default StartInstanceBtn;
