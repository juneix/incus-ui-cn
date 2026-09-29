import type { FC } from "react";
import type { IdpGroup } from "types/permissions";
import { pluralize } from "util/instanceBulkActions";
import { useDeleteIdpGroups } from "util/permissionIdpGroups";
import BulkDeleteButton from "components/BulkDeleteButton";

interface Props {
  idpGroups: IdpGroup[];
}

const BulkDeleteIdpGroupsBtn: FC<Props> = ({ idpGroups }) => {
  const { deletableIdpGroups, restrictedIdpGroups, deleteIdpGroups } =
    useDeleteIdpGroups(idpGroups);

  const getBulkDeleteBreakdown = () => {
    if (!restrictedIdpGroups.length) {
      return undefined;
    }

    return [
      `将删除 ${deletableIdpGroups.length} 个 IDP 用户组。`,
      `其中 ${restrictedIdpGroups.length} 个你无权删除的 IDP 用户组会被忽略。`,
    ];
  };

  return (
    <BulkDeleteButton
      entities={idpGroups}
      deletableEntities={deletableIdpGroups}
      entityType="IDP 用户组"
      onDelete={deleteIdpGroups}
      disabledReason={
        !deletableIdpGroups.length
          ? "你没有权限删除所选 IDP 用户组"
          : undefined
      }
      className="u-no-margin--bottom"
      buttonLabel={`删除 ${idpGroups.length} 个 IDP 用户组`}
      bulkDeleteBreakdown={getBulkDeleteBreakdown()}
    />
  );
};

export default BulkDeleteIdpGroupsBtn;
