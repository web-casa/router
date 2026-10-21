# E2 recipe: no LuCI access recovery

## Status

E2 partial, run 2026-10-20: uhttpd stop/start and SSH retention verified; firewall/port/failsafe not tested. Use a lab device with console access; do not factory-reset a production device.

## Environment

- OpenWrt 25.12.6 lab device/VM; LAN client; console (serial/video) available.
- Known baseline LAN address and password.

## Scenarios

1. Client has no DHCP lease (static address test).
2. `uhttpd` stopped (ping works, HTTP fails, SSH works).
3. LAN address changed (console/failsafe recovery).

## Steps

1. Record baseline:
   ```sh
   ip addr show
   ip route
   curl -v http://<lan-ip>/
   ssh root@<lan-ip>
   ```
2. Scenario 1: remove the client DHCP lease, set a static address in the LAN subnet, verify `ping`, HTTP and SSH.
3. Scenario 2: over SSH:
   ```sh
   /etc/init.d/uhttpd stop
   netstat -lnp | grep -E ':80|:443'
   ```
   Confirm ping still works and HTTP fails; restart:
   ```sh
   /etc/init.d/uhttpd start
   curl -v http://<lan-ip>/
   ```
4. Scenario 3 (lab only): from the console, change the LAN IP, commit, reboot; verify the old address fails and the new address works. Restore it afterward.
5. Record the recovery path for each scenario and whether a factory reset was needed.

## Pass criteria

- The failing layer is identified without changing unrelated config.
- A static client/console/SSH recovery works.
- No factory reset is needed for scenarios 1–3.
- The device returns to the baseline LAN/HTTP/SSH state.

## Safety

- Keep console access throughout.
- Back up `/etc/config/network` and `/etc/config/dhcp`.
- Do not run `firstboot` as a diagnostic.
- Do not scan networks you do not own.

## Run log 2026-10-20

- Environment: OpenWrt 25.12.6 x86 VM 200; LAN 192.168.1.2; HTTP checked from PVE host.
- `uhttpd stop`: `http=000` (connection failed); SSH still worked.
- `uhttpd start`: `http=200`.
- Not tested: firewall drop, port change, LuCI package removal, serial/failsafe sequence.
