#!/usr/bin/env bash
# Bootstrap a temporary, read-only SSH account for documentation work.
# Run as root on the PVE host. Requires: PUBKEY env var with an ssh-ed25519 public key.
set -euo pipefail

PUBKEY="${PUBKEY:-}"
if [[ -z "$PUBKEY" ]]; then
  echo "PUBKEY is required" >&2
  exit 1
fi
if [[ "$PUBKEY" != ssh-ed25519\ * && "$PUBKEY" != ssh-rsa\ * ]]; then
  echo "PUBKEY must start with ssh-ed25519 or ssh-rsa" >&2
  exit 1
fi
if [[ "$(id -u)" -ne 0 ]]; then
  echo "run as root" >&2
  exit 1
fi
if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is missing" >&2
  exit 1
fi

USER_NAME="docsread"
WRAPPER="/usr/local/sbin/pve-docs-readonly"
SUDOERS="/etc/sudoers.d/pve-docs-readonly"
SSHD="/etc/ssh/sshd_config"
BACKUP="${SSHD}.bak.pve-docs.$(date +%s)"

if ! id "$USER_NAME" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$USER_NAME"
fi
passwd -l "$USER_NAME" >/dev/null 2>&1 || true

install -d -m 700 -o "$USER_NAME" -g "$USER_NAME" "/home/$USER_NAME/.ssh"
printf 'restrict %s\n' "$PUBKEY" > "/home/$USER_NAME/.ssh/authorized_keys"
chown "$USER_NAME:$USER_NAME" "/home/$USER_NAME/.ssh/authorized_keys"
chmod 600 "/home/$USER_NAME/.ssh/authorized_keys"

cat > "$WRAPPER" <<'WRAPPER'
#!/usr/bin/env bash
set -u
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
echo "# PVE read-only report"
echo "generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "## host"
hostname 2>/dev/null || true
echo "## pveversion"
pveversion -v 2>&1 || true
echo "## links"
ip -br link 2>&1 || true
echo "## addresses"
ip -br addr 2>&1 || true
echo "## interfaces"
cat /etc/network/interfaces 2>&1 || true
echo "## bridges"
bridge link 2>&1 || true
echo "## vms"
qm list 2>&1 || true
echo "## containers"
pct list 2>&1 || true
echo "## disks"
lsblk -o NAME,SIZE,TYPE,MODEL 2>&1 || true
echo "## ethernet"
lspci 2>/dev/null | grep -iE 'ethernet|network controller' || true
WRAPPER
chown root:root "$WRAPPER"
chmod 755 "$WRAPPER"

cat > "$SUDOERS" <<'SUDO'
Defaults:docsread !requiretty
docsread ALL=(root) NOPASSWD: /usr/local/sbin/pve-docs-readonly
SUDO
chmod 440 "$SUDOERS"
visudo -cf "$SUDOERS" >/dev/null

cp -a "$SSHD" "$BACKUP"
awk '
  /^# BEGIN pve-docs-readonly$/ { skip=1; next }
  /^# END pve-docs-readonly$/ { skip=0; next }
  !skip { print }
' "$BACKUP" > "$SSHD"
cat >> "$SSHD" <<'SSH'
# BEGIN pve-docs-readonly
Match User docsread
    PasswordAuthentication no
    PubkeyAuthentication yes
    AllowTcpForwarding no
    AllowAgentForwarding no
    X11Forwarding no
    PermitTunnel no
    ForceCommand /usr/bin/sudo -n /usr/local/sbin/pve-docs-readonly
# END pve-docs-readonly
SSH

if ! sshd -t; then
  echo "sshd config invalid; restoring $BACKUP" >&2
  cp -a "$BACKUP" "$SSHD"
  exit 1
fi
systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || service ssh reload

echo "OK: ${USER_NAME} created with a read-only forced command; backup: ${BACKUP}"
