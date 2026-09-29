import type { FC } from "react";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { poweroffOS } from "api/os";

interface Props {
  target: string;
}

const ShutdownOSBtn: FC<Props> = ({ target }) => {
  const toastNotify = useToastNotification();

  const handlePoweroff = () => {
    poweroffOS(target)
      .then(() => {
        toastNotify.success(<>操作系统正在关机</>);
      })
      .catch((e) => {
        toastNotify.failure("系统关机失败", e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      className="has-icon is-dense"
      confirmationModalProps={{
        title: "确认关机",
        children: <p>这将关闭该服务器系统</p>,
        onConfirm: handlePoweroff,
        confirmButtonLabel: "关机",
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="stop" />
    </ConfirmationButton>
  );
};

export default ShutdownOSBtn;
