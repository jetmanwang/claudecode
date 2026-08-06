"""Writes a JSONL trace of the RSI run plus the final best solution."""

import json
from dataclasses import asdict
from pathlib import Path

from rsi.evaluator import EvalResult


class RunLogger:
    def __init__(self, output_dir: Path):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._history_path = self.output_dir / "history.jsonl"
        self._history_path.write_text("")

    def log_generation(self, generation: int, code: str, result: EvalResult, accepted: bool) -> None:
        entry = {
            "generation": generation,
            "accepted": accepted,
            "eval": asdict(result),
            "score": result.score,
        }
        with self._history_path.open("a") as f:
            f.write(json.dumps(entry) + "\n")
        (self.output_dir / f"gen_{generation:03d}.py").write_text(code)
        status = "ACCEPTED" if accepted else "rejected"
        print(f"[gen {generation}] score={result.score:.4f} "
              f"passed={result.num_passed}/{result.num_total} -> {status}")

    def save_best(self, code: str, result: EvalResult) -> None:
        (self.output_dir / "best_solution.py").write_text(code)
        summary = {"score": result.score, "num_passed": result.num_passed, "num_total": result.num_total}
        (self.output_dir / "summary.json").write_text(json.dumps(summary, indent=2))
