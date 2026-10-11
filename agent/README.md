# TeamPulse Python Agent

The Python desktop agent observes keyboard and mouse event timing to calculate active/idle intervals and flag repeated, macro-like input. It does not save typed text or pointer coordinates. On Windows, it also reports the active application and window title to the dashboard.

## Requirements

- Python 3.10 or newer
- A TeamPulse backend URL and an agent API key from the administrator
- `pynput` input-monitoring permission. On macOS, allow the Python runtime under System Settings → Privacy & Security → Accessibility. To report foreground apps on Linux/X11, install `xdotool`; Wayland compositor support varies.

## Run

```sh
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
python agent.py
```

On first launch, enter the backend URL, API key, and employee ID. The app checks the employee using a key-protected endpoint that returns no employee details. You can optionally enable **Launch agent when I sign in** to add a per-user startup entry. The API key is kept in the local `config.json` file; the file is given owner-only permissions where the operating system supports them. Keep it private.

## Configuration

The app writes `config.json` beside the source or executable. Start from `config.example.json` if configuring it manually. `idle_threshold_seconds` marks a session idle after the configured inactivity period; `idle_logout_seconds` stops monitoring and applies the selected action after longer inactivity. `suspicious_flag_limit` controls how many anomaly flags trigger the action, and `suspicious_key_threshold` controls repeated-key detection. `logout_action` accepts `none`, `lock`, `disconnect`, or `logoff`; support depends on the operating system (Windows supports all three; macOS supports lock and logoff; Linux supports lock and logoff). These workstation actions are local to the agent and are never triggered by an admin dashboard request. Use `none` unless your organization has explicitly approved automatic workstation actions.

## Build a Windows executable

```sh
python -m pip install pyinstaller
pyinstaller --onefile --windowed --name TeamPulseAgent agent.py
```

The executable must be built on the target operating system. The API key is never embedded in the executable.
