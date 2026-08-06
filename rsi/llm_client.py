"""The "researcher": proposes improved candidate code given feedback.

Uses the Anthropic API when ANTHROPIC_API_KEY is set. Otherwise falls
back to a tiny offline mock so the loop can be exercised (tests, demos,
CI) without network access or credentials. The mock is deliberately
dumb -- it exists to prove the plumbing works, not to do real research.
"""

import os
import re
from typing import List, Optional

from rsi.evaluator import EvalResult
from rsi.task import Task

_CODE_BLOCK_RE = re.compile(r"```(?:python)?\s*\n(.*?)```", re.DOTALL)

_SYSTEM_PROMPT = """You are an AI researcher improving a piece of Python code through \
repeated experimentation. You will be shown a task, the current best solution, and how \
it scored. Propose a revised, complete implementation that is at least as correct and, \
where possible, faster or more robust. Respond with a single ```python fenced code \
block containing the *entire* new file. Do not include explanations outside the code \
block."""


def _format_feedback(eval_result: EvalResult) -> str:
    if eval_result.error:
        return f"Result: ERROR -- {eval_result.error}"
    lines = [f"Result: {eval_result.num_passed}/{eval_result.num_total} test cases passed, "
             f"total runtime {eval_result.total_time:.6f}s, score={eval_result.score:.4f}"]
    for case in eval_result.per_case:
        if not case["passed"]:
            lines.append(f"  FAILED input={case['input']!r} expected={case['expected']!r} got={case['actual']!r}")
    return "\n".join(lines)


def _build_prompt(task: Task, code: str, eval_result: EvalResult, history: List[str]) -> str:
    parts = [
        f"Task: {task.name}\n{task.description}\n",
        f"Current implementation (function `{task.function_name}`):\n```python\n{code}\n```\n",
        _format_feedback(eval_result),
    ]
    if history:
        parts.append("\nPrevious attempts (most recent last), for context, avoid repeating them verbatim:\n"
                      + "\n---\n".join(history[-3:]))
    parts.append("\nPropose an improved version of the full file.")
    return "\n".join(parts)


def _extract_code(text: str) -> str:
    match = _CODE_BLOCK_RE.search(text)
    return match.group(1).strip() if match else text.strip()


class LLMClient:
    """Wraps a real Claude call, or a mock fallback when no API key is set."""

    def __init__(self, model: str = "claude-sonnet-5"):
        self.model = model
        self._client = None
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if api_key:
            import anthropic  # imported lazily so the mock path has no hard dependency

            self._client = anthropic.Anthropic(api_key=api_key)

    @property
    def is_mock(self) -> bool:
        return self._client is None

    def propose(self, task: Task, code: str, eval_result: EvalResult, history: Optional[List[str]] = None) -> str:
        history = history or []
        if self._client is None:
            return self._mock_propose(code)

        prompt = _build_prompt(task, code, eval_result, history)
        response = self._client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in response.content if block.type == "text")
        return _extract_code(text)

    @staticmethod
    def _mock_propose(code: str) -> str:
        """Offline stand-in for the LLM: adds memoization if it's missing.

        This is enough to demonstrate one real improvement step without an
        API key. It intentionally does not iterate further once memoization
        is present -- real research is left to the actual model.
        """
        if "lru_cache" in code:
            return code
        lines = ["from functools import lru_cache", "", "", "@lru_cache(maxsize=None)"]
        lines.extend(code.splitlines())
        return "\n".join(lines)
