import uuid
from typing import Dict, Any, List, Optional
from schemas import (
    CompleteStoryResponse, StoryBlueprint, StoryCharacter,
    StoryPlotStructure, QualityCheckReport, Chapter
)

DEMO_STORY_TEXT = """The subterranean level of St. Jude College’s Carlyle Memorial Library was where dust went to die. High arched vaults of grey granite, chilled by centuries of New England river damp, pressed down against towering aisles of calfskin folios. Most undergraduates rarely ventured beyond the glowing fluorescent banks of the second-floor computer lab. But Julian Hayes was not most students.

Armed with an ink-stained notebook and a brass pocket flashlight, Julian pulled a heavy, velvet-bound copy of the 1894 Campus Cartography from shelf 14-B. As the spine separated with a dry sigh, something metallic clicked inside the oak wainscoting behind him.

Julian froze.

In the breathless silence of the archives, the only sound was the rhythmic thrum of the college steam furnace three floors down. He shone his flashlight along the baseboards. Where the solid mahogany casing met the stone foundation, the shadow lay just a fraction of an inch too deep.

Kneeling, his thumb traced the carved relief of the college crest: a serpent coiled around an hourglass. On closer inspection, the serpent's emerald glass eye wasn't an ornament at all. It was a spring-loaded latch.

With a gentle press, the mechanism gave way with the hiss of counterweights long suspended in oil. A three-foot section of the bookcase swung outward on concealed bronze pintles, exhaling a draft of air that smelled of ozone, beeswax, and dried parchment.

"Stepping through uncataloged thresholds is generally frowned upon by the Dean's council, Mr. Hayes."

Julian spun around, heart hammering against his ribs.

Standing at the end of aisle fourteen was Dr. Eleanor Vance, the head archivist. In her knitted cardigan, silver spectacles hanging from a cord around her neck, she looked every bit the harmless scholar of nineteenth-century philology. But the flashlight caught the glint of a heavy iron key ring in her hand, and her eyes held none of the usual academic weariness. They were sharp as flint.

"Dr. Vance," Julian stammered, his fingers still brushing the secret doorway. "I... I was looking for the original architectural drafts of the bell tower."

"And instead, you found the Founder’s Scriptorium," Dr. Vance said quietly, stepping into the alcove. She didn't call campus security. She didn't sound angry. Her voice was taut with a gravity that made the hair on Julian's forearms prickle. "Thirty-two years I have tended Carlyle Library, waiting to see which student would notice the discrepancy in the floor thickness between the reading hall and the cellar."

"What is inside?" Julian whispered.

"The truth about why this college was built on the river bend," she said, raising her oil lantern. "And why Silas Reed has spent the past six months purchasing ninety percent of the college trustees' votes."

Julian knew the name. Silas Reed was the billionaire tech alumnus whose foundation had just offered a fifty-million-dollar grant to 'renovate' Carlyle Library—a renovation that called for the complete excavation of the foundation.

Stepping across the threshold, Julian descended five stone steps into a circular chamber paved with hexagonal slate tiles. Unlike the damp stacks outside, the room was bone-dry. In the center sat an octagonal drafting table made of polished mahogany, upon which rested a brass astrolabe and a leather ledger stamped with the crest of the Obsidian Quill: the secret society founded by the first seven chancellors.

Julian approached the table, his breath catching. "The ledger... it's a logbook of predictive transcripts."

"Not prophecies," Vance corrected, her fingers trembling slightly as she touched the vellum. "Algorithmic forecasting. In 1888, mathematician Alistair Carlyle engineered a mechanical difference engine driven by river current beneath this floor. It didn't predict the future through mysticism; it modeled human behavior, financial panics, and academic breakthroughs with terrifying fidelity."

"And Silas Reed wants it," Julian murmured.

"Silas Reed already had access to it," a deep, cultured voice echoed from the stairs.

Julian and Vance whirled.

Silas Reed himself stood framed in the concealed doorway, his bespoke cashmere overcoat damp from the autumn rain outside. Two burly security guards flanked him, their silhouettes blocking the narrow stone stairs.

"A romantic explanation, Eleanor," Reed said, a thin, patronizing smile playing on his lips. "A mechanical genius calculating the future with cogs and waterwheels. It makes for an enchanting campus myth."

Julian stepped protectively in front of the table. "You don't care about renovating the library. You want to destroy the records."

"Destroy them?" Reed laughed softly, taking two deliberate steps down the slate stairs. "My dear boy, you have the causality entirely backward. Carlyle didn't build a forecasting engine. He built a chronicle of systemic corruption—every bribe, every forged patent, every land swindle that financed the Ivy League for a century. My great-grandfather wasn't Carlyle’s patron; he was the man who locked Carlyle inside this very chamber to ensure the ledger never reached the state prosecutor."

Dr. Vance's face went white. "You're saying..."

"The difference engine was never down here," Reed whispered, gesturing to the guards. "The engine was completed in Boston. What is down here is the original signed confession of Julian’s own great-grandfather—the chief magistrate who signed Carlyle’s commitment papers to the asylum."

Julian stared at the open ledger. On the final page, beneath the crimson wax seal, was an ornate signature in iron gall ink: *Julian Hayes I, Magistrate of the Commonwealth, 1894.*

The room plunged into sudden cold clarity. He hadn't stumbled upon the hidden chamber by accident. The latch had responded to the specific balance of the silver signet ring his father had given him for his twentieth birthday—a ring passed down through four generations of Hayes men, engineered to open the door only when the bloodline returned to pay its debt.

"Now, Julian," Reed said softly, extending an open hand. "Do we burn the page together, or does your family name join mine in the headlines tomorrow morning?"

Julian looked from the trembling, righteous eyes of Dr. Vance to the predatory certainty in Silas Reed's smile. Then his gaze dropped to the brass lever beneath the table edge—the emergency release for the river sluice gate described on page twenty-two of the Campus Cartography.

With a sudden, decisive motion, Julian wrenched the lever downward."""

def get_demo_project() -> CompleteStoryResponse:
    """Returns the pre-computed rich demo story project."""
    blueprint = StoryBlueprint(
        title="The Whispering Archives",
        genre="Mystery",
        premise="While researching in the basement of St. Jude College's historic Carlyle Library, student Julian Hayes discovers a sealed chamber containing a nineteenth-century predictive ledger—and uncovers a dangerous conspiracy implicating both a tech mogul and his own family.",
        main_conflict="Julian must decide whether to expose a century-old academic conspiracy that will destroy his family legacy or allow a ruthless tech billionaire to bury the truth forever.",
        theme="The weight of inherited sins and the courage to choose truth over preservation of reputation.",
        setting="Carlyle Memorial Library at St. Jude College, Massachusetts: an oppressive Romanesque stone fortress filled with subterranean tunnels, antique folios, and autumn mist.",
        main_characters=["Julian Hayes", "Dr. Eleanor Vance", "Silas Reed"],
        character_motivations="Julian seeks truth and identity; Dr. Vance seeks historical justice; Silas Reed seeks to sanitize his dynasty's past at all costs.",
        plot=StoryPlotStructure(
            introduction="Julian discovers a hidden mechanical latch disguised as a crest in the lowest stacks of Carlyle Library.",
            rising_action="Head archivist Dr. Vance reveals the chamber's secret, just as billionaire alumnus Silas Reed intercepts them.",
            climax="Reed reveals the devastating truth: the ledger contains the confession of Julian's own ancestor.",
            falling_action="With security guards closing in, Julian assesses the moral cost of silence versus exposure.",
            resolution="Julian triggers the emergency sluice lever, choosing to expose the truth to the river below and rewrite his legacy on his own terms."
        ),
        ending_type="Twist Ending"
    )

    characters = [
        StoryCharacter(
            name="Julian Hayes",
            age="20",
            role="Main Protagonist",
            personality="Inquisitive, analytical, courageous, fiercely principled yet introspective.",
            gender="Male",
            background="A junior history major attending St. Jude on academic scholarship, wearing his great-grandfather's heirloom signet ring.",
            motivation="To uncover historical anomalies and prove his self-worth independent of family expectations.",
            goal="Decipher the mystery of the Carlyle basement and preserve the library's integrity.",
            fear="Discovering that his family's pride is built upon deceit.",
            strength="Exceptional observational deduction and photographic recall of architectural blueprints.",
            weakness="Hesitant when confronted with complex moral ambiguity.",
            relationships="Mentored by Dr. Vance; direct philosophical adversary to Silas Reed.",
            character_arc="Transforms from a naive researcher into a decisive agent who accepts moral responsibility for the past."
        ),
        StoryCharacter(
            name="Dr. Eleanor Vance",
            age="58",
            role="Mentor / Guardian of Lore",
            personality="Stern, meticulous, perceptive, harboring quiet defiance against institutional greed.",
            gender="Female",
            background="Chief archivist for over three decades; unofficially tracking the missing archives since her own graduate days.",
            motivation="To protect the unfiltered truth of Carlyle's founders from corporate erasure.",
            goal="Safeguard the Obsidian Quill manuscripts and pass the guardianship to an honest successor.",
            fear="Seeing thirty years of silent vigilance overturned by corporate wealth.",
            strength="Encyclopedic mastery of 19th-century archival cryptography and campus history.",
            weakness="Physical frailty and lack of institutional allies among the university board.",
            relationships="Treats Julian as a worthy intellectual apprentice; views Reed as a cynical vandal.",
            character_arc="Moves from passive preservationist to actively assisting Julian in an irreversible act of defiance."
        ),
        StoryCharacter(
            name="Silas Reed",
            age="45",
            role="Antagonist / Ruthless Benefactor",
            personality="Charismatic, smooth, calculating, wielding institutional leverage like a surgical scalpel.",
            gender="Male",
            background="Tech billionaire and influential college trustee who amassed a fortune by commercializing predictive data models.",
            motivation="To erase any historical paper trail proving his technology was derived from stolen university research.",
            goal="Acquire or destroy the original 1894 ledger before the upcoming federal patent audit.",
            fear="Public disgrace and the collapse of his corporate empire.",
            strength="Unlimited financial capital, security assets, and deep psychological intimidation tactics.",
            weakness="Arrogant presumption that every individual has a negotiable price.",
            relationships="Antagonistic toward Julian and Vance; treats the college as a personal commodity.",
            character_arc="His veneer of calm control cracks when confronted by someone whose loyalty cannot be bought."
        )
    ]

    quality_check = QualityCheckReport(
        plot_consistency=True,
        character_consistency=True,
        genre_alignment=True,
        story_structure=True,
        plot_coherence_score=97,
        character_consistency_score=96,
        genre_fidelity_score=98,
        pacing_score=94,
        dialogue_score=95,
        originality_score=96,
        strengths=[
            "Flawless mystery progression with physical clues (emerald latch, signet ring) paying off organically.",
            "High-stakes psychological confrontation in a confined atmospheric setting.",
            "Subversive twist that personalizes the conflict for the protagonist without feeling unearned.",
            "Sharp, rhythmic dialogue highlighting ideological contrast between scholar, mentor, and oligarch."
        ],
        critique="The narrative masterfully blends Gothic academic mystery with modern corporate thriller stakes.",
        improvements_made=[
            "Reinforced the sensory details of the subterranean granite and river draft.",
            "Tightened the pacing during Reed's confrontation to heighten claustrophobic urgency."
        ]
    )

    chapters = [
        Chapter(
            chapter_number=1,
            title="The Emerald Latch",
            content=DEMO_STORY_TEXT,
            word_count=len(DEMO_STORY_TEXT.split()),
            summary="Julian discovers the secret room beneath Carlyle Library and is confronted by Dr. Vance and Silas Reed."
        ),
        Chapter(
            chapter_number=2,
            title="The Sluice of River Mist",
            content="""The brass sluice gate shuddered. Somewhere beneath the hexagonal tiles, fifty tons of dark river water surged through the bypass canal, sending a violent vibration through the soles of Silas Reed's Italian boots.

"What did you just do, boy?" Reed shouted, his composed demeanor fracturing as the sound of roaring water rose through the granite foundations.

"I didn't destroy the records, Mr. Reed," Julian said, his hand still locked onto the lever. "I triggered the library's original fire-drowning protocol. In three minutes, this entire basement level will be sealed behind two-ton pneumatic bulkhead doors—and the emergency siren on the Quad will sound."

Dr. Vance grasped Julian's shoulder. "The dumbwaiter in the east corner, Julian! The old book lift to the bell tower—it’s outside the bulkhead perimeter!"

Reed’s guards lunged forward, but the floor tilted with an ominous groan as the hydraulic pistons engaged. Julian snatched the 1894 ledger from the drafting table, threw his weight against the iron grating of the book lift, and hauled Dr. Vance inside just as the steel emergency blast door crashed down between them and Silas Reed's outstretched hand.

In the pitch-black darkness of the ascending lift, Julian could hear the emergency klaxons echoing across the college campus above. In his hands, the leather of his great-grandfather's confession felt warm, heavy, and undeniable.

The past was no longer buried. And tomorrow morning, neither was he.""",
            word_count=235,
            summary="Julian activates the library emergency protocol and escapes Silas Reed's men with the ledger."
        )
    ]

    return CompleteStoryResponse(
        id="demo-story-carlyle-mystery-001",
        title="The Whispering Archives",
        genre="Mystery",
        tones=["Suspenseful", "Mysterious", "Atmospheric"],
        writing_style="Cinematic",
        target_audience="Young Adults",
        ending_type="Twist Ending",
        story=DEMO_STORY_TEXT,
        word_count=len(DEMO_STORY_TEXT.split()),
        reading_time="6 min read",
        blueprint=blueprint,
        characters=characters,
        quality_check=quality_check,
        chapters=chapters,
        is_demo=True,
        created_at="Demo Edition"
    )

def get_demo_regenerated_story(regeneration_option: str = "Same idea, different story", custom_instruction: str = "") -> CompleteStoryResponse:
    """Returns a completely different narrative interpretation of the same idea for demo mode."""
    v2_text = """The brass-faced grandfather clock in the corner of St. Jude College's West Wing repository had not ticked since the hurricane of 1938. Or so sophomore archivist Maya Lin had been instructed to believe.

Yet at 1:17 AM on a freezing Tuesday, Maya heard the rhythmic, hydraulic clatter of escapement gears echoing from behind the antique book press in aisle seven. Armed with a sketch pad and an ultraviolet inspection lamp, she moved between rows of decaying leather folios until the purple light illuminated fresh graphite scuffs along the floorboards.

Behind a false panel in the oak wainscoting lay a concealed circular passage leading downward. At the foot of the spiraling iron steps, Maya discovered an active, subterranean cartography salon illuminated by green glass banker lamps. In the center sat an electromechanical difference telegraph, its brass dials whirring as it punched ticker tape onto a copper spindle.

"The clockwork doesn't measure time, Miss Lin," a gravelly voice spoke from the shadows.

President Sterling sat at the mahogany conference table, surrounded by silver gelatin plates drying in wooden racks. "It measures campus liability. Every time an alumnus buries a scandal or an uncataloged endowment arrives, the pendulum shifts."

Maya held up the ticker tape she had gathered. "These aren't financial records, President Sterling. These are names of students who discovered this chamber over eighty years—and the precise administrative decisions that expelled them."

Sterling didn't flinch. Instead, he slid an unaddressed envelope across the green baize. Inside was a full-tuition fellowship certificate stamped with Maya's name, dated six months before she had even submitted her college application.

"You weren't assigned work-study in this repository by chance," Sterling whispered. "The syndicate doesn't silence investigators. We recruit them."

Maya looked from the golden crest of the fellowship to the humming copper telegraph, realizing with sudden clarity that the previous archivist hadn't resigned—she had graduated into the silence."""

    blueprint_v2 = StoryBlueprint(
        title="The Clockwork Syndicate",
        genre="Mystery",
        premise="While working late in the college repository, student Maya Lin discovers a functioning subterranean telegraph chamber operated by the university administration to monitor campus secrets—and discovers she was selected to be its next guardian.",
        main_conflict="Maya must decide between accepting an elite fellowship to protect the institution's secrets or leaking decades of expelled students' suppressed records.",
        theme="Institutional complicity versus moral whistleblowing.",
        setting="Subterranean cartography salon beneath St. Jude West Wing, filled with green banker lamps, ticking brass relays, and copper ticker tapes.",
        main_characters=["Maya Lin", "President Arthur Sterling"],
        character_motivations="Maya seeks academic independence; Sterling seeks an incorruptible successor to maintain campus stability.",
        plot=StoryPlotStructure(
            introduction="Maya hears the long-broken grandfather clock ticking and discovers the hidden salon behind aisle seven.",
            rising_action="She inspects the ticker tape records and realizes eighty years of expulsions were coordinated here.",
            climax="President Sterling confronts her and reveals she was pre-selected through a fellowship arranged before she enrolled.",
            falling_action="Maya weighs the prestige of joining the inner circle against the ethical cost of complicity.",
            resolution="Maya palms a spool of copper tape into her boot before accepting Sterling's pen, playing the long game from the inside."
        ),
        ending_type="Twist Ending"
    )

    characters_v2 = [
        StoryCharacter(
            name="Maya Lin",
            age="19",
            role="Main Protagonist",
            personality="Pragmatic, vigilant, mathematically gifted, harboring deep distrust of institutional authority.",
            gender="Female",
            background="First-generation scholarship student working night shifts in the archives.",
            motivation="To maintain her scholarship while defending vulnerable peers.",
            goal="Expose the mechanics of administrative retribution.",
            fear="Becoming the very thing she fights against.",
            strength="Mastery of cipher decryption and rapid tactical deduction.",
            weakness="Tendency to keep dangerous secrets to herself.",
            relationships="Distrustful mentee to President Sterling.",
            character_arc="Transitions from an outsider trying to survive to a strategic infiltrator within the university hierarchy."
        ),
        StoryCharacter(
            name="President Arthur Sterling",
            age="62",
            role="Antagonist / Pragmatic Guardian",
            personality="Refined, softly spoken, unflinching, believing institutional survival supersedes individual morality.",
            gender="Male",
            background="Forty-year veteran of higher education governance; third-generation syndicate overseer.",
            motivation="Prevent the university's collapse by managing historical debt.",
            goal="Pass the mechanical telegraph stewardship to Maya.",
            fear="Chaotic public exposure of systemic endowments.",
            strength="Unmatched bureaucratic foresight and psychological leverage.",
            weakness="Inability to understand idealism that cannot be bought.",
            relationships="Sees Maya as the sharpest student he has encountered in twenty years.",
            character_arc="Is outmaneuvered when Maya accepts the contract while securing the incriminating spool."
        )
    ]

    quality_v2 = QualityCheckReport(
        plot_consistency=True,
        character_consistency=True,
        genre_alignment=True,
        story_structure=True,
        plot_coherence_score=96,
        character_consistency_score=95,
        genre_fidelity_score=97,
        pacing_score=95,
        dialogue_score=96,
        originality_score=98,
        strengths=[
            "Completely fresh narrative interpretation retaining the student-discovers-secret-room premise.",
            "Compelling institutional conspiracy with high-stakes moral dilemma.",
            "Subtle ending that leaves the protagonist poised as an undercover operative."
        ],
        critique="Offers a cerebral political twist on academic mystery.",
        improvements_made=["Heightened the tactile sensory details of the ticker tape and brass telegraph."]
    )

    return CompleteStoryResponse(
        id=f"demo-regen-{uuid.uuid4().hex[:8]}",
        title="The Clockwork Syndicate",
        genre="Mystery",
        tones=["Suspenseful", "Intriguing", "Dark"],
        writing_style="Cinematic",
        target_audience="Young Adults",
        ending_type="Twist Ending",
        story=v2_text,
        word_count=len(v2_text.split()),
        reading_time="5 min read",
        blueprint=blueprint_v2,
        characters=characters_v2,
        quality_check=quality_v2,
        chapters=[
            Chapter(
                chapter_number=1,
                title="The Ticking Escapement",
                content=v2_text,
                word_count=len(v2_text.split()),
                summary="Maya Lin tracks the ticking clockwork into a subterranean administrative salon."
            )
        ],
        is_demo=True,
        created_at="Demo Regenerated Version"
    )

def get_demo_version_comparison(title_a: str, title_b: str) -> Dict[str, Any]:
    """Provides structured comparative analysis between story versions."""
    return {
        "version_a_id": "ver_a",
        "version_b_id": "ver_b",
        "title_a": title_a,
        "title_b": title_b,
        "summary_a": "Julian Hayes uncovers his family's historical complicity in an 1894 conspiracy and destroys the evidence via river sluice.",
        "summary_b": "Maya Lin discovers an active administrative secret syndicate monitoring campus liability and agrees to infiltrate it from within.",
        "characters_a": ["Julian Hayes", "Dr. Eleanor Vance", "Silas Reed"],
        "characters_b": ["Maya Lin", "President Arthur Sterling"],
        "plot_differences": "Version A focuses on genealogical guilt, corporate extortion, and physical confrontation over 19th-century records. Version B pivots into institutional espionage, psychological recruitment, and mechanical telegraph surveillance.",
        "ending_differences": "Version A ends with an explosive, irreversible act of public defiance as river water seals the chamber. Version B concludes with an ambiguous, calculating compromise where the protagonist infiltrates the syndicate.",
        "tone_and_style_differences": "Version A has a Gothic, high-adrenaline thriller tone with dramatic confrontations. Version B leans into cerebral, noir institutional suspense with quiet menace.",
        "recommendation": "Choose Version A for heart-pounding physical stakes and ancestral drama; choose Version B for psychological intrigue and political espionage."
    }

def get_demo_story_scenes(visual_style: str = "Cinematic", target_count: int = 5) -> Dict[str, Any]:
    """Generates rich structured visual scenes and profiles for demo story visualization."""
    julian = {
        "name": "Julian Hayes",
        "age": "20",
        "gender": "Male",
        "face_description": "sharp jawline, focused analytical dark eyes, determined brow",
        "skin_tone": "fair with warm undertones",
        "hair": "wavy dark brown hair",
        "hairstyle": "slightly tousled collegiate cut",
        "eye_color": "dark brown",
        "body_type": "lean, athletic collegiate build",
        "clothing": "dark charcoal wool coat, slate grey knit crewneck sweater, dark denim trousers, worn leather boots",
        "accessories": "vintage silver signet ring with coiled serpent crest on right hand, canvas messenger bag with brass buckles",
        "distinctive_features": "silver signet ring heirloom, faint ink smudge on right fingers",
        "appearance_prompt_snippet": "20-year-old collegiate young man, sharp jawline, tousled wavy dark brown hair, dark brown eyes, wearing dark charcoal wool coat, slate grey knit sweater, vintage silver serpent signet ring"
    }

    vance = {
        "name": "Dr. Eleanor Vance",
        "age": "58",
        "gender": "Female",
        "face_description": "dignified weathered features, piercing observant hazel eyes, tight resolute mouth",
        "skin_tone": "pale porcelain",
        "hair": "silver-streaked steel grey hair",
        "hairstyle": "neatly pinned low chignon",
        "eye_color": "hazel",
        "body_type": "slender, upright posture",
        "clothing": "deep burgundy cable-knit cardigan over high-collared ivory blouse, charcoal wool maxi skirt",
        "accessories": "silver reading spectacles on braided cord, antique heavy brass iron key ring",
        "distinctive_features": "wire-rimmed silver spectacles, piercing scholarly gaze",
        "appearance_prompt_snippet": "58-year-old distinguished woman, silver-streaked grey hair in low chignon, wire-rimmed spectacles, deep burgundy cardigan, holding antique brass key ring"
    }

    reed = {
        "name": "Silas Reed",
        "age": "45",
        "gender": "Male",
        "face_description": "chiseled aristocratic features, piercing icy blue eyes, immaculate groomed stubble",
        "skin_tone": "light tan",
        "hair": "slicked dark hair with silvering temples",
        "hairstyle": "tailored comb-back",
        "eye_color": "icy blue",
        "body_type": "tall, commanding presence, broad shoulders",
        "clothing": "bespoke double-breasted midnight navy cashmere overcoat, tailored charcoal suit, silk tie",
        "accessories": "platinum watch, leather driving gloves",
        "distinctive_features": "commanding smirk, cold predatory gaze",
        "appearance_prompt_snippet": "45-year-old billionaire man, tailored midnight navy cashmere overcoat, slicked dark hair with silver temples, icy blue eyes, chiseled predatory expression"
    }

    loc_stacks = {
        "name": "Carlyle Memorial Library Subterranean Stacks",
        "architecture": "Romanesque Gothic Revival granite arches and ribbed subterranean stone vaulting",
        "environment": "towering double-height dark mahogany bookshelves, dust motes suspended in air, stone flagstone floors",
        "time_period": "midnight in late autumn",
        "color_palette": "deep shadows, aged amber parchment, dark oak, cold slate grey",
        "lighting": "dim amber filament sconces and dramatic sharp beam of brass flashlight cutting through darkness",
        "important_objects": ["towering bookshelf 14-B", "brass pocket flashlight", "emerald serpent carved crest latch"],
        "location_prompt_snippet": "subterranean Gothic college library stacks, towering double-height dark mahogany bookshelves, granite ribbed vaults, dust motes in flashlight beam"
    }

    loc_chamber = {
        "name": "The Founder's Scriptorium",
        "architecture": "circular secret subterranean masonry chamber with hexagonal slate tile floor",
        "environment": "bone-dry stone vault, octagonal polished mahogany drafting table, brass astrolabe, river sluice levers",
        "time_period": "nineteenth-century engineering meets subterranean sanctum",
        "color_palette": "burnished brass, rich oxblood leather, glowing yellow lantern light, deep cavern shadow",
        "lighting": "warm flickering oil lantern glow and cold blue exterior corridor moonlight",
        "important_objects": ["1894 vellum ledger with crimson wax seal", "brass difference engine levers", "hydraulic iron pipes"],
        "location_prompt_snippet": "secret octagonal stone chamber beneath library, hexagonal slate floor, polished mahogany drafting table, oil lantern glow, antique brass instruments"
    }

    demo_scenes = [
        {
            "scene_id": "scene_demo_001",
            "scene_number": 1,
            "title": "The Vaults of Carlyle",
            "description": "Julian Hayes explores the subterranean library aisle with his flashlight, pulling a heavy velvet-bound cartography volume as a mechanical click echoes behind him.",
            "story_excerpt": "Armed with an ink-stained notebook and a brass pocket flashlight, Julian pulled a heavy, velvet-bound copy of the 1894 Campus Cartography from shelf 14-B.",
            "characters_involved": ["Julian Hayes"],
            "location_name": "Carlyle Memorial Library Subterranean Stacks",
            "action": "Julian reaches up to shelf 14-B while aiming his flashlight beam into the shadows of the arched aisle",
            "facial_expression": "Intense focused concentration mixed with sudden alert curiosity",
            "body_language": "Tense posture, body half-turned toward the source of the mechanical sound",
            "camera_angle": "Low angle medium-wide shot looking up past towering bookshelves",
            "composition": "Leading lines of dark oak bookcases converging toward Julian illuminated in the center",
            "lighting": "High-contrast chiaroscuro, sharp circular flashlight beam cutting through velvety dark gloom",
            "time_of_day": "Midnight",
            "visual_style": visual_style,
            "mood": "Suspenseful, atmospheric, intellectual discovery",
            "image_prompt": f"20-year-old collegiate young man with wavy dark brown hair and dark charcoal wool coat, standing in subterranean Gothic college library stacks with towering dark mahogany bookshelves, shining a brass flashlight beam across antique leather folios, dust motes glowing in light, low-angle dramatic framing, {visual_style} aesthetic, masterpiece, 8k resolution, moody cinematic lighting",
            "negative_prompt": "blurry, low quality, distorted face, extra fingers, malformed hands, duplicate character, modern smartphones, fluorescent lights",
            "image_url": "https://image.pollinations.ai/prompt/young%20man%20student%20in%20dark%20charcoal%20coat%20holding%20flashlight%20inside%20grand%20subterranean%20Gothic%20library%20with%20towering%20wooden%20bookshelves%2C%20cinematic%20dramatic%20lighting%2C%208k%20resolution?width=1024&height=640&nologo=true&seed=101"
        },
        {
            "scene_id": "scene_demo_002",
            "scene_number": 2,
            "title": "The Emerald Latch",
            "description": "Kneeling beside shelf 14-B, Julian shines his flashlight on the carved serpent crest and presses the emerald glass eye, triggering the concealed mechanism.",
            "story_excerpt": "On closer inspection, the serpent's emerald glass eye wasn't an ornament at all. It was a spring-loaded latch.",
            "characters_involved": ["Julian Hayes"],
            "location_name": "Carlyle Memorial Library Subterranean Stacks",
            "action": "Julian kneels with his right hand pressing the emerald glass eye on the wainscoting crest, his silver signet ring catching the light",
            "facial_expression": "Breathless fascination and astonishment",
            "body_language": "Crouched low to the stone floor, delicate precise touch on the latch",
            "camera_angle": "Intimate close-up over Julian's shoulder focusing on his hand, signet ring, and the glowing green gem latch",
            "composition": "Focal emphasis on the ornate carved coiled serpent and emerald eye under harsh spotlight",
            "lighting": "Harsh golden flashlight beam illuminating the green emerald gleam against dark mahogany grain",
            "time_of_day": "Midnight",
            "visual_style": visual_style,
            "mood": "Secretive, tantalizing, threshold of discovery",
            "image_prompt": f"Close-up shot of a young man's hand wearing a silver serpent signet ring pressing an ornate carved emerald serpent latch on an antique mahogany wainscoting panel in a dark library, emerald eye gleaming with green light, dramatic chiaroscuro illumination, {visual_style} style, ultra-detailed, 8k resolution",
            "negative_prompt": "blurry, low quality, distorted fingers, extra fingers, malformed hands, cartoonish",
            "image_url": "https://image.pollinations.ai/prompt/close%20up%20of%20young%20mans%20hand%20with%20silver%20serpent%20ring%20pressing%20ornate%20emerald%20serpent%20latch%20on%20antique%20carved%20wooden%20bookcase%2C%20green%20gemstone%20gleam%2C%20dramatic%20lighting%2C%208k?width=1024&height=640&nologo=true&seed=102"
        },
        {
            "scene_id": "scene_demo_003",
            "scene_number": 3,
            "title": "The Founder's Scriptorium",
            "description": "The hidden bookcase swings open on bronze pintles, revealing stone steps leading down into the circular chamber where Dr. Eleanor Vance raises her oil lantern.",
            "story_excerpt": "'Thirty-two years I have tended Carlyle Library, waiting to see which student would notice the discrepancy.'",
            "characters_involved": ["Julian Hayes", "Dr. Eleanor Vance"],
            "location_name": "The Founder's Scriptorium",
            "action": "Dr. Vance holds up a glowing oil lantern guiding Julian down the stone steps into the octagonal secret chamber",
            "facial_expression": "Dr. Vance with grave dignified intensity; Julian with wide-eyed reverence",
            "body_language": "Dr. Vance standing erect and protective; Julian descending hesitantly across the threshold",
            "camera_angle": "Wide atmospheric eye-level shot framing both figures and the secret doorway",
            "composition": "The open bookcase door acts as a dramatic architectural frame into the glowing chamber",
            "lighting": "Warm amber lantern light radiating outward, casting long dancing shadows on granite walls",
            "time_of_day": "Midnight",
            "visual_style": visual_style,
            "mood": "Mystical, historic, monumental reveal",
            "image_prompt": f"Secret doorway in antique library opening to reveal hidden stone steps into a circular chamber, 58-year-old woman with silver hair and spectacles holding a glowing oil lantern beside a 20-year-old young man in dark wool coat, warm amber lantern glow against cold granite arches, {visual_style} aesthetic, cinematic depth of field, 8k resolution",
            "negative_prompt": "blurry, low quality, duplicate figures, distorted faces, modern technology, extra limbs",
            "image_url": "https://image.pollinations.ai/prompt/secret%20doorway%20in%20library%20bookshelf%20open%20revealing%20stone%20steps%20down%20to%20hidden%20room%2C%20older%20woman%20with%20silver%20hair%20holding%20oil%20lantern%20and%20young%20student%20in%20coat%2C%20warm%20lantern%20light%2C%20cinematic?width=1024&height=640&nologo=true&seed=103"
        },
        {
            "scene_id": "scene_demo_004",
            "scene_number": 4,
            "title": "The Confrontation",
            "description": "Silas Reed and two dark-suited guards step into the chamber doorway, confronting Julian and Dr. Vance across the mahogany table holding the 1894 ledger.",
            "story_excerpt": "'Silas Reed already had access to it,' a deep, cultured voice echoed from the stairs.",
            "characters_involved": ["Julian Hayes", "Dr. Eleanor Vance", "Silas Reed"],
            "location_name": "The Founder's Scriptorium",
            "action": "Silas Reed stands tall at the chamber entrance with guards, smiling coldly as Julian steps between Reed and the open ledger",
            "facial_expression": "Silas Reed with arrogant calculated certainty; Julian defiant and shocked; Dr. Vance pale with dread",
            "body_language": "Confrontational standoff across the octagonal table, tense clenched fists",
            "camera_angle": "Medium two-shot dynamic composition capturing the tension between Silas Reed and Julian",
            "composition": "Triangular tension between Reed in the doorway, Julian at the table, and Dr. Vance beside the lantern",
            "lighting": "Dual lighting: cold blue rim light from the corridor behind Reed contrasting warm amber interior lantern glow",
            "time_of_day": "Midnight",
            "visual_style": visual_style,
            "mood": "Intense psychological peril, confrontation, impending catastrophe",
            "image_prompt": f"Dramatic standoff inside secret subterranean library chamber, 45-year-old billionaire man in tailored navy cashmere coat with slicked dark hair confronting young student in wool coat across mahogany drafting table with antique leather ledger, bodyguards in background doorway, high-tension cinematic lighting, {visual_style} style, 8k masterpiece",
            "negative_prompt": "blurry, distorted facial features, extra arms, bad anatomy, cartoonish, watermark",
            "image_url": "https://image.pollinations.ai/prompt/dramatic%20confrontation%20inside%20antique%20subterranean%20stone%20vault%2C%20tall%20billionaire%20in%20cashmere%20overcoat%20facing%20young%20student%20and%20older%20archivist%20across%20table%20with%20ancient%20book%2C%20tense%20cinematic%20lighting?width=1024&height=640&nologo=true&seed=104"
        },
        {
            "scene_id": "scene_demo_005",
            "scene_number": 5,
            "title": "The River Sluice Release",
            "description": "Julian wrenches downward the heavy brass emergency sluice lever beneath the table, unleashing the subterranean river floodwaters as Silas Reed lunges forward in horror.",
            "story_excerpt": "With a sudden, decisive motion, Julian wrenched the lever downward.",
            "characters_involved": ["Julian Hayes", "Dr. Eleanor Vance", "Silas Reed"],
            "location_name": "The Founder's Scriptorium",
            "action": "Julian forcefully pulls the heavy antique brass lever downward, gears clicking, as river water mist surges upward from floor vents",
            "facial_expression": "Julian with fierce moral resolution and adrenaline; Silas Reed shouting in panicked rage",
            "body_language": "Kinetic powerful downward pull, coat flaring, dynamic motion blur on water droplets",
            "camera_angle": "Low-angle kinetic action shot framing Julian at the climax of the motion",
            "composition": "Julian dominant in foreground, surging spray of water catching the golden light, Reed recoiling in background",
            "lighting": "Dramatic flashing amber emergency light and rushing spray catching high-contrast highlights",
            "time_of_day": "Midnight",
            "visual_style": visual_style,
            "mood": "Climactic, electrifying, irreversible defiance",
            "image_prompt": f"Kinetic climactic shot of young man with wavy hair in dark coat pulling a heavy brass mechanical lever downward in a stone chamber, fine mist and surging water spraying through floor grates, dramatic splashing light, billionaire man in coat recoiling in background, intense action, {visual_style} aesthetic, cinematic motion, 8k resolution",
            "negative_prompt": "blurry, low quality, deformed hands, extra fingers, cartoonish, watermark, text",
            "image_url": "https://image.pollinations.ai/prompt/young%20man%20in%20dark%20coat%20pulling%20heavy%20brass%20industrial%20lever%20in%20stone%20chamber%2C%20water%20mist%20and%20spray%20rising%20dramatically%2C%20intense%20cinematic%20action%2C%20dramatic%20lighting%2C%208k?width=1024&height=640&nologo=true&seed=105"
        }
    ]

    return {
        "story_title": "The Whispering Archives",
        "visual_style": visual_style,
        "characters": [julian, vance, reed],
        "locations": [loc_stacks, loc_chamber],
        "scenes": demo_scenes[:target_count]
    }
