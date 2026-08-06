"""Runs inside a subprocess to evaluate a candidate solution in isolation.

Usage: python harness.py <code_path> <cases_path> <function_name>

Reads the candidate source from <code_path>, execs it in a fresh
namespace, calls `<function_name>(input)` for every (input, expected)
pair in <cases_path> (a JSON list of [input, expected] pairs), and
prints a single JSON result line to stdout.

Running in a separate process gives the parent a hard timeout and keeps
a candidate that crashes, hangs, or writes garbage from taking down the
main RSI loop. It is not a security sandbox: candidate code still runs
with the same OS-level privileges as the harness itself, so only use
this against code you're willing to execute locally.
"""

import json
import sys
import time


def main() -> None:
    code_path, cases_path, function_name = sys.argv[1], sys.argv[2], sys.argv[3]

    with open(code_path, "r") as f:
        source = f.read()
    with open(cases_path, "r") as f:
        cases = json.load(f)

    result = {
        "num_passed": 0,
        "num_total": len(cases),
        "total_time": 0.0,
        "error": None,
        "per_case": [],
    }

    namespace: dict = {}
    try:
        exec(compile(source, "<candidate>", "exec"), namespace)
        func = namespace[function_name]
    except Exception as exc:  # noqa: BLE001 - report any failure to the parent
        result["error"] = f"{type(exc).__name__}: {exc}"
        print(json.dumps(result))
        return

    for arg, expected in cases:
        start = time.perf_counter()
        try:
            actual = func(arg)
            elapsed = time.perf_counter() - start
            passed = actual == expected
        except Exception as exc:  # noqa: BLE001
            elapsed = time.perf_counter() - start
            passed = False
            actual = f"<error: {type(exc).__name__}: {exc}>"
        result["total_time"] += elapsed
        result["num_passed"] += int(passed)
        result["per_case"].append(
            {"input": arg, "expected": expected, "actual": actual, "passed": passed, "time": elapsed}
        )

    print(json.dumps(result))


if __name__ == "__main__":
    main()
