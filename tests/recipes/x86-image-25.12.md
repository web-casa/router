# E2 recipe: choose and import an x86 OpenWrt image

## Status

E2 partial, run 2026-10-20 on PVE 9.2.2. BIOS/ext4 combined imported and booted; UEFI/squashfs/physical USB not tested.

## Environment

- PVE 9.2.2; OpenWrt 25.12.6 x86/64.
- Image: `openwrt-25.12.6-x86-64-generic-ext4-combined.img.gz` from TUNA; checksum compared to official sha256sums.
- VM 200: SeaBIOS, virtio-scsi, `scsi0`, boot order `scsi0`.

## Steps

1. List the image names and pick by boot mode/storage:
   - BIOS: `generic-ext4-combined.img.gz`
   - UEFI: `generic-ext4-combined-efi.img.gz`
   - squashfs variants exist; not tested here
2. Download and verify:
   ```sh
   curl -LO <image>
   curl -LO <sha256sums>
   grep '<image>' sha256sums | sha256sum -c -
   gzip -dk <image>.gz
   ```
3. Import into PVE:
   ```sh
   qm importdisk 200 <image>.img local-lvm
   qm set 200 --scsi0 local-lvm:vm-200-disk-0
   qm set 200 --boot order=scsi0
   qm start 200
   ```
4. Verify boot:
   ```sh
   ubus call system board
   cat /etc/openwrt_release
   ```
5. Physical write: only after `lsblk` verification; use correct `/dev/sdX` and EFI/non-EFI image.

## Pass criteria

- SHA-256 matches.
- Image type matches BIOS/UEFI.
- PVE boots from `scsi0`, not ISO/PXE.
- Version/target correct.
- Wrong disk is never written.

## Run log 2026-10-20

- `.img.gz` 13.0MB; decompressed `.img` 120.5MB; SHA-256 matched official.
- `qm importdisk` + `scsi0` + boot order `scsi0` booted OpenWrt 25.12.6 x86/64 on SeaBIOS.
- Not tested: UEFI/OVMF, squashfs, physical USB, Secure Boot.

## Safety

- `dd`/import overwrites the target; verify the device/VM ID.
- Do not use a rootfs image as a bootable disk.
- Keep a backup/console path.
