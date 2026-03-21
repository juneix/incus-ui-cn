import type { FC } from "react";
import { ConfirmationModal } from "@canonical/react-components";

interface Props {
  onConfirm: () => void;
  close: () => void;
}

const YamlConfirmation: FC<Props> = ({ onConfirm, close }) => {
  return (
    <ConfirmationModal
      confirmButtonLabel="不保存并离开"
      cancelButtonLabel="继续编辑"
      onConfirm={onConfirm}
      close={close}
      title="确认"
    >
      <p>
        切换回引导式表单后，YAML 编辑器中的所有更改都会被丢弃。
        <br />
        你确定要继续吗？
      </p>
    </ConfirmationModal>
  );
};

export default YamlConfirmation;
