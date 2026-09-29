import type { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import StoragePoolSelector from "../StoragePoolSelector";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { useStorageBucketEntitlements } from "util/entitlements/storage-buckets";
import type { LxdStorageBucket } from "types/storage";

export interface StorageBucketFormValues {
  name: string;
  pool: string;
  size?: string;
  description?: string;
  target?: string;
}

interface Props {
  formik: FormikProps<StorageBucketFormValues>;
  bucket?: LxdStorageBucket;
}

const StorageBucketForm: FC<Props> = ({ formik, bucket }) => {
  const { canEditBucket } = useStorageBucketEntitlements();
  const getFormProps = (id: "name" | "description") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: id === "name" ? "输入名称" : "输入描述",
    };
  };

  const isEditing = !!bucket;

  const bucketEditRestriction =
    !isEditing || canEditBucket(bucket)
      ? ""
      : "您没有权限修改此存储桶";

  return (
    <Form onSubmit={formik.handleSubmit} className={"bucket-create-form"}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <StoragePoolSelector
        value={formik.values.pool}
        setValue={(value) => void formik.setFieldValue("pool", value)}
        invalidDrivers={[]}
        selectProps={{
          id: "bucket-create-pool",
          label: "存储池",
          disabled: !!bucketEditRestriction || isEditing,
          help: isEditing
            ? "存储桶所属存储池不可更改"
            : "",
        }}
      />

      <Input
        {...getFormProps("name")}
        type="text"
        label="名称"
        required
        disabled={!!bucketEditRestriction || isEditing}
        help={isEditing && "存储桶名称不可更改"}
        title={bucketEditRestriction}
      />

      <DiskSizeSelector
        label="大小"
        value={formik.values.size}
        setMemoryLimit={(val?: string) => {
          formik.setFieldValue("size", val);
        }}
        disabled={!!bucketEditRestriction}
        disabledReason={bucketEditRestriction}
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="描述"
        disabled={!!bucketEditRestriction}
        title={bucketEditRestriction}
      />
    </Form>
  );
};

export default StorageBucketForm;
