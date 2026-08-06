"""Seed task: a deliberately slow Fibonacci implementation.

Correctness is easy to satisfy; the interesting work for the "researcher"
is noticing the exponential blow-up and fixing it (memoization, an
iterative rewrite, closed-form formula, ...).
"""

from rsi.task import Task

SEED_CODE = '''\
def solve(n):
    if n < 2:
        return n
    return solve(n - 1) + solve(n - 2)
'''

TEST_CASES = [[n, n] for n in [0, 1]] + [
    [2, 1], [3, 2], [4, 3], [5, 5], [10, 55], [20, 6765], [27, 196418],
]

TASK = Task(
    name="fibonacci",
    description="Implement solve(n) returning the n-th Fibonacci number (solve(0)=0, solve(1)=1).",
    function_name="solve",
    seed_code=SEED_CODE,
    test_cases=TEST_CASES,
    timeout_seconds=5.0,
)
