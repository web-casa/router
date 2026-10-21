# E1 recipe: DSA VLAN documentation check

## Status

E1 plan, not executed. Needs a real multi-port DSA device and managed switch.

## Environment required

- OpenWrt 25.12 DSA device with at least 3 ports.
- Managed switch for trunk/tagged testing.
- Console/serial access and a backup of `/etc/config/network`.
- Two clients (management + VLAN test).

## Steps

1. Record:
   ```sh
   ip -d link show
   uci show network
   bridge vlan show
   ```
2. Back up network config.
3. Add one `bridge-vlan` at a time; keep a management port untagged.
4. Reload network; verify `bridge vlan show`, management access, DHCP per VLAN.
5. Test the trunk peer and an access port.
6. Recover from an intentional wrong PVID via console (in a lab window only).

## Pass criteria

- Management remains reachable.
- Access/trunk VLANs match the design.
- PVID/tagged state is visible in `bridge vlan show`.
- Client gets the expected DHCP subnet.
- Rollback restores access without factory reset.

## Not covered

- Real hardware, switch model, CPU port, firewall/NAT for guest VLANs.
