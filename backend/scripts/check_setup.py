"""Prints only whether local services are configured. Does not print secrets."""
import re
from pathlib import Path

env_path = Path(__file__).resolve().parents[2] / ".env"
keys = {}
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.strip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        keys[key.strip()] = value.strip().strip('"').strip("'")

groq = keys.get("GROQ_API_KEY", "")
placeholders = {"", "replace_with_your_key", "your_key", "your_groq_key"}
url = keys.get("DATABASE_URL", "")
print("groq_configured", groq not in placeholders)
print("groq_model", keys.get("GROQ_MODEL", ""))
print("database_url", re.sub(r":([^:@/]+)@", ":***@", url))
