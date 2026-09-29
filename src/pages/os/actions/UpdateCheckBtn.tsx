import type { FC } from "react";
import {
  ActionButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { updateCheck } from "api/os";

interface Props {
  target: string;
}

const UpdateCheckBtn: FC<Props> = ({ target }) => {
  const toastNotify = useToastNotification();

  const handleUpdateCheck = () => {
    updateCheck(target)
      .then(() => {
        toastNotify.success(<>已检查更新</>);
      })
      .catch((e) => {
        toastNotify.failure("检查更新失败", e);
      });
  };

  return (
    <ActionButton
      appearance="base"
      className="has-icon is-dense"
      onClick={handleUpdateCheck}
      title="检查更新"
    >
      <Icon name="export" />
    </ActionButton>
  );
};

export default UpdateCheckBtn;
