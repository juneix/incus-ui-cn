import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Spinner,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOSSecurity, updateOSSecurity } from "api/os";
import NotificationRow from "components/NotificationRow";
import OSYamlEditor from "components/forms/OSYamlEditor";
import type { YamlFormValues } from "components/forms/YamlForm";
import { queryKeys } from "util/queryKeys";
import { yamlToObject } from "util/yaml";

interface Props {
  target: string;
}

const OSSecurity: FC<Props> = ({ target }) => {
  const toastNotify = useToastNotification();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = useState(0);

  const {
    data: securityData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.osSecurity, target],
    queryFn: async () => fetchOSSecurity(target),
  });

  useEffect(() => {
    setEditorKey((k) => k + 1);
  }, [target]);

  const onSubmit = (
    values: YamlFormValues,
    handleSuccess: () => void,
    handleFailure: () => void,
  ) => {
    updateOSSecurity(
      JSON.stringify({ config: yamlToObject(values.yaml) }),
      target,
    )
      .then(() => {
        toastNotify.success(<>安全配置已更新</>);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.osSecurity, target],
        });
        handleSuccess();
      })
      .catch((e) => {
        toastNotify.failure("安全配置更新失败", e);
        handleFailure();
      });
  };

  if (error) {
    notify.failure("加载安全数据失败", error);
  }

  return (
    <>
      <NotificationRow />
      {isLoading && (
        <Spinner className="u-loader" text="正在加载安全数据..." />
      )}
      {!isLoading && !error && (
        <OSYamlEditor
          key={editorKey}
          yamlData={securityData}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default OSSecurity;
