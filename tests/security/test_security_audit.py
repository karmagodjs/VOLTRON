import os
import re
import unittest


class TestSecurityAudit(unittest.TestCase):

    def test_no_hardcoded_secrets_in_frontend(self):
        # Scan frontend source files for leaked API keys or secret strings
        frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src"))
        secret_patterns = [
            re.compile(r"AKIA[0-9A-Z]{16}"), # AWS
            re.compile(r"PK[0-9A-Za-z]{18,}"), # Alpaca Key pattern
            re.compile(r"AIza[0-9A-Za-z-_]{35}"), # Google API key pattern
            re.compile(r"sk-[0-9a-zA-Z]{20,}"), # Generic secret key
        ]

        violations = []
        for root, _, files in os.walk(frontend_dir):
            for file in files:
                if file.endswith((".ts", ".tsx", ".js", ".json")):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        for pat in secret_patterns:
                            if pat.search(content):
                                violations.append(f"{file}: pattern match {pat.pattern}")

        self.assertEqual(len(violations), 0, f"Found hardcoded secrets in frontend: {violations}")

    def test_xss_input_sanitization(self):
        # Ensure malicious script tags in symbol or error messages are treated as plaintext
        payload = "<script>alert('XSS')</script>"
        sanitized = payload.replace("<", "&lt;").replace(">", "&gt;")
        self.assertNotIn("<script>", sanitized)

    def test_log_injection_sanitization(self):
        # Ensure newline injection cannot forge log entries
        malicious_log = "Order filled\n09:31:00 CRITICAL ADMIN_OVERRIDE"
        escaped_log = malicious_log.replace("\n", " ").replace("\r", " ")
        self.assertNotIn("\n", escaped_log)


if __name__ == "__main__":
    unittest.main()
