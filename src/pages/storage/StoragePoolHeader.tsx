import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader from "components/RenameHeader";
import type { RenameHeaderValues } from "components/RenameHeader";
import type { LxdStoragePool } from "types/storage";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";
import { useNotify, useToastNotification } from "@canonical/react-components";
import * as Yup from "yup";
import { testDuplicateStoragePoolName } from "util/storagePool";
import { useFormik } from "formik";
import { renameStoragePool } from "api/storage-pools";
import ResourceLink from "components/ResourceLink";

interface Props {
  name: string;
  pool: LxdStoragePool;
  project: string;
}

const StoragePoolHeader: FC<Props> = ({ name, pool, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateStoragePoolName(project, controllerState))
      .required("该字段不能为空"),
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
      renameStoragePool(name, values.name)
        .then(() => {
          const url = `/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(values.name)}`;
          navigate(url);
          toastNotify.success(
            <>
              存储池 <strong>{name}</strong> 已重命名为{" "}
              <ResourceLink type="pool" value={values.name} to={url} />.
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

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link
          to={`/ui/project/${encodeURIComponent(project)}/storage/pools`}
          key={1}
        >
          存储池
        </Link>,
      ]}
      controls={[
        <DeleteStoragePoolBtn
          key="delete"
          pool={pool}
          project={project}
          shouldExpand
        />,
      ]}
      isLoaded
      renameDisabledReason="暂不支持重命名存储池"
    />
  );
};

export default StoragePoolHeader;
