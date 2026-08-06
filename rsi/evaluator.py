"""Evaluates candidate solutions against a Task's test cases."""

import json
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

from rsi.task import Task

_HARNESS_PATH = Path(__file__).with_name("harness.py")


@dataclass(frozen=True)
class EvalResult:
    num_passed: int
    num_total: int
    total_time: float
    error: Optional[str]
    per_case: List[Dict[str, Any]]

    @property
    def all_passed(self) -> bool:
        return self.error is None and self.num_passed == self.num_total

    @property
    def score(self) -> float:
        """Higher is better. Correctness dominates; speed breaks ties among
        fully-correct candidates."""
        if not self.all_passed:
            return self.num_passed - self.num_total  # always <= 0, never beats a passing run
        return 1.0 / (self.total_time + 1e-6)


def evaluate(task: Task, code: str) -> EvalResult:
    with tempfile.TemporaryDirectory() as tmp:
        code_path = Path(tmp) / "candidate.py"
        cases_path = Path(tmp) / "cases.json"
        code_path.write_text(code)
        cases_path.write_text(json.dumps(task.test_cases))

        try:
            proc = subprocess.run(
                [sys.executable, str(_HARNESS_PATH), str(code_path), str(cases_path), task.function_name],
                capture_output=True,
                text=True,
                timeout=task.timeout_seconds,
            )
        except subprocess.TimeoutExpired:
            return EvalResult(0, len(task.test_cases), task.timeout_seconds, "timeout", [])

        if proc.returncode != 0 or not proc.stdout.strip():
            error = proc.stderr.strip()[-2000:] or "harness produced no output"
            return EvalResult(0, len(task.test_cases), 0.0, error, [])

        payload = json.loads(proc.stdout.strip().splitlines()[-1])
        return EvalResult(**payload)
