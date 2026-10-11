"""TeamPulse desktop activity agent. Key identities and pointer coordinates are never stored."""

from __future__ import annotations

import json
import os
import plistlib
import subprocess
import sys
import threading
import time
import tkinter as tk
import shutil
from dataclasses import replace
from pathlib import Path
from tkinter import messagebox
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from core import ActivityMonitor, AgentConfig

try:
    from pynput import keyboard, mouse
except ImportError:
    keyboard = mouse = None

try:
    import psutil
except ImportError:
    psutil = None

try:
    import win32gui
    import win32process
except ImportError:
    win32gui = win32process = None


APP_TITLE = "TeamPulse Activity Agent"
CONFIG_PATH = Path(sys.executable).resolve().parent / "config.json" if getattr(sys, "frozen", False) else Path(__file__).resolve().parent / "config.json"
DEFAULT_BACKEND_URL = "http://localhost:8080"


def load_config(path: Path = CONFIG_PATH) -> AgentConfig:
    try:
        with path.open("r", encoding="utf-8") as config_file:
            values = json.load(config_file)
        if not isinstance(values, dict):
            return AgentConfig()
        return AgentConfig.from_dict(values)
    except (OSError, json.JSONDecodeError):
        return AgentConfig()


def save_config(config: AgentConfig, path: Path = CONFIG_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(config.to_dict(), indent=2) + "\n", encoding="utf-8")
    try:
        path.chmod(0o600)
    except OSError:
        pass


def configure_startup(enabled: bool) -> None:
    frozen = bool(getattr(sys, "frozen", False))
    program = [sys.executable] if frozen else [sys.executable, str(Path(__file__).resolve())]
    if sys.platform == "win32":
        import winreg
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path) as key:
            if enabled:
                winreg.SetValueEx(key, "TeamPulseAgent", 0, winreg.REG_SZ,
                                  " ".join(f'"{part}"' for part in program))
            else:
                try:
                    winreg.DeleteValue(key, "TeamPulseAgent")
                except FileNotFoundError:
                    pass
    elif sys.platform == "darwin":
        launch_agent = Path.home() / "Library/LaunchAgents/com.teampulse.agent.plist"
        if enabled:
            launch_agent.parent.mkdir(parents=True, exist_ok=True)
            with launch_agent.open("wb") as target:
                plistlib.dump({"Label": "com.teampulse.agent", "ProgramArguments": program,
                               "RunAtLoad": True, "KeepAlive": False}, target)
        else:
            launch_agent.unlink(missing_ok=True)
    elif sys.platform.startswith("linux"):
        desktop_file = Path.home() / ".config/autostart/teampulse-agent.desktop"
        if enabled:
            desktop_file.parent.mkdir(parents=True, exist_ok=True)
            escaped = [part.replace("\\", "\\\\").replace('"', '\\"') for part in program]
            desktop_file.write_text("[Desktop Entry]\nType=Application\nName=TeamPulse Agent\nExec="
                                    + " ".join(f'"{part}"' for part in escaped)
                                    + "\nX-GNOME-Autostart-enabled=true\n", encoding="utf-8")
        else:
            desktop_file.unlink(missing_ok=True)
    elif enabled:
        raise OSError("Automatic startup is unsupported on this operating system")


def api_request(config: AgentConfig, path: str, *, method: str = "GET", payload: dict | None = None) -> tuple[int, dict | None]:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        config.backend_url.rstrip("/") + path,
        data=data,
        method=method,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Agent-API-Key": config.activity_api_key,
        },
    )
    try:
        with urlopen(request, timeout=6) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body) if body else None
    except HTTPError as error:
        return error.code, None


def verify_employee(config: AgentConfig, employee_id: str) -> tuple[bool, str]:
    if not config.activity_api_key.strip():
        return False, "Enter the agent API key provided by your TeamPulse administrator."
    try:
        status, body = api_request(
            config,
            f"/agent/employees/{quote(employee_id, safe='')}/verify",
        )
    except (URLError, TimeoutError, OSError, ValueError):
        return False, "Cannot reach the backend. Check the backend URL and try again."
    if status == 200 and body and body.get("valid") is True:
        return True, ""
    if status == 401:
        return False, "The agent API key was rejected. Ask your administrator to confirm it."
    if status == 404:
        return False, "That employee ID is not registered in TeamPulse."
    return False, f"The backend could not verify this employee (HTTP {status})."


class SetupDialog:
    def __init__(self, initial: AgentConfig):
        self.initial = initial
        self.result: tuple[AgentConfig, str] | None = None
        self.root = tk.Tk()
        self.root.title("TeamPulse Agent Setup")
        self.root.resizable(False, False)
        self.root.protocol("WM_DELETE_WINDOW", self.root.destroy)
        self.root.configure(padx=22, pady=18, bg="#f5fbf7")
        self.root.bind("<Return>", lambda _event: self.connect())

        tk.Label(self.root, text="Connect to TeamPulse", font=("Segoe UI", 16, "bold"), bg="#f5fbf7", fg="#173d2d").grid(row=0, column=0, columnspan=2, sticky="w", pady=(0, 5))
        tk.Label(self.root, text="Use the backend URL and agent key from your administrator.", font=("Segoe UI", 9), bg="#f5fbf7", fg="#55665c").grid(row=1, column=0, columnspan=2, sticky="w", pady=(0, 16))

        self.backend = tk.StringVar(value=initial.backend_url or DEFAULT_BACKEND_URL)
        self.api_key = tk.StringVar(value=initial.activity_api_key)
        self.employee = tk.StringVar(value=initial.employee_id)
        self.remember = tk.BooleanVar(value=initial.remember_me)
        self.run_at_startup = tk.BooleanVar(value=initial.run_at_startup)
        self.error = tk.StringVar()

        self._field("Backend URL", self.backend, 2)
        self._field("Agent API key", self.api_key, 4, show="•")
        self._field("Employee ID", self.employee, 6)
        tk.Checkbutton(self.root, text="Remember this employee ID", variable=self.remember, bg="#f5fbf7", activebackground="#f5fbf7").grid(row=8, column=0, columnspan=2, sticky="w", pady=(0, 10))
        tk.Checkbutton(self.root, text="Launch agent when I sign in", variable=self.run_at_startup, bg="#f5fbf7", activebackground="#f5fbf7").grid(row=9, column=0, columnspan=2, sticky="w", pady=(0, 10))
        tk.Label(self.root, textvariable=self.error, fg="#ad2f27", bg="#f5fbf7", wraplength=340, justify="left").grid(row=10, column=0, columnspan=2, sticky="w", pady=(0, 8))
        self.connect_button = tk.Button(self.root, text="Verify and start", command=self.connect, bg="#31845e", fg="white", activebackground="#286d4d", activeforeground="white", relief="flat", padx=14, pady=8, cursor="hand2")
        self.connect_button.grid(row=11, column=0, columnspan=2, sticky="ew")
        self.root.mainloop()

    def _field(self, label: str, value: tk.StringVar, row: int, show: str = "") -> None:
        tk.Label(self.root, text=label, font=("Segoe UI", 9, "bold"), bg="#f5fbf7", fg="#34433a").grid(row=row, column=0, columnspan=2, sticky="w", pady=(0, 5))
        entry = tk.Entry(self.root, textvariable=value, show=show, width=42, relief="solid", bd=1, font=("Segoe UI", 10))
        entry.grid(row=row + 1, column=0, columnspan=2, sticky="ew", ipady=7, pady=(0, 12))

    def connect(self) -> None:
        backend_url = self.backend.get().strip().rstrip("/")
        api_key = self.api_key.get().strip()
        employee_id = self.employee.get().strip()
        if not backend_url.startswith(("https://", "http://")) or not api_key or not employee_id:
            self.error.set("Enter a valid backend URL, API key, and employee ID.")
            return
        config = replace(
            self.initial,
            backend_url=backend_url,
            activity_api_key=api_key,
            employee_id=employee_id if self.remember.get() else "",
            remember_me=self.remember.get(),
            run_at_startup=self.run_at_startup.get(),
        )
        self.connect_button.configure(text="Verifying…", state="disabled")
        self.root.update_idletasks()
        valid, error = verify_employee(config, employee_id)
        if not valid:
            self.error.set(error)
            self.connect_button.configure(text="Verify and start", state="normal")
            return
        try:
            save_config(config)
        except OSError:
            messagebox.showwarning(APP_TITLE, "Could not save the local config. You can continue, but setup will be required next time.", parent=self.root)
        try:
            configure_startup(config.run_at_startup)
        except (OSError, ImportError) as error:
            messagebox.showwarning(APP_TITLE, f"The agent connected, but automatic startup could not be configured: {error}", parent=self.root)
        self.result = (config, employee_id)
        self.root.destroy()


class AgentApp:
    def __init__(self, config: AgentConfig, employee_id: str):
        self.config = config
        self.monitor = ActivityMonitor(config, employee_id)
        self._keyboard_listener = None
        self._mouse_listener = None
        self._worker: threading.Thread | None = None
        self.root = tk.Tk()
        self.root.title(APP_TITLE)
        self.root.geometry("470x350")
        self.root.minsize(430, 330)
        self.root.protocol("WM_DELETE_WINDOW", self.stop_and_close)
        self.root.configure(bg="#f7faf8")

        self.status = tk.StringVar(value="Agent: Starting")
        self.backend_status = tk.StringVar(value="Backend: Not checked")
        self.last_sent = tk.StringVar(value="Last activity sent: Never")
        self.activity = tk.StringVar(value="This interval: Active 0s  |  Idle 0s")
        self.total = tk.StringVar(value="Session total: Active 0s  |  Idle 0s")
        self.flags = tk.StringVar(value="Suspicious flags this session: 0")
        self.employee = tk.StringVar(value=f"Employee ID: {employee_id}")

        tk.Label(self.root, text="TeamPulse", font=("Segoe UI", 18, "bold"), bg="#f7faf8", fg="#174a34").pack(pady=(18, 2))
        tk.Label(self.root, textvariable=self.status, font=("Segoe UI", 11, "bold"), bg="#f7faf8", fg="#31845e").pack(pady=4)
        for variable in (self.backend_status, self.last_sent, self.activity, self.total, self.flags, self.employee):
            tk.Label(self.root, textvariable=variable, font=("Segoe UI", 9), bg="#f7faf8", fg="#46534b").pack(pady=4)
        tk.Label(self.root, text="Input event timing is monitored; typed text and pointer coordinates are not recorded.", font=("Segoe UI", 8), wraplength=410, bg="#f7faf8", fg="#78827b").pack(pady=(8, 10))
        self.stop_button = tk.Button(self.root, text="Stop agent and exit", command=self.stop_and_close, bg="#b33c35", fg="white", activebackground="#922f29", activeforeground="white", relief="flat", padx=14, pady=8, cursor="hand2")
        self.stop_button.pack(pady=(0, 16))

        self._start_worker()
        self._refresh_ui()

    def _start_worker(self) -> None:
        if keyboard is None or mouse is None:
            self.status.set("Agent dependencies are missing")
            self.backend_status.set("Backend: install packages from requirements.txt")
            return
        self.monitor.running = True
        self._worker = threading.Thread(target=self._run_monitor, name="teampulse-agent", daemon=True)
        self._worker.start()

    @staticmethod
    def _key_name(key) -> str:
        name = getattr(key, "name", None)
        if name:
            return str(name).lower()
        char = getattr(key, "char", None)
        return char if char is not None else "unknown"

    def _active_window(self) -> tuple[str | None, str | None] | None:
        try:
            if sys.platform == "win32" and win32gui and win32process and psutil:
                handle = win32gui.GetForegroundWindow()
                _, process_id = win32process.GetWindowThreadProcessId(handle)
                app_name = psutil.Process(process_id).name()
                title = win32gui.GetWindowText(handle) or None
                return app_name, title
            if sys.platform == "darwin":
                script = 'tell application "System Events" to tell first application process whose frontmost is true to set appName to name; try set windowName to name of front window; on error set windowName to ""; end try; return appName & tab & windowName'
                result = subprocess.run(["/usr/bin/osascript", "-e", script], capture_output=True, text=True, timeout=2, check=False)
                if result.returncode == 0:
                    app_name, _, title = result.stdout.strip().partition("\t")
                    return app_name or None, title or None
            if sys.platform.startswith("linux") and shutil.which("xdotool"):
                window_id = subprocess.run(["xdotool", "getactivewindow"], capture_output=True, text=True, timeout=1, check=False)
                if window_id.returncode == 0 and window_id.stdout.strip():
                    active_id = window_id.stdout.strip()
                    title_result = subprocess.run(["xdotool", "getwindowname", active_id], capture_output=True, text=True, timeout=1, check=False)
                    pid_result = subprocess.run(["xdotool", "getwindowpid", active_id], capture_output=True, text=True, timeout=1, check=False)
                    app_name = None
                    if psutil and pid_result.returncode == 0 and pid_result.stdout.strip().isdigit():
                        app_name = psutil.Process(int(pid_result.stdout.strip())).name()
                    return app_name, title_result.stdout.strip() or None
        except Exception:
            pass
        return None

    def _run_monitor(self) -> None:
        try:
            self._keyboard_listener = keyboard.Listener(on_press=lambda key: self.monitor.on_key(self._key_name(key)))
            self._mouse_listener = mouse.Listener(
                on_move=lambda *_: self.monitor.on_mouse_activity(),
                on_click=lambda *_: self.monitor.on_mouse_activity(),
                on_scroll=lambda *_: self.monitor.on_mouse_activity(),
            )
            self._keyboard_listener.start()
            self._mouse_listener.start()
            self.monitor.backend_status = "Monitoring; waiting to send activity"
            last_send = time.monotonic()
            while self.monitor.running:
                self.monitor.tick(self._active_window())
                reason = self.monitor.should_stop()
                if reason:
                    self._trigger_stop(reason)
                    break
                now = time.monotonic()
                if now - last_send >= self.config.send_interval_seconds:
                    self._send_activity()
                    last_send = now
                time.sleep(1)
        except Exception as error:
            self.monitor.backend_status = f"Input monitoring unavailable: {error}"
            self.monitor.running = False
        finally:
            for listener in (self._keyboard_listener, self._mouse_listener):
                if listener:
                    listener.stop()

    def _send_activity(self) -> bool:
        payload = self.monitor.build_payload()
        try:
            status, _ = api_request(self.config, "/activity", method="POST", payload=payload)
            if status == 200:
                self.monitor.backend_status = "Connected"
                return True
            if status == 401:
                self.monitor.backend_status = "Agent API key rejected"
            elif status == 404:
                self.monitor.backend_status = "Employee not registered; agent stopped"
                self.monitor.stop_reason = "employee_not_registered"
                self.monitor.running = False
            else:
                self.monitor.backend_status = f"Backend error: HTTP {status}"
        except (URLError, TimeoutError, OSError, ValueError):
            self.monitor.backend_status = "Failed to reach backend"
        return False

    def _trigger_stop(self, reason: str) -> None:
        self.monitor.backend_status = f"Monitoring stopped: {reason.replace('_', ' ')}"
        self._send_activity()
        self.monitor.running = False
        self._apply_logout_action()

    def _apply_logout_action(self) -> None:
        action = self.config.logout_action
        if action == "none":
            return
        commands = {
            ("win32", "disconnect"): ["tsdiscon"],
            ("win32", "logoff"): ["shutdown", "/l"],
            ("win32", "lock"): ["rundll32.exe", "user32.dll,LockWorkStation"],
            ("darwin", "lock"): ["/usr/bin/osascript", "-e", 'tell application "System Events" to keystroke "q" using {control down, command down}'],
            ("darwin", "logoff"): ["/usr/bin/osascript", "-e", 'tell application "System Events" to log out'],
            ("linux", "lock"): ["loginctl", "lock-session"],
        }
        command = commands.get((sys.platform, action))
        if sys.platform == "linux" and action == "logoff":
            session_id = os.environ.get("XDG_SESSION_ID")
            command = ["loginctl", "terminate-session", session_id] if session_id else None
        if command:
            try:
                subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except OSError:
                self.monitor.backend_status = f"Could not perform configured {action} action"
        else:
            self.monitor.backend_status = f"{action} action is not available on this operating system"

    def _refresh_ui(self) -> None:
        stats = self.monitor.stats()
        self.status.set("Agent: ACTIVE" if self.monitor.running else "Agent: STOPPED")
        self.backend_status.set(f"Backend: {self.monitor.backend_status}")
        self.last_sent.set(f"Last activity sent: {self.monitor.last_send_time}")
        self.activity.set(f"This interval: Active {stats['active_seconds']}s  |  Idle {stats['idle_seconds']}s")
        self.total.set(f"Session total: Active {self._format_time(stats['total_active_seconds'])}  |  Idle {self._format_time(stats['total_idle_seconds'])}")
        self.flags.set(f"Suspicious flags this session: {stats['session_flags']}")
        if self.root.winfo_exists():
            self.root.after(1000, self._refresh_ui)

    @staticmethod
    def _format_time(seconds: int) -> str:
        hours, remainder = divmod(seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        if hours:
            return f"{hours}h {minutes}m {seconds}s"
        if minutes:
            return f"{minutes}m {seconds}s"
        return f"{seconds}s"

    def stop_and_close(self) -> None:
        if self.monitor.running:
            self.monitor.running = False
            self._send_activity()
        self.root.destroy()

    def run(self) -> None:
        self.root.mainloop()


def main() -> int:
    config = load_config()
    if config.run_at_startup:
        try:
            configure_startup(True)
        except (OSError, ImportError):
            pass
    employee_id = config.employee_id if config.remember_me else ""
    if employee_id:
        valid, _ = verify_employee(config, employee_id)
        if not valid:
            config = replace(config, employee_id="", remember_me=False)
            save_config(config)
            employee_id = ""
    if not employee_id:
        setup = SetupDialog(config)
        if not setup.result:
            return 0
        config, employee_id = setup.result
    try:
        AgentApp(config, employee_id).run()
    except tk.TclError as error:
        messagebox.showerror(APP_TITLE, f"TeamPulse could not open its desktop window: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
