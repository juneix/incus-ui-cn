import type { FC } from "react";
import { Button, Icon, Label, Select } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkGARPField: FC<Props> = ({ formik }) => {
  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="gvrp">GARP 注册</Label>
      </div>
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
        {formik.values.readOnly ? (
          <>
            {(formik.values.gvrp?.length ?? 0 > 0)
              ? formik.values.gvrp === "true"
                ? "是"
                : "否"
              : "-"}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("gvrp");
              }}
              className="u-no-margin--bottom"
              type="button"
              appearance="base"
              title={formik.values.editRestriction ?? "编辑"}
              hasIcon
              disabled={!!formik.values.editRestriction}
            >
              <Icon name="edit" />
            </Button>
          </>
        ) : (
          <Select
            {...formik.getFieldProps("gvrp")}
            id={"gvrp"}
            options={[
              {
                label: "选择选项",
                value: "",
              },
              {
                label: "是",
                value: "true",
              },
              {
                label: "否",
                value: "false",
              },
            ]}
            help="使用 GARP VLAN 注册协议注册 VLAN"
          />
        )}
      </div>
    </div>
  );
};

export default NetworkGARPField;
