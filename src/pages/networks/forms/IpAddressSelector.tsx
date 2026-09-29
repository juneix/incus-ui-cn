import type { FC } from "react";
import { Input, RadioInput } from "@canonical/react-components";

interface Props {
  id: string;
  address?: string;
  setAddress: (address: string) => void;
  family: "IPv4" | "IPv6";
}

const IpAddressSelector: FC<Props> = ({ id, address, setAddress, family }) => {
  const isCustom = address !== "none" && address !== "auto";

  return (
    <>
      <div className="ip-address-selector">
        <RadioInput
          label="自动 (Auto)"
          checked={address === "auto"}
          onChange={() => {
            setAddress("auto");
          }}
        />
        <RadioInput
          label="无 (None)"
          checked={address === "none"}
          onChange={() => {
            setAddress("none");
          }}
        />
      </div>
      <div className="ip-address-selector ip-address-custom">
        <RadioInput
          label="自定义 (Custom)"
          aria-label="custom"
          checked={isCustom}
          onChange={() => {
            setAddress("");
          }}
        />
        <Input
          id={id}
          name={id}
          type="text"
          placeholder="输入 IP 地址"
          onChange={(e) => {
            setAddress(e.target.value);
          }}
          value={isCustom && address ? address : ""}
          disabled={!isCustom}
          help={
            <>
              请使用 CIDR 格式（例如 10.0.0.1/24）。
              <br />
              可设置为 <code>none</code> 禁用 {family}，或设为 <code>auto</code> 自动生成一个未使用的随机子网。
            </>
          }
        />
      </div>
    </>
  );
};

export default IpAddressSelector;
