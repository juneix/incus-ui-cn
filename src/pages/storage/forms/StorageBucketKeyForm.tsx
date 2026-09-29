import type { FC, ReactNode } from "react";
import { Form, Input, Select } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import type { LxdStorageBucket } from "types/storage";

export interface StorageBucketKeyFormValues {
  name: string;
  role?: string;
  description?: string;
  "access-key"?: string;
  "secret-key"?: string;
}

interface Props {
  formik: FormikProps<StorageBucketKeyFormValues>;
  bucket?: LxdStorageBucket;
}

const StorageBucketKeyForm: FC<Props> = ({ formik, bucket }) => {
  const { canEditBucket } = useStorageBucketEntitlements();
  const getFormProps = (
    id: "name" | "description" | "access-key" | "secret-key",
  ) => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder:
        id === "name"
          ? "输入名称"
          : id === "description"
            ? "输入描述"
            : id === "access-key"
              ? "输入访问密钥 (Access Key)"
              : "输入私有密钥 (Secret Key)",
    };
  };

  const isEditing = !!bucket;

  const bucketEditRestriction =
    !isEditing || canEditBucket(bucket)
      ? ""
      : "您没有权限编辑此存储桶";

  return (
    <Form onSubmit={formik.handleSubmit} className={"bucket-create-form"}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...getFormProps("name")}
        type="text"
        label="名称"
        required
        autoFocus
        disabled={!!bucketEditRestriction || isEditing}
        title={bucketEditRestriction}
      />
      <Select
        id="bucketKey"
        label="角色权限"
        onChange={(e) => {
          formik.setFieldValue("role", e.target.value);
        }}
        value={formik.values.role}
        options={[
          {
            label: "管理员 (Admin)",
            value: "admin",
          },
          {
            label: "只读 (Read-only)",
            value: "read-only",
          },
        ]}
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="描述"
        disabled={!!bucketEditRestriction}
        title={bucketEditRestriction}
      />
      <Input
        {...getFormProps("access-key")}
        type="text"
        label="Access Key (访问密钥)"
        disabled={!!bucketEditRestriction}
        title={bucketEditRestriction}
      />
      <Input
        {...getFormProps("secret-key")}
        type="text"
        label="Secret Key (私有密钥)"
        disabled={!!bucketEditRestriction}
        title={bucketEditRestriction}
      />
    </Form>
  );
};

export default StorageBucketKeyForm;
