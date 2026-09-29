import { Notification } from "@canonical/react-components";
import type { FC } from "react";
import type { LxdProfile } from "types/profile";

interface Props {
  instanceProfiles: string[];
  profiles?: LxdProfile[];
}

const InstanceProfilesWarning: FC<Props> = ({ instanceProfiles, profiles }) => {
  const isMissingSomeProfiles = instanceProfiles.some(
    (profile) => !profiles?.find((p) => p.name === profile),
  );

  if (isMissingSomeProfiles) {
    return (
      <Notification severity="caution" title="权限受限">
        你没有权限查看应用于此实例的所有配置模板。这可能导致继承的配置值显示不正确。
      </Notification>
    );
  }

  return null;
};

export default InstanceProfilesWarning;
