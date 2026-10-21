# E1 recipe: guest Wi-Fi documentation check

## Status

E1 plan, not executed. Needs Wi-Fi AP and (optionally) VLAN-capable switch.

## Environment required

- OpenWrt 25.12 device with Wi-Fi and multiple SSID support.
- Two clients: main LAN and guest.
- Console and rollback config.
- Optional: DSA/switch VLAN for stronger isolation.

## Steps

1. Create guest interface/subnet and DHCP.
2. Create guest firewall zone; allow guest→wan only.
3. Add guest SSID with `network='guest'`, WPA2/WPA3 and client isolation.
4. Verify guest gets guest subnet, can reach internet/DNS, cannot reach main LAN/LuCI/NAS.
5. Verify main LAN cannot initiate guest (per policy).
6. Disable guest SSID and confirm main LAN unaffected.

## Pass criteria

- Guest and main LAN are separate subnets.
- Guest cannot reach main LAN services.
- Guest internet/DNS works.
- Disabling guest does not break management.
- No claim without real wireless hardware.

## Not covered

- Real Wi-Fi radios, roaming, VLAN tagging, firewall hardware offload.
