# RSI Prototype (Minimal "AI Researcher" Loop)

A minimal, runnable example of the core Recursive Self-Improvement (RSI)
pattern: an LLM acts as a researcher that repeatedly (1) looks at a
candidate solution and how it scored, (2) proposes an improved version,
and (3) keeps whichever version scores best. Nothing here modifies the
agent's own weights or the RSI loop code itself — it's a self-improvement
loop over a *target program*, which is the tractable, safe slice of RSI
worth prototyping first.

## How it works

```
seed code --> evaluate --> [researcher proposes improvement] --> evaluate
                 ^                                                   |
                 +--------------- keep if strictly better ----------+
```

- **Task** (`rsi/task.py`, `tasks/`): a seed implementation plus test
  cases. The shipped example, `tasks/fibonacci.py`, seeds a naive
  exponential-time recursive Fibonacci function.
- **Evaluator** (`rsi/evaluator.py`, `rsi/harness.py`): runs a candidate
  in a subprocess with a timeout and scores it — correctness first
  (all test cases must pass), then speed as a tiebreaker among correct
  candidates.
- **Researcher** (`rsi/llm_client.py`): calls Claude with the current
  code and its evaluation results and asks for an improved full file.
  Without `ANTHROPIC_API_KEY` set, it falls back to a tiny offline mock
  (adds `@lru_cache`) so the loop is exercisable without network access
  or credentials — useful for tests, CI, and a quick sanity run.
- **Engine** (`rsi/engine.py`): drives the propose/evaluate/accept loop
  for N generations and only keeps a candidate if it's fully correct and
  scores higher than the current best.
- **Logger** (`rsi/logging_utils.py`): writes each generation's code and
  score to `runs/<timestamp>/`, plus a final `best_solution.py`.

## Running it

```bash
pip install -r requirements.txt

# Offline smoke test (no API key needed):
python main.py --task fibonacci --generations 3

# With a real researcher:
export ANTHROPIC_API_KEY=sk-...
python main.py --task fibonacci --generations 5 --model claude-sonnet-5
```

Output lands in `runs/<timestamp>/`: `history.jsonl` (one line per
generation), `gen_NNN.py` (every proposed candidate), `best_solution.py`,
and `summary.json`.

## Tests

```bash
pytest
```

## Adding a task

Add a new `Task` (seed code, `function_name`, `test_cases`) to `tasks/`
and register it in `tasks/__init__.py`. The evaluator only assumes the
candidate defines a single top-level function matching `function_name`
that takes one argument.

## Safety notes

This is a prototype, not a sandbox. `rsi/harness.py` runs candidate code
in a separate process with a timeout so a hang or crash can't take down
the main loop, but it does **not** provide OS-level isolation — only run
this against code you're willing to execute locally (LLM output included).
There is no self-modification of the agent/loop code itself; scope is
intentionally limited to improving a target program under test.
