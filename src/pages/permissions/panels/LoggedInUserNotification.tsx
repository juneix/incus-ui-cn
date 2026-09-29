import { Notification } from "@canonical/react-components";
import Tag from "components/Tag";
import type { FC } from "react";

interface Props {
  isVisible: boolean;
}

const LoggedInUserNotification: FC<Props> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Notification
      severity="caution"
      title="修改当前身份"
      className="u-no-margin--bottom"
      id="current-user-warning"
    >
      此操作将修改当前登录身份的权限。
      <br />
      <Tag className="u-no-margin--left" isVisible={isVisible}>
        当前用户
      </Tag>{" "}
      执行后你可能无法再撤销此更改。
    </Notification>
  );
};

export default LoggedInUserNotification;
