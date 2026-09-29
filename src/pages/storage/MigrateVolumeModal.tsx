import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { Modal, Spinner } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchStoragePool } from "api/storage-pools";
import { useSettings } from "context/useSettings";
import { isClusteredServer } from "util/settings";
import BackLink from "components/BackLink";
import FormLink from "components/FormLink";
import CustomVolumeClusterMemberMigration from "./CustomVolumeClusterMemberMigration";
import CustomVolumeStoragePoolMigration from "./CustomVolumeStoragePoolMigration";
import type { LxdStorageVolume } from "types/storage";
import { isLocalPool } from "util/storagePool";
import { queryKeys } from "util/queryKeys";

interface Props {
  close: () => void;
  migrate: (
    targetPool: string | undefined,
    targetMember: string | undefined,
  ) => void;
  storageVolume: LxdStorageVolume;
}

const MigrateVolumeModal: FC<Props> = ({ close, migrate, storageVolume }) => {
  const { data: settings } = useSettings();
  const { data: pool, isLoading } = useQuery({
    queryKey: [queryKeys.storage, storageVolume.pool],
    queryFn: () => fetchStoragePool(storageVolume.pool),
  });

  const allowChooseMigrationType =
    isClusteredServer(settings) && isLocalPool(pool, settings);

  const [type, setType] = useState("");
  const [target, setTarget] = useState("");

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const handleGoBack = () => {
    // if incus is not clustered, we close the modal
    if (!allowChooseMigrationType) {
      close();
      return;
    }

    // if target is set, we are on the confirmation stage
    if (target) {
      setTarget("");
      return;
    }

    // if type is set, we are on migration target selection stage
    if (type) {
      setType("");
      return;
    }
  };

  const selectStepTitle = (
    <>
      为自定义存储卷 <strong>{storageVolume.name}</strong> 选择目标{type === "cluster member" ? "集群成员" : "存储池"}
    </>
  );

  const modalTitle = !type ? (
    "选择迁移方式"
  ) : (
    <>
      {allowChooseMigrationType && (
        <BackLink
          title={target ? "确认迁移" : selectStepTitle}
          onClick={handleGoBack}
          linkText={target ? `选择目标${type === "cluster member" ? "集群成员" : "存储池"}` : "选择迁移方式"}
        />
      )}
      {!allowChooseMigrationType &&
        (target ? "确认迁移" : selectStepTitle)}
    </>
  );

  return (
    <Modal
      close={close}
      className="migrate-instance-modal"
      title={modalTitle}
      onKeyDown={handleEscKey}
    >
      {isLoading && <Spinner className="u-loader" text="正在加载预览..." isMainComponent />}
      {!isLoading && allowChooseMigrationType && !type && (
        <div className="choose-migration-type">
          <FormLink
            icon="cluster-host"
            title="迁移自定义存储卷到其他集群成员"
            onClick={() => setType("cluster member")}
          />
          <FormLink
            icon="switcher-dashboard"
            title="迁移自定义存储卷到其他存储池"
            onClick={() => setType("storage pool")}
          />
        </div>
      )}

      {!isLoading && type === "cluster member" && (
        <CustomVolumeClusterMemberMigration
          storageVolume={storageVolume}
          targetMember={target}
          onSelect={setTarget}
          close={handleGoBack}
          migrate={migrate}
        />
      )}

      {/* If incus is not clustered, we always show storage pool migration table */}
      {!isLoading && (type === "storage pool" || !allowChooseMigrationType) && (
        <CustomVolumeStoragePoolMigration
          storageVolume={storageVolume}
          targetPool={target}
          onSelect={setTarget}
          close={handleGoBack}
          migrate={migrate}
        />
      )}
    </Modal>
  );
};

export default MigrateVolumeModal;
