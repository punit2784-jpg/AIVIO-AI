import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import httpx

print("[DEBUG] 1. Importing app...", flush=True)
from app.main import app
print("[DEBUG] 2. App imported successfully.", flush=True)

async def run_all_tests():
    print("[DEBUG] 3. Starting run_all_tests...", flush=True)
    transport = httpx.ASGITransport(app=app)
    print("[DEBUG] 4. ASGITransport created.", flush=True)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("[DEBUG] 5. Inside AsyncClient context.", flush=True)
        print("[DEBUG] 6. Calling GET / ...", flush=True)
        res = await client.get("/")
        print(f"[DEBUG] 7. GET / returned: {res.status_code}", flush=True)
        assert res.status_code == 200
        print(f"[PASS] GET / -> {res.status_code}")

        print("[DEBUG] 8. Calling GET /api/health ...", flush=True)
        res = await client.get("/api/health")
        print(f"[DEBUG] 9. GET /api/health returned: {res.status_code}", flush=True)
        assert res.status_code == 200

        print("[DEBUG] 10. Calling GET /api/investigations ...", flush=True)
        res = await client.get("/api/investigations")
        print(f"[DEBUG] 11. GET /api/investigations returned: {res.status_code}", flush=True)
        assert res.status_code == 200

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
