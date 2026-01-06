set -euo pipefail

BACKUP_DIR="$(dirname "$0")/../backups"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="grooming_${TIMESTAMP}.dump"
FULL_PATH="${BACKUP_DIR}/${FILENAME}"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-grooming_store}"



echo "[INFO] Starting backup to: ${FULL_PATH}"

pg_dump \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  -d "$PGDATABASE" \
  -F c \
  -f "$FULL_PATH"

echo "[INFO] Backup finished."

find "$BACKUP_DIR" -name "grooming_*.dump" -type f -mtime +7 -delete
echo "[INFO] Old backups cleaned."