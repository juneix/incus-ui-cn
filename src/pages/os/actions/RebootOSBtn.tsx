import type { FC } from "react";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { rebootOS } from "api/os";

interface Props {
  target: string;
}

const RebootOSBtn: FC<Props> = ({ target }) => {
  const toastNotify = useToastNotification();

  const handleReboot = () => {
    rebootOS(target)
      .then(() => {
        toastNotify.success(<>操作系统正在重启。</>);
      })
      .catch((e) => {
        toastNotify.failure("系统重启失败", e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      loading={false}
      className="has-icon is-dense"
      confirmationModalProps={{
        title: "确认重启",
        children: <p>这将重启该服务器系统</p>,
        onConfirm: handleReboot,
        confirmButtonLabel: "重启",
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="restart" />
    </ConfirmationButton>
  );
};

export default RebootOSBtn;
