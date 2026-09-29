import {
  ConfirmationModal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import { useState } from "react";
import type { LxdIdentity } from "types/permissions";
import {
  generateGroupAllocationsForIdentities,
  getChangesInGroupsForIdentities,
  pivotIdentityGroupsChangeSummary,
} from "util/permissionIdentities";
import GroupsOrIdentityChangesTable from "./GroupOrIdentityChangesTable";
import { updateIdentities } from "api/auth-identities";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import ResourceLink from "components/ResourceLink";

interface Props {
  onConfirm: () => void;
  close: () => void;
  selectedIdentities: LxdIdentity[];
  addedGroups: Set<string>;
  removedGroups: Set<string>;
}

const IdentityGroupsPanelConfirmModal: FC<Props> = ({
  onConfirm,
  close,
  addedGroups,
  removedGroups,
  selectedIdentities,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();
  const panelParams = usePanelParams();
  const queryClient = useQueryClient();
  const toastNotify = useToastNotification();

  const identityGroupsChangeSummary = getChangesInGroupsForIdentities(
    selectedIdentities,
    addedGroups,
    removedGroups,
  );

  const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
    identityGroupsChangeSummary,
  );

  const handleSaveGroupsForIdentities = () => {
    setSubmitting(true);

    const newGroupsForIdentities = generateGroupAllocationsForIdentities(
      addedGroups,
      removedGroups,
      selectedIdentities,
    );

    const payload = selectedIdentities.map((identity) => ({
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

        const modifiedGroupNames = Object.keys(identityGroupsChangeSummary);
        const successMessage =
          modifiedGroupNames.length > 1 ? (
            `已更新 ${modifiedGroupNames.length} 个身份的用户组`
          ) : (
            <>
              已更新{" "}
              <ResourceLink
                type="oidc-identity"
                value={modifiedGroupNames[0]}
                to="/ui/permissions/identities"
              />
              {" "}的用户组
            </>
          );

        toastNotify.success(successMessage);
        panelParams.clear();
        notify.clear();
      })
      .catch((e) => {
        notify.failure("更新用户组失败", e);
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
        identities={selectedIdentities}
        initialGroupBy="identity"
      />
    </ConfirmationModal>
  );
};

export default IdentityGroupsPanelConfirmModal;
