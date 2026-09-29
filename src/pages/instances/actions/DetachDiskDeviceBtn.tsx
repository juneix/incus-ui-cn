import type { FC } from "react";
import { ConfirmationButton, Icon } from "@canonical/react-components";

interface Props {
  onDetach: () => void;
  disabledReason?: string;
}

const DetachDiskDeviceBtn: FC<Props> = ({ onDetach, disabledReason }) => {
  return (
    <ConfirmationButton
      appearance="base"
      type="button"
      title={disabledReason ?? "卸载磁盘"}
      className="has-icon u-no-margin--bottom is-dense"
      confirmationModalProps={{
        title: "确认卸载磁盘",
        children: (
          <p>
            确定要移除该磁盘挂载吗？
            <br />
            如果磁盘仍处于挂载状态，此操作可能会导致数据丢失。
          </p>
        ),
        confirmButtonLabel: "卸载",
        onConfirm: onDetach,
      }}
      shiftClickEnabled
      showShiftClickHint
      disabled={!!disabledReason}
    >
      <Icon name="disconnect" />
      <span>卸载</span>
    </ConfirmationButton>
  );
};

export default DetachDiskDeviceBtn;
