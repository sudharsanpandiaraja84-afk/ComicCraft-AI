import os
import sys
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import demo_data
from main import app
from schemas import (
    AdvancedStoryOptions,
    CompleteStoryResponse,
    StoryBlueprint,
    StoryCharacter,
    StoryGenerateRequest,
    StoryPlotStructure,
    UserInputCharacter,
)


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Test client for FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_generate_request() -> StoryGenerateRequest:
    """Fixture providing a standard valid StoryGenerateRequest."""
    return StoryGenerateRequest(
        story_idea="A young astronomer detects a repeating signal from a dead star that speaks in ancient Sumerian.",
        genre="Science Fiction",
        story_length="Medium",
        tones=["Mysterious", "Philosophical"],
        writing_style="Cinematic",
        target_audience="Young Adults",
        ending_preference="Twist Ending",
        characters=[
            UserInputCharacter(
                name="Dr. Lyra Mercer",
                age="32",
                role="Protagonist",
                personality="Obsessive, brilliant, skeptical",
                gender="Female",
                details="Former academic exiled for unorthodox signals research",
            )
        ],
        advanced_options=AdvancedStoryOptions(
            num_characters="2-3",
            setting="Remote Andean Observatory",
            time_period="Near Future",
            location="Chilean Atacama Desert",
            complexity="Complex",
            dialogue_amount="Balanced",
            description_level="Rich & Vivid",
            plot_twist="The signal is not arriving, it is an echo from Earth's own future",
            moral="Pursuit of forbidden truth demands reckoning with humility",
        ),
    )


@pytest.fixture
def sample_blueprint() -> StoryBlueprint:
    """Fixture providing a valid StoryBlueprint."""
    return StoryBlueprint(
        title="Echoes of the Dead Star",
        genre="Science Fiction",
        premise="An exiled astronomer detects a pulsar whose magnetic pulse encodes a human language older than civilization.",
        main_conflict="Scientific verification vs escalating psychological unraveling as the signal begins predicting their decisions.",
        theme="The illusion of linear time and humanity's cyclical Hubris.",
        setting="High-altitude Atacama radio observatory shrouded in perpetual freezing winds.",
        main_characters=["Dr. Lyra Mercer", "Director Vance Holt"],
        character_motivations="Lyra seeks redemption; Holt seeks institutional preservation.",
        plot=StoryPlotStructure(
            introduction="Lyra isolates anomalous frequency harmonics inside the submillimeter array.",
            rising_action="Decryption matches ancient phonetic roots while satellite telemetry indicates no extraterrestrial origin.",
            climax="The observatory locks down as the final stanza transmits the exact coordinates of the listening station.",
            falling_action="Lyra realizes the pulsar is a temporal mirror reflecting Earth's dying transmission.",
            resolution="She broadcasts the warning key back into the array, sealing the time loop.",
        ),
        ending_type="Twist Ending",
    )


@pytest.fixture
def sample_characters() -> list[StoryCharacter]:
    """Fixture providing sample StoryCharacter objects."""
    return [
        StoryCharacter(
            name="Dr. Lyra Mercer",
            age="32",
            role="Protagonist",
            personality="Tenacious, analytical, hyper-vigilant",
            gender="Female",
            background="Grew up in remote mining towns; doctorate in high-energy astrophysics.",
            motivation="Prove her father's discredited temporal transmission theory.",
            goal="Decode the dead star's repeating harmonic sequence.",
            fear="Succumbing to the same cognitive spiral that destroyed her mentor.",
            strength="Uncanny spatial pattern recognition.",
            weakness="Reckless disregard for safety protocols.",
            relationships="Distrustful of Vance Holt; protective of junior technician Tomas.",
            character_arc="Transitions from vindictive isolation to sacrificial acceptance.",
        ),
        StoryCharacter(
            name="Director Vance Holt",
            age="58",
            role="Antagonist",
            personality="Pragmatic, authoritarian, politically astute",
            gender="Male",
            background="Bureaucrat and former planetary scientist overseeing observatory budget.",
            motivation="Prevent defense contractors from privatizing the facility.",
            goal="Suppress anomalous signal leaks to maintain state grant funding.",
            fear="Loss of control and scientific irrelevance.",
            strength="Strategic negotiation and bureaucratic manipulation.",
            weakness="Inability to embrace paradigm-shifting evidence.",
            relationships="Former patron turned adversary of Lyra Mercer.",
            character_arc="Cracks under mounting undeniable proof, forfeiting pride.",
        ),
    ]


@pytest.fixture
def sample_story_response() -> CompleteStoryResponse:
    """Fixture providing a demo complete story response."""
    return demo_data.get_demo_project()
