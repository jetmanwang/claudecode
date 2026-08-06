"""Task definitions for the RSI loop.

A Task packages together a seed implementation and the test cases used to
score candidate implementations. New tasks can be added under tasks/
without touching the rest of the engine.
"""

from dataclasses import dataclass
from typing import Any, List, Tuple


@dataclass(frozen=True)
class Task:
    name: str
    description: str
    function_name: str
    seed_code: str
    test_cases: List[Tuple[Any, Any]]
    timeout_seconds: float = 5.0
