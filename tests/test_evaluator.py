from rsi.evaluator import evaluate
from rsi.task import Task


def make_task(seed_code, timeout=2.0):
    return Task(
        name="add-one",
        description="solve(n) returns n + 1",
        function_name="solve",
        seed_code=seed_code,
        test_cases=[[0, 1], [1, 2], [5, 6]],
        timeout_seconds=timeout,
    )


def test_all_passed():
    task = make_task("def solve(n):\n    return n + 1\n")
    result = evaluate(task, task.seed_code)
    assert result.all_passed
    assert result.num_passed == 3
    assert result.score > 0


def test_some_failed():
    task = make_task("def solve(n):\n    return n\n")  # wrong on purpose
    result = evaluate(task, task.seed_code)
    assert not result.all_passed
    assert result.num_passed == 0
    assert result.score <= 0


def test_syntax_error_reported_not_raised():
    task = make_task("def solve(n:\n    return n\n")
    result = evaluate(task, task.seed_code)
    assert result.error is not None
    assert not result.all_passed


def test_timeout_is_caught():
    task = make_task("def solve(n):\n    while True:\n        pass\n", timeout=0.5)
    result = evaluate(task, task.seed_code)
    assert result.error == "timeout"
    assert not result.all_passed
