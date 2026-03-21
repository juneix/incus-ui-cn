import type { FC } from "react";
import { humanFileSize } from "util/helpers";
import type { MemoryUsage } from "util/metricSelectors";
import Meter from "components/Meter";

interface Props {
  memory?: MemoryUsage;
}

const InstanceUsageMemory: FC<Props> = ({ memory }) => {
  if (!memory) {
    return "";
  }

  const used = memory.total - memory.free - memory.cached;

  return (
    <div>
      <Meter
        percentage={(100 / memory.total) * used}
        secondaryPercentage={(100 / memory.total) * memory.cached}
        text={
          humanFileSize(memory.total - memory.free) +
          " / " +
          humanFileSize(memory.total)
        }
        hoverText={
          `空闲：${humanFileSize(memory.free)}\n` +
          `已用：${humanFileSize(used)}\n` +
          `缓存：${humanFileSize(memory.cached)}\n`
        }
      />
    </div>
  );
};

export default InstanceUsageMemory;
