import { describe, it, expect } from "vitest";
import {
  ipToNumber,
  numberToIp,
  calculateCidr,
  getSubnetMaskTable,
} from "../src/tools/dev/cidrUtils";

describe("IP & CIDR Calculator Utilities", () => {
  it("converts IP to 32-bit number and back accurately", () => {
    const num = ipToNumber("192.168.1.1");
    expect(numberToIp(num)).toBe("192.168.1.1");
  });

  it("calculates /24 standard CIDR subnet accurately", () => {
    const res = calculateCidr("192.168.1.100", 24);

    expect(res.isValid).toBe(true);
    expect(res.netmask).toBe("255.255.255.0");
    expect(res.wildcardMask).toBe("0.0.0.255");
    expect(res.networkAddress).toBe("192.168.1.0");
    expect(res.broadcastAddress).toBe("192.168.1.255");
    expect(res.firstUsableIp).toBe("192.168.1.1");
    expect(res.lastUsableIp).toBe("192.168.1.254");
    expect(res.usableHosts).toBe(254);
    expect(res.ipType).toContain("C 类私有保留网段");
  });

  it("calculates /16 and /30 subnets correctly", () => {
    const res16 = calculateCidr("10.0.50.1", 16);
    expect(res16.networkAddress).toBe("10.0.0.0");
    expect(res16.broadcastAddress).toBe("10.0.255.255");
    expect(res16.usableHosts).toBe(65534);

    const res30 = calculateCidr("192.168.0.1", 30);
    expect(res30.usableHosts).toBe(2);
  });

  it("generates full 0~32 subnet mask table", () => {
    const table = getSubnetMaskTable();
    expect(table.length).toBe(33);
    expect(table[24].netmask).toBe("255.255.255.0");
    expect(table[32].usableHosts).toBe(1);
  });
});
