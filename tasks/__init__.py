"""Task registry for the RSI prototype."""

from rsi.task import Task
from tasks.fibonacci import TASK as FIBONACCI

TASKS = {
    FIBONACCI.name: FIBONACCI,
}


def get_task(name: str) -> Task:
    try:
        return TASKS[name]
    except KeyError:
        available = ", ".join(sorted(TASKS))
        raise KeyError(f"Unknown task {name!r}. Available: {available}") from None
