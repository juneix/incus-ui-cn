import {
  ConfirmationModal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import { useState } from "react";
import type { LxdAuthGroup, LxdIdentity } from "types/permissions";
import { pivotIdentityGroupsChangeSummary } from "util/permissionIdentities";
import GroupsOrIdentityChangesTable from "./GroupOrIdentityChangesTable";
import {
  generateGroupAllocationsForIdentities,
  getChangesInGroupsForIdentities,
  getAddedOrRemovedIdentities,
} from "util/permissionGroups";
import usePanelParams from "util/usePanelParams";
import { useQueryClient } from "@tanstack/react-query";
import { updateIdentities } from "api/auth-identities";
import { queryKeys } from "util/queryKeys";
import ResourceLink from "components/ResourceLink";

interface Props {
  onConfirm: () => void;
  close: () => void;
  addedIdentities: Set<string>;
  removedIdentities: Set<string>;
  selectedGroups: LxdAuthGroup[];
  allIdentities: LxdIdentity[];
}

const GroupIdentitiesPanelConfirmModal: FC<Props> = ({
  onConfirm,
  close,
  addedIdentities,
  removedIdentities,
  selectedGroups,
  allIdentities,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const panelParams = usePanelParams();
  const queryClient = useQueryClient();
  const toastNotify = useToastNotification();

  const identityGroupsChangeSummary = getChangesInGroupsForIdentities(
    allIdentities,
    selectedGroups,
    addedIdentities,
    removedIdentities,
  );

  const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
    identityGroupsChangeSummary,
  );

  const handleSaveGroupsForIdentities = () => {
    setSubmitting(true);
    const modifiedIdentities = getAddedOrRemovedIdentities(
      allIdentities,
      addedIdentities,
      removedIdentities,
    );

    const newGroupsForIdentities = generateGroupAllocationsForIdentities(
      addedIdentities,
      removedIdentities,
      selectedGroups,
      modifiedIdentities,
    );

    const payload = modifiedIdentities.map((identity) => ({
      ...identity,
      groups: newGroupsForIdentities[identity.id],
    }));

    updateIdentities(payload)
      .then(() => {
        // modifying groups should invalidate both identities and groups api queries
        queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.authGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });

        const modifiedGroupNames = Object.keys(groupIdentitiesChangeSummary);
        const successMessage =
          modifiedGroupNames.length > 1 ? (
            `已更新 ${modifiedGroupNames.length} 个用户组的身份`
          ) : (
            <>
              已更新{" "}
              <ResourceLink
                type="auth-group"
                value={modifiedGroupNames[0]}
                to="/ui/permissions/groups"
              />
              {" "}的身份
            </>
          );

        toastNotify.success(successMessage);
        panelParams.clear();
        notify.clear();
      })
      .catch((e) => {
        notify.failure("更新身份分配失败", e);
      })
      .finally(() => {
        setSubmitting(false);
        onConfirm();
      });
  };

  return (
    <ConfirmationModal
      confirmButtonLabel="确认更改"
      confirmButtonAppearance="positive"
      onConfirm={handleSaveGroupsForIdentities}
      close={close}
      title="确认修改"
      className="permission-confirm-modal"
      confirmButtonLoading={submitting}
    >
      <GroupsOrIdentityChangesTable
        identityGroupsChangeSummary={identityGroupsChangeSummary}
        groupIdentitiesChangeSummary={groupIdentitiesChangeSummary}
        identities={allIdentities}
        initialGroupBy="group"
      />
    </ConfirmationModal>
  );
};

export default GroupIdentitiesPanelConfirmModal;
