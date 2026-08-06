"""CLI entry point for the minimal RSI (AI Researcher) prototype.

Example:
    python main.py --task fibonacci --generations 5
"""

import argparse
from datetime import datetime
from pathlib import Path

from rsi.engine import RSIEngine
from rsi.llm_client import LLMClient
from rsi.logging_utils import RunLogger
from tasks import get_task


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--task", default="fibonacci", help="Task name (see tasks/ for the registry).")
    parser.add_argument("--generations", type=int, default=5, help="Number of improvement rounds to run.")
    parser.add_argument("--model", default="claude-sonnet-5", help="Anthropic model id to use as the researcher.")
    parser.add_argument("--output-dir", default=None, help="Where to write run logs. Defaults to runs/<timestamp>.")
    args = parser.parse_args()

    task = get_task(args.task)
    llm_client = LLMClient(model=args.model)
    output_dir = Path(args.output_dir) if args.output_dir else Path("runs") / datetime.now().strftime("%Y%m%d-%H%M%S")
    logger = RunLogger(output_dir)

    if llm_client.is_mock:
        print("No ANTHROPIC_API_KEY set -- running with the offline mock researcher.\n")

    engine = RSIEngine(task, llm_client, logger)
    best_code, best_result = engine.run(args.generations)

    print(f"\nBest score: {best_result.score:.4f} "
          f"({best_result.num_passed}/{best_result.num_total} passed)")
    print(f"Logs written to {output_dir}/")


if __name__ == "__main__":
    main()
