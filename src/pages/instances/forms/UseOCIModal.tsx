import { FC } from "react";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LxdImageType, RemoteImage } from "types/image";

interface Props {
  close: () => void;
  onSelect: (image: RemoteImage, type?: LxdImageType) => void;
}

const UseOCIModal: FC<Props> = ({ close, onSelect }) => {
  const formik = useFormik({
    initialValues: {
      registry: "",
      image: "",
    },
    validationSchema: Yup.object().shape({
      registry: Yup.string().required("镜像仓库必填"),
      image: Yup.string().required("镜像名称必填"),
    }),
    onSubmit: (values) =>
      onSelect(
        {
          arch: "",
          created_at: new Date().getTime(),
          os: "",
          release: "",
          aliases: values.image,
          server: values.registry,
          protocol: "oci",
        },
        "container",
      ),
  });

  const handleCloseModal = () => {
    close();
  };

  return (
    <Modal close={close} className="use-oci-modal" title="使用 OCI 镜像">
      <Form onSubmit={formik.handleSubmit}>
        <Input
          {...formik.getFieldProps("registry")}
          id="registry"
          type="text"
          label="镜像仓库 (Registry)"
          placeholder="输入镜像仓库 URL"
          error={formik.touched.registry ? formik.errors.registry : null}
        />
        <Input
          {...formik.getFieldProps("image")}
          id="image"
          type="text"
          label="镜像名称 (Image)"
          placeholder="输入镜像名称"
          error={formik.touched.image ? formik.errors.image : null}
        />
      </Form>
      <footer className="p-modal__footer" id="modal-footer">
        <Button
          appearance="base"
          className="u-no-margin--bottom"
          type="button"
          onClick={handleCloseModal}
        >
          取消
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          loading={formik.isSubmitting}
          disabled={!formik.isValid}
          onClick={() => void formik.submitForm()}
        >
          确认
        </ActionButton>
      </footer>
    </Modal>
  );
};

export default UseOCIModal;
