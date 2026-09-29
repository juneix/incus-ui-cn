import { Button, Icon } from "@canonical/react-components";
import type { FC } from "react";
import { getClientOS } from "util/helpers";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  modifiedCount: number;
  onUndoChange: () => void;
  itemName: string;
  actionText?: string;
}

const ModifiedStatusAction: FC<Props> = ({
  modifiedCount,
  onUndoChange,
  itemName,
  actionText,
}) => {
  const controlKey =
    getClientOS(navigator.userAgent) === "macos" ? "\u2318" : "ctrl";

  return (
    <div className="modified-actions">
      <div className="modified-status">
        <Icon name="status-in-progress-small" />
        <span>{`将${actionText ?? "修改"} ${modifiedCount} 个${itemName}`}</span>
      </div>
      <Button
        hasIcon
        className="u-no-margin--bottom"
        dense
        onClick={onUndoChange}
        title={`撤销最近的修改 (${controlKey}+z)`}
      >
        <Icon name="restart" />
        <span>撤销</span>
      </Button>
    </div>
  );
};

export default ModifiedStatusAction;
