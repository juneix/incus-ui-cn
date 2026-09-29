import type { FC } from "react";
import { useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import type { LxdAuthGroup } from "types/permissions";
import DeleteGroupModal from "./DeleteGroupModal";
import { pluralize } from "util/instanceBulkActions";
import { useGroupEntitlements } from "util/entitlements/groups";

interface Props {
  groups: LxdAuthGroup[];
  onDelete: () => void;
  className?: string;
}

const BulkDeleteGroupsBtn: FC<Props> = ({ groups, className, onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  const { canDeleteGroup } = useGroupEntitlements();
  const deletableGroups = groups.filter(canDeleteGroup);

  const handleConfirmDelete = () => {
    setConfirming(true);
  };

  const handleCloseConfirm = () => {
    onDelete();
    setConfirming(false);
  };

  return (
    <>
      <Button
        onClick={handleConfirmDelete}
        title={
          deletableGroups.length
            ? "删除用户组"
            : "你没有权限删除所选用户组"
        }
        className={className}
        hasIcon
        disabled={!deletableGroups.length}
      >
        <Icon name="delete" />
        <span>{`删除 ${groups.length} 个用户组`}</span>
      </Button>
      {confirming && (
        <DeleteGroupModal groups={groups} close={handleCloseConfirm} />
      )}
    </>
  );
};

export default BulkDeleteGroupsBtn;
