"""The RSI loop itself: propose -> evaluate -> keep if better -> repeat."""

from typing import List, Optional

from rsi.evaluator import EvalResult, evaluate
from rsi.llm_client import LLMClient
from rsi.logging_utils import RunLogger
from rsi.task import Task


class RSIEngine:
    def __init__(self, task: Task, llm_client: LLMClient, logger: Optional[RunLogger] = None):
        self.task = task
        self.llm_client = llm_client
        self.logger = logger

    def run(self, num_generations: int):
        best_code = self.task.seed_code
        best_result = evaluate(self.task, best_code)
        history: List[str] = [best_code]

        if self.logger:
            self.logger.log_generation(0, best_code, best_result, accepted=True)

        for generation in range(1, num_generations + 1):
            candidate_code = self.llm_client.propose(self.task, best_code, best_result, history)
            candidate_result = evaluate(self.task, candidate_code)
            accepted = candidate_result.all_passed and candidate_result.score > best_result.score

            if self.logger:
                self.logger.log_generation(generation, candidate_code, candidate_result, accepted)

            history.append(candidate_code)
            if accepted:
                best_code, best_result = candidate_code, candidate_result

        if self.logger:
            self.logger.save_best(best_code, best_result)

        return best_code, best_result
