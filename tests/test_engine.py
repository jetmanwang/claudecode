import tempfile
from pathlib import Path

from rsi.engine import RSIEngine
from rsi.llm_client import LLMClient
from rsi.logging_utils import RunLogger
from tasks.fibonacci import TASK as FIBONACCI


def test_mock_researcher_improves_naive_fibonacci():
    llm_client = LLMClient()
    assert llm_client.is_mock, "test expects no ANTHROPIC_API_KEY in the test environment"

    with tempfile.TemporaryDirectory() as tmp:
        logger = RunLogger(Path(tmp))
        engine = RSIEngine(FIBONACCI, llm_client, logger)
        best_code, best_result = engine.run(num_generations=2)

    assert best_result.all_passed
    assert "lru_cache" in best_code


def test_mock_stabilizes_after_first_improvement():
    llm_client = LLMClient()
    engine = RSIEngine(FIBONACCI, llm_client)
    best_code, best_result = engine.run(num_generations=3)
    # second and third generations propose the same memoized code again,
    # so it should be accepted once and then simply not regress.
    assert best_result.all_passed
    assert best_result.score > 0
