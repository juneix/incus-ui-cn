import type { FC } from "react";
import { useEffect } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { useListener, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import type { FormikProps } from "formik";
import type { StoragePoolFormValues } from "./StoragePoolForm";
import {
  alletraDriver,
  cephDriver,
  cephFSDriver,
  cephObject,
  powerFlex,
  pureStorage,
  zfsDriver,
} from "util/storageOptions";
import {
  isAlletraIncomplete,
  isPowerflexIncomplete,
  isPureStorageIncomplete,
} from "util/storagePool";

export const MAIN_CONFIGURATION = "基础配置";
export const CEPH_CONFIGURATION = "Ceph";
export const CEPHFS_CONFIGURATION = "CephFS";
export const CEPHOBJECT_CONFIGURATION = "Ceph Object";
export const POWERFLEX = "Powerflex";
export const ZFS_CONFIGURATION = "ZFS";
export const YAML_CONFIGURATION = "YAML 配置";
export const PURE_STORAGE = "Pure Storage";
export const ALLETRA_CONFIGURATION = "HPE Alletra";

interface Props {
  active: string;
  setActive: (val: string) => void;
  formik: FormikProps<StoragePoolFormValues>;
  isSupportedStorageDriver: boolean;
}

const StoragePoolFormMenu: FC<Props> = ({
  formik,
  active,
  setActive,
  isSupportedStorageDriver,
}) => {
  const notify = useNotify();
  const menuItemProps = {
    active,
    setActive,
  };

  const isCephDriver = formik.values.driver === cephDriver;
  const isCephFSDriver = formik.values.driver === cephFSDriver;
  const isCephObjectDriver = formik.values.driver === cephObject;
  const isPowerFlexDriver = formik.values.driver === powerFlex;
  const isPureDriver = formik.values.driver === pureStorage;
  const isZfsDriver = formik.values.driver === zfsDriver;
  const isAlletraDriver = formik.values.driver === alletraDriver;
  const hasName = formik.values.name.length > 0;
  const getDisableReason = () => {
    if (!hasName) {
      return "请输入存储池名称以启用此部分";
    }
    if (isPowerflexIncomplete(formik)) {
      return "请输入 domain、gateway、pool 和用户名以启用此部分";
    }
    if (isPureStorageIncomplete(formik)) {
      return "请输入 API Token 和网关地址以启用此部分";
    }
    if (isAlletraIncomplete(formik)) {
      return "请输入地址、用户名、密码和通用配置组以启用此部分";
    }
    return undefined;
  };
  const disableReason = getDisableReason();

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useListener(window, resize, "resize", true);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="存储池表单导航">
        <ul className="p-side-navigation__list">
          {isSupportedStorageDriver && (
            <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          )}
          {isCephDriver && (
            <MenuItem
              label={CEPH_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isCephFSDriver && (
            <MenuItem
              label={CEPHFS_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isCephObjectDriver && (
            <MenuItem
              label={CEPHOBJECT_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isPowerFlexDriver && (
            <MenuItem
              label={POWERFLEX}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isPureDriver && (
            <MenuItem
              label={PURE_STORAGE}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isZfsDriver && (
            <MenuItem
              label={ZFS_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
          {isAlletraDriver && (
            <MenuItem
              label={ALLETRA_CONFIGURATION}
              {...menuItemProps}
              disableReason={disableReason}
            />
          )}
        </ul>
      </nav>
    </div>
  );
};

export default StoragePoolFormMenu;
