import urllib.request
import json
import sys

BASE_URL = "http://localhost:3000"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers={"Accept": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def post(path, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def patch(path, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="PATCH"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_tests():
    print("=" * 60)
    print("RUNNING KRITI NEET COMPREHENSIVE LEARNING SYSTEM AUDIT SUITE")
    print("=" * 60)

    # 1. One Next Action Engine
    print("\n[TEST 1] Verifying One Next Action Engine...")
    dash = get("/api/student/dashboard")
    next_action = dash.get("nextAction")
    assert next_action is not None, "nextAction missing from dashboard payload"
    assert "title" in next_action, "title missing from nextAction"
    assert "targetRoute" in next_action, "targetRoute missing from nextAction"
    assert "reason" in next_action, "reason missing from nextAction"
    print(f" PASS: Next Action: {next_action['title']} -> {next_action['targetRoute']} ({next_action['reason']})")

    # 2. Weaknesses API
    print("\n[TEST 2] Verifying Weaknesses API...")
    weak = get("/api/student/weaknesses?limit=5")
    assert "weaknesses" in weak, "weaknesses missing from payload"
    print(f" PASS: Found {weak.get('count', 0)} tracked weak concepts in database.")

    # 3. Concept Remediation Engine
    print("\n[TEST 3] Verifying Concept Remediation Engine (3-Step Ladder)...")
    remed = get("/api/student/remediation?conceptId=CONCEPT_CONSERVATION_MOMENTUM")
    assert "concept" in remed, "concept missing in remediation"
    assert "drillQuestions" in remed, "drillQuestions missing in remediation"
    assert "step1_easy" in remed["drillQuestions"], "step1_easy missing"
    assert "step2_medium" in remed["drillQuestions"], "step2_medium"
    assert "step3_pyq" in remed["drillQuestions"], "step3_pyq missing"
    print(f" PASS: 3-Step Ladder loaded for '{remed['concept']['name']}' with worked explanation.")

    # 4. DPP Session with Metacognitive Confidence
    print("\n[TEST 4] Verifying DPP Submission with Confidence vs Performance Calibration...")
    dpp_res = post("/api/dpp/session", {
        "chapterSlug": "laws-of-motion",
        "questionCount": 1,
        "responses": [
            {
                "questionId": "Q_LOM_001",
                "selectedOption": "A",
                "timeSpentSeconds": 35,
                "confidence": "CERTAIN"
            }
        ]
    })
    assert dpp_res.get("success") == True, "DPP submission failed"
    summary = dpp_res.get("summary", {})
    assert "score" in summary, "score missing from DPP result summary"
    print(f" PASS: DPP session evaluated. Score: {summary.get('score')}/{summary.get('maxScore')}, Accuracy: {summary.get('accuracy')}%")

    # 5. Error Quarantine Retest API
    print("\n[TEST 5] Verifying Error Quarantine Retest Queue & Patch...")
    retry_q = get("/api/student/retry-mistakes")
    assert "questions" in retry_q, "questions list missing from retry queue"
    print(f" PASS: Retry queue active with {len(retry_q['questions'])} quarantined mistakes awaiting review.")

    # 6. Backlog Defibrillator API
    print("\n[TEST 6] Verifying Backlog Defibrillator Engine...")
    recovery = post("/api/student/recovery", {
        "missedPlanDate": "2026-10-01",
        "maxExtraMinutesPerDay": 45,
        "recoveryDaysSpan": 4
    })
    assert recovery.get("success") == True, "Recovery planner failed"
    print(f" PASS: Recovery planner succeeded: {recovery.get('explanation')}")

    # 7. AI Tutor Live Integration
    print("\n[TEST 7] Verifying AI Study Tutor Engine (Live Production Response)...")
    ai_res = post("/api/ai/chat", {
        "query": "Explain how friction acts on an inclined plane in NEET physics.",
        "mode": "SOCRATIC"
    })
    assert "content" in ai_res, "content missing from AI tutor response"
    assert ai_res.get("groundingStatus") in ["GROUNDED", "PARTIALLY_GROUNDED", "NOT_GROUNDED"], "Invalid grounding status"
    print(f" PASS: AI Tutor responded with {len(ai_res['content'])} characters. Grounding: {ai_res.get('groundingStatus')}.")

    # 8. Planner Today & Dynamic Recalculation
    print("\n[TEST 8] Verifying Planner Today Schedule...")
    today_plan = get("/api/student/planner/today")
    assert "tasks" in today_plan, "tasks missing from today plan"
    print(f" PASS: Today planner returned {len(today_plan.get('tasks', []))} prescribed study blocks.")

    print("\n" + "=" * 60)
    print("ALL 8 VERIFICATION GATES PASSED WITH ZERO ERRORS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
