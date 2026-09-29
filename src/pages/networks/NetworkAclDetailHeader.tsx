import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import type { LxdNetworkAcl } from "types/network";
import { useNotify, useToastNotification } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import DeleteNetworkAclBtn from "pages/networks/actions/DeleteNetworkAclBtn";
import { useNetworkAclEntitlements } from "util/entitlements/network-acls";
import { renameNetworkAcl } from "api/network-acls";
import DownloadNetworkAclLogsBtn from "pages/networks/actions/DownloadNetworkAclLogsBtn";

interface Props {
  name: string;
  networkAcl?: LxdNetworkAcl;
  project: string;
}

const NetworkAclDetailHeader: FC<Props> = ({ name, networkAcl, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditNetworkAcl } = useNetworkAclEntitlements();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "已存在同名的网络 ACL",
        async (value) =>
          networkAcl?.name === value ||
          checkDuplicateName(value, project, controllerState, "network-acls"),
      )
      .required("ACL 名称为必填项"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameNetworkAcl(name, values.name, project)
        .then(() => {
          const url = `/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(values.name)}`;
          navigate(url);
          toastNotify.success(
            <>
              网络 ACL <strong>{name}</strong> 已重命名为{" "}
              <ResourceLink type="network-acl" value={values.name} to={url} />。
            </>,
          );
          formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("重命名失败", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const isUsed = (networkAcl?.used_by?.length ?? 0) > 0;

  const getRenameDisableReason = () => {
    if (!canEditNetworkAcl(networkAcl)) {
      return "您没有权限重命名此 ACL";
    }

    if (isUsed) {
      return "无法重命名，此 ACL 当前正在使用中。";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link
          to={`/ui/project/${encodeURIComponent(project)}/network-acls`}
          key={1}
        >
          网络 ACL
        </Link>,
      ]}
      renameDisabledReason={getRenameDisableReason()}
      controls={
        networkAcl && (
          <>
            <DownloadNetworkAclLogsBtn
              networkAcl={networkAcl}
              project={project}
            />
            <DeleteNetworkAclBtn networkAcl={networkAcl} project={project} />
          </>
        )
      }
      isLoaded={Boolean(networkAcl)}
      formik={formik}
    />
  );
};

export default NetworkAclDetailHeader;
