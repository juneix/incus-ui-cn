import type { FC } from "react";
import { ConfirmationButton, Icon } from "@canonical/react-components";
import type { IdpGroup } from "types/permissions";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";
import { useDeleteIdpGroups } from "util/permissionIdpGroups";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  idpGroup: IdpGroup;
}

const DeleteIdpGroupBtn: FC<Props> = ({ idpGroup }) => {
  const { canDeleteIdpGroup } = useIdpGroupEntitlements();
  const { isDeleting, deletableIdpGroups, deleteIdpGroups } =
    useDeleteIdpGroups([idpGroup]);

  return (
    <ConfirmationButton
      onHoverText={
        canDeleteIdpGroup(idpGroup)
          ? "删除 IDP 用户组"
          : "你没有权限删除该 IDP 用户组"
      }
      appearance="base"
      className="has-icon is-dense"
      aria-label="删除 IDP 用户组"
      type="button"
      disabled={!canDeleteIdpGroup(idpGroup)}
      shiftClickEnabled
      showShiftClickHint
      confirmationModalProps={{
        title: "确认删除 IDP 用户组",
        confirmButtonLabel: "删除",
        confirmButtonLoading: isDeleting,
        onConfirm: deleteIdpGroups,
        className: "permission-confirm-modal",
        children: (
          <p>
            确认要删除 IDP 用户组{" "}
            <ResourceLabel
              type="idp-group"
              value={deletableIdpGroups[0]?.name}
              bold
            />
            吗？
          </p>
        ),
      }}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteIdpGroupBtn;
