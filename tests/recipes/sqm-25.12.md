# E2/E3 recipe: SQM + CAKE on OpenWrt 25.12

## Status

E2 partial, run 2026-10-20: CAKE qdisc attach/stop verified in a VM. No real-line throughput/latency; E3 data still pending.

## Environment

- OpenWrt 25.12.6 on the **main router/NAT gateway**; `sqm-scripts 1.7.2`.
- Real WAN line (not a PVE virtual NIC); record ISP plan, measured idle/loaded throughput and CPU model.
- Console/LuCI access; backup of `/etc/config/sqm` and `/etc/config/network`.

## Safety

- Start with a conservative rate (85%–95% of measured throughput); do not use the advertised plan rate.
- Keep a management path that does not depend on SQM.
- Record CPU usage; CAKE can saturate a weak router.
- Do not claim E2/E3 from a VM or from a single ping.

## Steps

1. Baseline: `ping -c 20 1.1.1.1`, `ping -c 20 <gateway>`, `top -bn1`, record WAN interface and current `tc -s qdisc show dev wan`.
2. Install:
   ```sh
   apk update
   apk add sqm-scripts luci-app-sqm
   ```
3. Configure `wan`, download/upload, `cake`, `piece_of_cake.qos`, correct link layer/overhead. Use LuCI or the actual `sqm` section from `uci show sqm`.
4. Restart SQM:
   ```sh
   /etc/init.d/sqm restart
   tc -s qdisc show dev wan
   logread -e sqm | tail -30
   ```
5. Idle verification: record ping min/avg/max/mdev and loss.
6. Loaded verification: saturate download and upload separately while pinging; record latency/loss/throughput and CPU.
7. Disable and compare:
   ```sh
   uci set sqm.@queue[0].enabled='0'
   uci commit sqm
   /etc/init.d/sqm restart
   ```
8. Re-enable and repeat once to check stability.

## Pass criteria

- `cake`/`fq_codel` is attached to the WAN interface; SQM logs have no errors.
- Loaded latency and loss improve versus the no-SQM baseline, without unacceptable throughput loss.
- CPU does not stay saturated.
- Disable/restore returns the line to the previous state.
- All numbers are from the recorded real line, not a VM.

## Result table

| Item | Baseline (no SQM) | SQM/CAKE | Notes |
|---|---|---|---|
| Idle ping avg/max | | | |
| Download-loaded ping avg/max | | | |
| Upload-loaded ping avg/max | | | |
| Loss under load | | | |
| Download/upload Mbps | | | |
| Router CPU (one core) | | | |
| WAN interface / link layer | | | |
| OpenWrt / sqm-scripts version | | | |

## Findings

- Pending real-router run.

## Run log 2026-10-20

- Environment: OpenWrt 25.12.6 x86 VM 200; WAN eth1 DHCP 192.168.50.158/24.
- Packages: sqm-scripts 1.7.2-r1, luci-app-sqm.
- Config: eth1, 100000/20000 Kbps, piece_of_cake.qos, cake.
- Start: success; `tc -s qdisc show dev eth1` showed cake 20Mbit.
- Stop: restored fq_codel.
- No real-line throughput/latency; do not claim performance.
