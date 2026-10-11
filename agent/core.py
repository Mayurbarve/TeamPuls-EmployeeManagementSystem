"""Privacy-conscious activity counters shared by the TeamPulse Python agent."""

from __future__ import annotations

import threading
import time
from collections import deque
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Callable


SIMPLE_KEYS = {"space", "esc", "up", "down", "left", "right"}


@dataclass(frozen=True)
class AgentConfig:
    backend_url: str = "http://localhost:8080"
    activity_api_key: str = ""
    send_interval_seconds: int = 60
    idle_threshold_seconds: int = 300
    idle_logout_seconds: int = 300
    suspicious_key_threshold: int = 500
    logout_action: str = "none"
    suspicious_flag_limit: int = 4
    run_at_startup: bool = False
    employee_id: str = ""
    remember_me: bool = False

    @classmethod
    def from_dict(cls, values: dict) -> "AgentConfig":
        def number(name: str, default: int) -> int:
            try:
                return max(1, int(values.get(name, default)))
            except (TypeError, ValueError):
                return default

        return cls(
            backend_url=str(values.get("backend_url", cls.backend_url)).rstrip("/"),
            activity_api_key=str(values.get("activity_api_key", "")),
            send_interval_seconds=number("send_interval_seconds", 60),
            idle_threshold_seconds=number("idle_threshold_seconds", 300),
            idle_logout_seconds=number("idle_logout_seconds", 300),
            suspicious_key_threshold=number("suspicious_key_threshold", 500),
            logout_action=str(values.get("logout_action", "none")).lower(),
            suspicious_flag_limit=number("suspicious_flag_limit", 4),
            run_at_startup=bool(values.get("run_at_startup", False)),
            employee_id=str(values.get("employee_id", "")),
            remember_me=bool(values.get("remember_me", False)),
        )

    def to_dict(self) -> dict:
        return {
            "backend_url": self.backend_url,
            "activity_api_key": self.activity_api_key,
            "send_interval_seconds": self.send_interval_seconds,
            "idle_threshold_seconds": self.idle_threshold_seconds,
            "idle_logout_seconds": self.idle_logout_seconds,
            "suspicious_key_threshold": self.suspicious_key_threshold,
            "logout_action": self.logout_action,
            "suspicious_flag_limit": self.suspicious_flag_limit,
            "run_at_startup": self.run_at_startup,
            "employee_id": self.employee_id if self.remember_me else "",
            "remember_me": self.remember_me,
        }


class ActivityMonitor:
    """Aggregate timing and anomaly signals; never retain typed text or pointer coordinates."""

    def __init__(
        self,
        config: AgentConfig,
        employee_id: str,
        *,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.config = config
        self.employee_id = employee_id
        self._clock = clock
        self._lock = threading.RLock()
        now = clock()
        self._last_input = now
        self._last_mouse = now
        self._last_window_change = now
        self._active_window: tuple[str | None, str | None] = (None, None)
        self.active_app_exe: str | None = None
        self.active_app_title: str | None = None
        self._key_times: deque[float] = deque()
        self._last_key: str | None = None
        self._same_key_streak = 0
        self.active_seconds = 0
        self.idle_seconds = 0
        self.total_active_seconds = 0
        self.total_idle_seconds = 0
        self.interval_flags = 0
        self.session_flags = 0
        self.last_send_time = "Never"
        self.backend_status = "Not checked"
        self.running = False
        self.stop_reason = ""

    def on_key(self, key_name: str, now: float | None = None) -> None:
        now = self._clock() if now is None else now
        with self._lock:
            self._last_input = now
            if key_name == self._last_key:
                self._same_key_streak += 1
            else:
                self._last_key = key_name
                self._same_key_streak = 1

            if self._same_key_streak > self.config.suspicious_key_threshold:
                self._flag_suspicious()
                self._same_key_streak = 0

            self._key_times.append(now)
            while self._key_times and now - self._key_times[0] > 60:
                self._key_times.popleft()

            if (
                key_name.lower() in SIMPLE_KEYS
                and self._same_key_streak >= 50
                and now - self._last_mouse >= 15
                and now - self._last_window_change >= 15
                and self._has_uniform_timing()
            ):
                self._flag_suspicious()
                self.stop_reason = "fake_activity"

    def on_mouse_activity(self, now: float | None = None) -> None:
        now = self._clock() if now is None else now
        with self._lock:
            self._last_input = now
            self._last_mouse = now

    def tick(
        self,
        active_window: tuple[str | None, str | None] | None = None,
        now: float | None = None,
    ) -> None:
        now = self._clock() if now is None else now
        with self._lock:
            if active_window is not None:
                self.active_app_exe, self.active_app_title = active_window
                if active_window != self._active_window:
                    self._active_window = active_window
                    self._last_window_change = now
            if now - self._last_input <= self.config.idle_threshold_seconds:
                self.active_seconds += 1
                self.total_active_seconds += 1
            else:
                self.idle_seconds += 1
                self.total_idle_seconds += 1

    def should_stop(self, now: float | None = None) -> str | None:
        now = self._clock() if now is None else now
        with self._lock:
            if self.stop_reason:
                return self.stop_reason
            if now - self._last_input >= self.config.idle_logout_seconds:
                return "idle_timeout"
            if self.session_flags >= self.config.suspicious_flag_limit:
                return "too_many_suspicious_flags"
            return None

    def build_payload(self, timestamp: datetime | None = None) -> dict:
        timestamp = timestamp or datetime.now(timezone.utc)
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        with self._lock:
            payload = {
                "employee_id": self.employee_id,
                "timestamp": timestamp.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
                "active_seconds": self.active_seconds,
                "idle_seconds": self.idle_seconds,
                "suspicious": self.interval_flags > 0,
                "active_app_exe": self.active_app_exe,
                "active_app_title": self.active_app_title,
            }
            self.active_seconds = 0
            self.idle_seconds = 0
            self.interval_flags = 0
            self._same_key_streak = 0
            self.last_send_time = timestamp.astimezone().strftime("%H:%M:%S")
            return payload

    def stats(self) -> dict:
        with self._lock:
            return {
                "active_seconds": self.active_seconds,
                "idle_seconds": self.idle_seconds,
                "total_active_seconds": self.total_active_seconds,
                "total_idle_seconds": self.total_idle_seconds,
                "interval_flags": self.interval_flags,
                "session_flags": self.session_flags,
            }

    def _flag_suspicious(self) -> None:
        self.interval_flags += 1
        self.session_flags += 1

    def _has_uniform_timing(self) -> bool:
        if len(self._key_times) < 10:
            return False
        intervals = [b - a for a, b in zip(self._key_times, list(self._key_times)[1:])]
        mean = sum(intervals) / len(intervals)
        variance = sum((value - mean) ** 2 for value in intervals) / len(intervals)
        return variance**0.5 < 0.02 and mean > 0.05
