import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Icon,
  Input,
  Label,
  Notification,
  RadioInput,
  Row,
  useListener,
  useNotify,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import * as Yup from "yup";
import type { LxdNetwork, LxdNetworkLoadBalancer } from "types/network";
import { updateMaxHeight } from "util/updateMaxHeight";
import { testValidIp, testValidPort } from "util/networks";
import NotificationRow from "components/NotificationRow";
import type { NetworkLoadBalancerBackendFormValues } from "pages/networks/forms/NetworkLoadBalancerFormBackends";
import type { NetworkLoadBalancerPortFormValues } from "pages/networks/forms/NetworkLoadBalancerFormPorts";
import NetworkLoadBalancerFormBackends from "pages/networks/forms/NetworkLoadBalancerFormBackends";
import NetworkLoadBalancerFormPorts from "pages/networks/forms/NetworkLoadBalancerFormPorts";
import ScrollableForm from "components/ScrollableForm";
import { focusField } from "util/formFields";
import { bridgeType, ovnType } from "util/networks";

export const toNetworkLoadBalancer = (
  values: NetworkLoadBalancerFormValues,
): LxdNetworkLoadBalancer => {
  return {
    listen_address: values.listenAddress,
    description: values.description,
    ports: values.ports.map((port) => ({
      listen_port: port.listenPort?.toString(),
      protocol: port.protocol,
      target_backend: port.targetBackend
        ?.toString()
        .split(",")
        .map((item) => item.trim()),
    })),
    backends: values.backends.map((backend) => ({
      name: backend.name,
      target_address: backend.targetAddress?.toString(),
      target_port: backend.targetPort?.toString(),
    })),
  };
};

export const NetworkLoadBalancerSchema = Yup.object().shape({
  listenAddress: Yup.string()
    .test("valid-ip", "IP 地址无效", testValidIp)
    .required("监听地址为必填项"),
  ports: Yup.array().of(
    Yup.object().shape({
      listenPort: Yup.string()
        .test("valid-port", "端口号无效", testValidPort)
        .required("监听端口为必填项"),
      protocol: Yup.string().required("协议为必填项"),
      targetBackend: Yup.string().required("目标后端为必填项"),
    }),
  ),
  backends: Yup.array().of(
    Yup.object().shape({
      targetAddress: Yup.string()
        .test("valid-ip", "IP 地址无效", testValidIp)
        .required("目标地址为必填项"),
      targetPort: Yup.string().test(
        "valid-port",
        "端口号无效",
        testValidPort,
      ),
    }),
  ),
});

export interface NetworkLoadBalancerFormValues {
  listenAddress: string;
  description?: string;
  backends: NetworkLoadBalancerBackendFormValues[];
  ports: NetworkLoadBalancerPortFormValues[];
  location?: string;
}

interface Props {
  formik: FormikProps<NetworkLoadBalancerFormValues>;
  isEdit?: boolean;
  network?: LxdNetwork;
}

const NetworkLoadBalancerForm: FC<Props> = ({ formik, isEdit, network }) => {
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useListener(window, updateFormHeight, "resize", true);

  const addBackend = () => {
    formik.setFieldValue("backends", [...formik.values.backends, {}]);

    const name = `backends.${formik.values.backends.length}.name`;
    focusField(name);
  };

  const addPort = () => {
    formik.setFieldValue("ports", [
      ...formik.values.ports,
      {
        protocol: "tcp",
      },
    ]);

    const name = `ports.${formik.values.ports.length}.listenPort`;
    focusField(name);
  };

  return (
    <Form
      className="form network-load-balancers-form"
      onSubmit={formik.handleSubmit}
    >
      <Row className="form-contents">
        <Col size={12}>
          <ScrollableForm>
            {/* hidden submit to enable enter key in inputs */}
            <Input type="submit" hidden value="Hidden input" />
            <Row className="p-form__group p-form-validation">
              <NotificationRow />
              <Notification
                severity="information"
                title="网络信息"
                titleElement="h2"
              >
                名称: {network?.name}
                <br />
                {network?.config["ipv4.address"] && (
                  <>
                    IPv4: {network?.config["ipv4.address"]}
                    <br />
                  </>
                )}
                {network?.config["ipv6.address"] && (
                  <>IPv6: {network?.config["ipv6.address"]}</>
                )}
              </Notification>
            </Row>
            <Row>
              <Col size={4}>
                <Label forId="listenAddress">监听地址</Label>
              </Col>
              <Col size={8}>
                <Input
                  {...formik.getFieldProps("listenAddress")}
                  id="listenAddress"
                  type="text"
                  placeholder="输入 IP 地址"
                  autoFocus
                  required
                  disabled={isEdit}
                  help={
                    isEdit
                      ? "创建后无法修改监听地址。"
                      : "任何路由至 Incus 的地址。"
                  }
                  error={
                    formik.touched.listenAddress
                      ? formik.errors.listenAddress
                      : undefined
                  }
                />
              </Col>
            </Row>
            <Input
              {...formik.getFieldProps("description")}
              id="description"
              type="text"
              label="描述"
              placeholder="输入描述"
              stacked
            />
            {formik.values.backends.length > 0 && (
              <NetworkLoadBalancerFormBackends
                formik={formik}
                network={network}
              />
            )}
            <Row>
              <Col size={12}>
                <Button hasIcon onClick={addBackend} type="button">
                  <Icon name="plus" />
                  <span>添加后端</span>
                </Button>
              </Col>
            </Row>
            {formik.values.ports.length > 0 && (
              <NetworkLoadBalancerFormPorts formik={formik} network={network} />
            )}
            <Row>
              <Col size={12}>
                <Button hasIcon onClick={addPort} type="button">
                  <Icon name="plus" />
                  <span>添加端口</span>
                </Button>
              </Col>
            </Row>
          </ScrollableForm>
        </Col>
      </Row>
    </Form>
  );
};

export default NetworkLoadBalancerForm;
