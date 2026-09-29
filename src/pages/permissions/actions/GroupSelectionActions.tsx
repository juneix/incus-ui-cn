import type { FC } from "react";
import ModifiedStatusAction from "./ModifiedStatusAction";
import { ActionButton, Button } from "@canonical/react-components";

interface Props {
  modifiedGroups: Set<string>;
  undoChange: () => void;
  closePanel: () => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  actionText?: string;
  isEdit?: boolean;
}

const GroupSelectionActions: FC<Props> = ({
  modifiedGroups,
  undoChange,
  closePanel,
  onSubmit,
  loading,
  disabled,
  actionText,
  isEdit = false,
}) => {
  const confirmButtonText = modifiedGroups.size
    ? `保存 ${modifiedGroups.size} 处用户组变更`
    : "保存更改";

  return (
    <>
      {isEdit && modifiedGroups.size ? (
        <ModifiedStatusAction
          modifiedCount={modifiedGroups.size}
          onUndoChange={undoChange}
          itemName="group"
          actionText={actionText}
        />
      ) : null}
      <Button
        appearance="base"
        onClick={closePanel}
        className="u-no-margin--bottom"
      >
        取消
      </Button>
      <ActionButton
        appearance="positive"
        onClick={onSubmit}
        className="u-no-margin--bottom"
        disabled={disabled || loading}
        loading={loading}
      >
        {actionText ? "确认" : confirmButtonText}
      </ActionButton>
    </>
  );
};

export default GroupSelectionActions;
