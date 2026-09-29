import type { FC } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";

export interface IdpGroupFormValues {
  name: string;
}
export interface TLSIdentityFormValues {
  name: string;
  groups?: string[];
}

interface Props {
  formik: FormikProps<IdpGroupFormValues | TLSIdentityFormValues>;
}

const NameWithGroupForm: FC<Props> = ({ formik }) => {
  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="隐藏输入框" />
      <Input
        type="text"
        label="名称"
        required
        autoFocus
        id="name"
        name="name"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.name}
        error={formik.touched.name ? formik.errors.name : null}
        placeholder="请输入名称"
      />
    </Form>
  );
};

export default NameWithGroupForm;
