import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useState } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import { createIdpGroup } from "api/auth-idp-groups";
import { testDuplicateIdpGroupName } from "util/permissionIdpGroups";
import type { IdpGroupFormValues } from "../forms/NameWithGroupForm";
import GroupSelection from "./GroupSelection";
import useEditHistory from "util/useEditHistory";
import ResourceLink from "components/ResourceLink";
import { useAuthGroups } from "context/useAuthGroups";
import NameWithGroupForm from "../forms/NameWithGroupForm";

interface GroupEditHistory {
  groupsAdded: Set<string>;
}

const CreateIdpGroupPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const { data: groups = [], error, isLoading } = useAuthGroups();

  const { desiredState, save: saveToPanelHistory } =
    useEditHistory<GroupEditHistory>({
      initialState: {
        groupsAdded: new Set(),
      },
    });

  if (error) {
    notify.failure("加载面板详情失败", error);
  }

  const modifyGroups = (newGroups: string[], isUnselectAll?: boolean) => {
    if (isUnselectAll) {
      saveToPanelHistory({
        groupsAdded: new Set(),
      });
    } else {
      saveToPanelHistory({
        groupsAdded: new Set(newGroups),
      });
    }
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const saveIdpGroup = (values: IdpGroupFormValues) => {
    const newGroup = {
      name: values.name,
      groups: Array.from(desiredState.groupsAdded),
    };

    formik.setSubmitting(true);
    createIdpGroup(newGroup)
      .then(() => {
        toastNotify.success(
          <>
            IDP 用户组{" "}
            <ResourceLink
              type="idp-group"
              value={values.name}
              to="/ui/permissions/idp-groups"
            />{" "}
            已创建。
          </>,
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.idpGroups],
        });
        closePanel();
      })
      .catch((e) => {
        notify.failure("创建 IDP 用户组失败", e);
      })
      .finally(() => {
        formik.setSubmitting(false);
      });
  };

  const groupSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateIdpGroupName(controllerState))
      .required("IDP 用户组名称不能为空"),
  });

  const formik = useFormik<IdpGroupFormValues>({
    initialValues: {
      name: "",
    },
    validationSchema: groupSchema,
    onSubmit: saveIdpGroup,
  });

  return (
    <SidePanel loading={isLoading} hasError={!groups}>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>创建 IDP 用户组</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <NameWithGroupForm formik={formik} />
      <p>用户组</p>
      <SidePanel.Content className="u-no-padding">
        <GroupSelection
          groups={groups}
          modifiedGroups={desiredState.groupsAdded}
          parentItemName=""
          selectedGroups={desiredState.groupsAdded}
          setSelectedGroups={modifyGroups}
          toggleGroup={(group: string) => {
            const newGroups = new Set([...desiredState.groupsAdded]);
            if (newGroups.has(group)) {
              newGroups.delete(group);
            } else {
              newGroups.add(group);
            }
            modifyGroups([...newGroups], newGroups.size === 0);
          }}
          scrollDependencies={[
            groups,
            desiredState.groupsAdded.size,
            notify.notification,
            formik,
          ]}
        />
      </SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        <Button
          appearance="base"
          onClick={closePanel}
          className="u-no-margin--bottom"
        >
          取消
        </Button>
        <ActionButton
          appearance="positive"
          onClick={() => void formik.submitForm()}
          className="u-no-margin--bottom"
          disabled={
            !formik.isValid || formik.isSubmitting || !formik.values.name
          }
          loading={formik.isSubmitting}
        >
          创建 IDP 用户组
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default CreateIdpGroupPanel;
