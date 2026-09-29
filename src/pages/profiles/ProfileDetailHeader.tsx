import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteProfileBtn from "./actions/DeleteProfileBtn";
import type { LxdProfile } from "types/profile";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { renameProfile } from "api/profiles";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { useNotify, useToastNotification } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { useProfileEntitlements } from "util/entitlements/profiles";

interface Props {
  name: string;
  profile?: LxdProfile;
  project: string;
}

const ProfileDetailHeader: FC<Props> = ({ name, profile, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditProfile } = useProfileEntitlements();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "已存在同名的配置模板",
        async (value) =>
          profile?.name === value ||
          checkDuplicateName(value, project, controllerState, "profiles"),
      )
      .required("配置模板名称为必填项"),
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
      renameProfile(name, values.name, project)
        .then(() => {
          navigate(
            `/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(values.name)}`,
          );
          toastNotify.success(
            <>
              配置模板 <strong>{name}</strong> 已重命名为{" "}
              <ResourceLink
                type="profile"
                value={values.name}
                to={`/ui/project/${encodeURIComponent(project)}/profile/${encodeURIComponent(values.name)}`}
              />
              。
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

  const getRenameDisabledReason = () => {
    if (!canEditProfile(profile)) {
      return "您没有权限重命名此配置模板";
    }

    if (profile && profile.name === "default") {
      return "无法重命名默认配置模板";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link
          to={`/ui/project/${encodeURIComponent(project)}/profiles`}
          key={1}
        >
          配置模板
        </Link>,
      ]}
      renameDisabledReason={getRenameDisabledReason()}
      controls={
        profile && (
          <DeleteProfileBtn key="delete" profile={profile} project={project} />
        )
      }
      isLoaded={Boolean(profile)}
      formik={formik}
    />
  );
};

export default ProfileDetailHeader;
