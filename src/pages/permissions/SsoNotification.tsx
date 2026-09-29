import type { FC } from "react";
import { useState } from "react";
import { Notification } from "@canonical/react-components";
import DocLink from "components/DocLink";

const loadClosed = () => {
  const saved = localStorage.getItem("ssoNotificationClosed");
  return Boolean(saved);
};

const saveClosed = () => {
  localStorage.setItem("ssoNotificationClosed", "yes");
};

interface Props {
  hasOidc: boolean;
}

const SsoNotification: FC<Props> = ({ hasOidc }: Props) => {
  const [closed, setClosed] = useState(loadClosed());

  if (closed || hasOidc) {
    return null;
  }

  const handleClose = () => {
    saveClosed();
    setClosed(true);
  };

  return (
    <>
      <Notification
        severity="information"
        title="您知道吗？"
        onDismiss={handleClose}
        actions={[
          <DocLink docPath="/howto/oidc/" key="sso-doc-link">
            查看说明
          </DocLink>,
        ]}
      >
        Incus 可以配置为使用单点登录 (SSO) 提供方进行登录。
      </Notification>
    </>
  );
};

export default SsoNotification;
