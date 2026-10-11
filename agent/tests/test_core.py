import unittest
from datetime import datetime, timezone

from core import ActivityMonitor, AgentConfig


class FakeClock:
    def __init__(self, value=0.0):
        self.value = value

    def __call__(self):
        return self.value


class AgentCoreTests(unittest.TestCase):
    def test_config_normalizes_backend_url_and_ignores_invalid_thresholds(self):
        config = AgentConfig.from_dict({"backend_url": "https://api.example/", "send_interval_seconds": "bad"})
        self.assertEqual(config.backend_url, "https://api.example")
        self.assertEqual(config.send_interval_seconds, 60)
        self.assertFalse(config.run_at_startup)
        self.assertEqual(config.logout_action, "none")

    def test_tick_counts_active_and_idle_seconds(self):
        clock = FakeClock()
        config = AgentConfig(idle_threshold_seconds=5)
        monitor = ActivityMonitor(config, "EMP-1", clock=clock)
        monitor.tick(now=1)
        clock.value = 8
        monitor.tick(now=8)
        self.assertEqual(monitor.stats()["active_seconds"], 1)
        self.assertEqual(monitor.stats()["idle_seconds"], 1)

    def test_activity_payload_has_expected_backend_fields_and_resets_interval(self):
        monitor = ActivityMonitor(AgentConfig(), "EMP-1", clock=FakeClock())
        monitor.tick(active_window=("editor.exe", "TeamPulse source"), now=1)
        monitor.on_key("a", now=2)
        payload = monitor.build_payload(datetime(2026, 1, 2, tzinfo=timezone.utc))
        self.assertEqual(payload["employee_id"], "EMP-1")
        self.assertEqual(payload["timestamp"], "2026-01-02T00:00:00Z")
        self.assertEqual(payload["active_seconds"], 1)
        self.assertEqual(payload["active_app_exe"], "editor.exe")
        self.assertNotIn("key", payload)
        self.assertEqual(monitor.stats()["active_seconds"], 0)

    def test_repeated_key_threshold_flags_activity_without_retaining_key_text_in_payload(self):
        clock = FakeClock()
        monitor = ActivityMonitor(AgentConfig(suspicious_key_threshold=2), "EMP-1", clock=clock)
        monitor.on_key("q", now=1)
        monitor.on_key("q", now=2)
        monitor.on_key("q", now=3)
        payload = monitor.build_payload()
        self.assertTrue(payload["suspicious"])
        self.assertNotIn("q", str(payload))
        self.assertEqual(monitor.stats()["session_flags"], 1)

    def test_idle_timeout_stop_reason(self):
        clock = FakeClock()
        monitor = ActivityMonitor(AgentConfig(idle_logout_seconds=10), "EMP-1", clock=clock)
        self.assertIsNone(monitor.should_stop(now=9))
        self.assertEqual(monitor.should_stop(now=10), "idle_timeout")

    def test_configurable_suspicious_flag_limit_stops_agent(self):
        monitor = ActivityMonitor(AgentConfig(suspicious_flag_limit=2), "EMP-1", clock=FakeClock())
        monitor._flag_suspicious()
        self.assertIsNone(monitor.should_stop(now=1))
        monitor._flag_suspicious()
        self.assertEqual(monitor.should_stop(now=1), "too_many_suspicious_flags")

    def test_employee_id_is_only_serialized_when_remember_me_is_enabled(self):
        config = AgentConfig(employee_id="EMP-1", remember_me=False)
        self.assertEqual(config.to_dict()["employee_id"], "")


if __name__ == "__main__":
    unittest.main()
