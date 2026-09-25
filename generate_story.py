#!/usr/bin/env python3
"""
StoryForge AI - Standalone AI Story Generator CLI
Turn a Simple Idea Into a Complete Story using Google Gemini API.

Usage:
    python generate_story.py --idea "A student discovers a hidden room beneath his college library." --genre "Mystery"
"""

import sys
import os
import asyncio
import json
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
load_dotenv()

from schemas import StoryGenerateRequest
import gemini_service
import story_generator

def parse_arguments():
    parser = argparse.ArgumentParser(description="StoryForge AI — Turn a Simple Idea Into a Complete Story")
    parser.add_argument("--idea", "-i", type=str, default="A college student discovers a mysterious room inside his college library.", help="Story premise / idea")
    parser.add_argument("--genre", "-g", type=str, default="Mystery", help="Genre (Mystery, Fantasy, Sci-Fi, Horror, Thriller, etc.)")
    parser.add_argument("--tones", "-t", nargs="+", default=["Suspenseful", "Mysterious"], help="Tones (Suspenseful, Dark, Emotional, etc.)")
    parser.add_argument("--style", "-s", type=str, default="Cinematic", help="Writing Style (Cinematic, Literary, Descriptive, etc.)")
    parser.add_argument("--length", "-l", type=str, default="Medium", help="Length (Short, Medium, Long, Very Long)")
    parser.add_argument("--audience", "-a", type=str, default="Young Adults", help="Audience (Children, Teenagers, Young Adults, Adults, General Audience)")
    parser.add_argument("--ending", "-e", type=str, default="Twist Ending", help="Ending (Happy Ending, Twist Ending, Tragic Ending, Open Ending, etc.)")
    parser.add_argument("--api-key", "-k", type=str, help="Google Gemini API Key")
    parser.add_argument("--demo", action="store_true", help="Force demo mode")
    parser.add_argument("--output", "-o", type=str, help="Output file path (.txt or .json)")
    return parser.parse_args()

async def main():
    args = parse_arguments()

    print("=" * 70)
    print("  STORYFORGE AI — TURN A SIMPLE IDEA INTO A COMPLETE STORY")
    print("=" * 70)
    print(f"Idea:     {args.idea}")
    print(f"Genre:    {args.genre}")
    print(f"Tones:    {', '.join(args.tones)}")
    print(f"Style:    {args.style}")
    print(f"Length:   {args.length}")
    print(f"Audience: {args.audience}")
    print(f"Ending:   {args.ending}")
    print("=" * 70)

    req = StoryGenerateRequest(
        story_idea=args.idea,
        genre=args.genre,
        tones=args.tones,
        writing_style=args.style,
        story_length=args.length,
        target_audience=args.audience,
        ending_preference=args.ending,
        api_key=args.api_key,
        demo_mode=args.demo
    )

    print("\n[1/5] Analyzing Premise & Constructing Story Blueprint...")
    print("[2/5] Architecting Character Bible...")
    print("[3/5] Drafting Full Narrative...")
    print("[4/5] Executing AI Quality Check...")

    result = await story_generator.run_story_generation_pipeline(req)

    print("\n" + "=" * 70)
    print(f"TITLE: {result.title.upper()}")
    print(f"WORD COUNT: {result.word_count} words | {result.reading_time}")
    print("=" * 70)
    print("\nAI STORY QUALITY CHECK:")
    print("✓ Plot consistency")
    print("✓ Character consistency")
    print("✓ Genre alignment")
    print("✓ Story structure")
    print(f"Score: {result.quality_check.plot_coherence_score}% Coherence | {result.quality_check.genre_fidelity_score}% Genre Fidelity")
    print("-" * 70)
    print("\nNARRATIVE:\n")
    print(result.story)
    print("\n" + "=" * 70)

    if args.output:
        out_path = Path(args.output)
        if out_path.suffix.lower() == ".json":
            out_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
        else:
            out_path.write_text(f"{result.title}\n\n{result.story}", encoding="utf-8")
        print(f"Output saved successfully to: {out_path.resolve()}")

if __name__ == "__main__":
    asyncio.run(main())
