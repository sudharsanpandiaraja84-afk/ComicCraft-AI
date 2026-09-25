import quality_checker
from schemas import QualityCheckReport, StoryBlueprint, StoryCharacter, StoryPlotStructure


class TestQualityChecker:
    """Unit tests for evaluate_quality_heuristics in quality_checker.py."""

    def test_evaluate_quality_heuristics_full_story(self, sample_blueprint, sample_characters):
        story_text = (
            'Dr. Lyra Mercer scanned the telemetry logs. "The frequency is locking on."\n\n'
            'Director Vance Holt crossed the control room. "Shut it down immediately, Lyra."\n\n'
            "The signals cascaded through the subterranean array, illuminating ancient symbols.\n\n"
            "Every console hummed with unexpected resonance as the countdown reached zero.\n\n"
            "Outside, the Atacama winds howled against the dish as she keyed the override sequence."
        )
        report = quality_checker.evaluate_quality_heuristics(
            story_text, sample_blueprint, sample_characters
        )

        assert isinstance(report, QualityCheckReport)
        assert report.plot_consistency is True
        assert report.character_consistency is True
        assert report.genre_alignment is True
        assert report.story_structure is True

        # Score bounds: must be between 0 and 98
        for score_field in [
            report.plot_coherence_score,
            report.character_consistency_score,
            report.genre_fidelity_score,
            report.pacing_score,
            report.dialogue_score,
            report.originality_score,
        ]:
            assert 0 <= score_field <= 98

        # 5 paragraphs -> pacing_score == 91
        assert report.pacing_score == 91
        # Has dialogue -> dialogue_score == 92
        assert report.dialogue_score == 92

        assert len(report.strengths) > 0
        assert report.critique != ""
        assert len(report.improvements_made) > 0
        assert sample_blueprint.genre.lower() in report.critique.lower()

    def test_dialogue_presence_double_quotes(self, sample_blueprint, sample_characters):
        story_text = 'Dr. Lyra Mercer observed the console. "We have received the transmission."'
        report = quality_checker.evaluate_quality_heuristics(
            story_text, sample_blueprint, sample_characters
        )
        assert report.dialogue_score == 92

    def test_dialogue_presence_curly_quotes(self, sample_blueprint, sample_characters):
        story_text = "Dr. Lyra Mercer observed the console. “We have received the transmission.”"
        report = quality_checker.evaluate_quality_heuristics(
            story_text, sample_blueprint, sample_characters
        )
        assert report.dialogue_score == 92

    def test_dialogue_presence_single_quotes(self, sample_blueprint, sample_characters):
        story_text = "Dr. Lyra Mercer observed the console. 'We have received the transmission.'"
        report = quality_checker.evaluate_quality_heuristics(
            story_text, sample_blueprint, sample_characters
        )
        assert report.dialogue_score == 92

    def test_dialogue_absence_lowers_dialogue_score(self, sample_blueprint, sample_characters):
        story_text = "The stars flickered silently across the vast desert sky. No sound disturbed the observatory."
        report = quality_checker.evaluate_quality_heuristics(
            story_text, sample_blueprint, sample_characters
        )
        assert report.dialogue_score == 80

    def test_paragraph_count_affects_plot_and_pacing(self, sample_blueprint, sample_characters):
        # 1 paragraph: plot_score base 92 (no paragraph/word boost), pacing 85
        short_text = "Dr. Lyra Mercer examined the quiet monitors without speaking a single word."
        report_short = quality_checker.evaluate_quality_heuristics(
            short_text, sample_blueprint, sample_characters
        )
        assert report_short.pacing_score == 85
        assert report_short.plot_coherence_score == 92

        # 4 paragraphs: plot_score gets +3 (95)
        four_para = "\n\n".join(
            [
                "Dr. Lyra Mercer sat at the terminal.",
                "Director Vance Holt looked on with skepticism.",
                "The screen flashed green with incoming data.",
                "Both knew the discovery would change everything.",
            ]
        )
        report_four = quality_checker.evaluate_quality_heuristics(
            four_para, sample_blueprint, sample_characters
        )
        assert report_four.plot_coherence_score >= 95
        assert report_four.pacing_score == 85  # < 5 paragraphs

        # 5 paragraphs: pacing gets 91
        five_para = four_para + "\n\nFinally the dawn broke over the mountains."
        report_five = quality_checker.evaluate_quality_heuristics(
            five_para, sample_blueprint, sample_characters
        )
        assert report_five.pacing_score == 91

    def test_word_count_boost_for_600_words(self, sample_blueprint, sample_characters):
        # Story with > 600 words and >= 4 paragraphs
        paragraphs = ["Word " * 160 for _ in range(4)]
        long_story = "\n\n".join(paragraphs)
        report = quality_checker.evaluate_quality_heuristics(
            long_story, sample_blueprint, sample_characters
        )
        # Base 92 + 3 (paras >= 4) + 2 (words >= 600) = 97
        assert report.plot_coherence_score == 97

    def test_character_presence_detection(self, sample_blueprint, sample_characters):
        # Story mentioning both characters
        story_both = "Dr. Lyra Mercer met with Director Vance Holt to discuss the array telemetry."
        report_both = quality_checker.evaluate_quality_heuristics(
            story_both, sample_blueprint, sample_characters
        )

        # Story mentioning none of the characters
        story_none = "An unnamed technician sat in an empty laboratory staring at blank screens."
        report_none = quality_checker.evaluate_quality_heuristics(
            story_none, sample_blueprint, sample_characters
        )

        assert report_both.character_consistency_score > report_none.character_consistency_score

    def test_handles_empty_characters_list(self, sample_blueprint):
        story = "The quiet room remained undisturbed by any sound or presence."
        report = quality_checker.evaluate_quality_heuristics(story, sample_blueprint, [])
        assert isinstance(report, QualityCheckReport)
        assert "protagonist" in report.strengths[1].lower()

    def test_handles_empty_story_text(self, sample_blueprint, sample_characters):
        report = quality_checker.evaluate_quality_heuristics(
            "", sample_blueprint, sample_characters
        )
        assert isinstance(report, QualityCheckReport)
        assert report.dialogue_score == 80
        assert report.pacing_score == 85

    def test_scores_never_exceed_cap_of_98(self):
        # Create blueprint and characters
        bp = StoryBlueprint(
            title="Max Score Test",
            genre="Science Fiction",
            premise="A test premise",
            main_conflict="Test conflict",
            theme="Test theme",
            setting="Test setting",
            main_characters=["Hero"],
            character_motivations="Test motivation",
            plot=StoryPlotStructure(
                introduction="Intro",
                rising_action="Rise",
                climax="Climax",
                falling_action="Fall",
                resolution="End",
            ),
            ending_type="Happy",
        )
        chars = [
            StoryCharacter(
                name="Hero",
                role="Protagonist",
                age="30",
                gender="Any",
                personality="Brave",
                background="Test",
                motivation="Win",
                goal="Win",
                fear="Loss",
                strength="Power",
                weakness="Pride",
                relationships="None",
                character_arc="Growth",
            )
        ]
        # Text with 10 paragraphs, 1000 words, dialogue, and character present
        paras = [
            'Hero said, "We will win this fight and succeed."' + " more text" * 20
            for _ in range(10)
        ]
        text = "\n\n".join(paras)
        report = quality_checker.evaluate_quality_heuristics(text, bp, chars)

        assert report.plot_coherence_score <= 98
        assert report.character_consistency_score <= 98
        assert report.genre_fidelity_score <= 98
        assert report.pacing_score <= 98
        assert report.dialogue_score <= 98
        assert report.originality_score <= 98
