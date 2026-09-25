import { CompleteStoryResponse } from '../types';

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Aliases for export utilities
export const downloadAsTxt = exportStoryTxt;
export const downloadAsJson = exportStoryJson;
export const downloadAsPdf = exportStoryPdf;

export function exportStoryTxt(story: CompleteStoryResponse) {
  const lines: string[] = [
    `========================================================================`,
    `STORYFORGE AI — MASTER STORY SCRIPT`,
    `========================================================================`,
    `Title: ${story.title}`,
    `Genre: ${story.genre}`,
    `Tone: ${story.tones.join(', ')}`,
    `Writing Style: ${story.writing_style}`,
    `Target Audience: ${story.target_audience}`,
    `Ending Type: ${story.ending_type}`,
    `Word Count: ${story.word_count} words | Reading Time: ${story.reading_time}`,
    `Generated: ${story.created_at || 'StoryForge AI Edition'}`,
    `Mode: ${story.is_demo ? 'Demo Mode' : 'Gemini AI Production'}`,
    ``,
    `------------------------------------------------------------------------`,
    `STORY BLUEPRINT`,
    `------------------------------------------------------------------------`,
    `Premise:`,
    story.blueprint.premise,
    ``,
    `Main Conflict:`,
    story.blueprint.main_conflict,
    ``,
    `Theme:`,
    story.blueprint.theme,
    ``,
    `Setting:`,
    story.blueprint.setting,
    ``,
    `Plot Progression:`,
    `1. Introduction: ${story.blueprint.plot.introduction}`,
    `2. Rising Action: ${story.blueprint.plot.rising_action}`,
    `3. Climax: ${story.blueprint.plot.climax}`,
    `4. Falling Action: ${story.blueprint.plot.falling_action}`,
    `5. Resolution: ${story.blueprint.plot.resolution}`,
    ``,
    `------------------------------------------------------------------------`,
    `CHARACTER BIBLE`,
    `------------------------------------------------------------------------`,
  ];

  story.characters.forEach((c) => {
    lines.push(`* ${c.name} (${c.role}) — Age: ${c.age}`);
    lines.push(`  Personality: ${c.personality}`);
    lines.push(`  Motivation: ${c.motivation}`);
    lines.push(`  Goal: ${c.goal} | Fear: ${c.fear}`);
    lines.push(`  Strength: ${c.strength} | Weakness: ${c.weakness}`);
    lines.push(`  Character Arc: ${c.character_arc}`);
    lines.push(``);
  });

  lines.push(`========================================================================`);
  lines.push(`FULL STORY NARRATIVE`);
  lines.push(`========================================================================`);
  lines.push(``);

  if (story.chapters && story.chapters.length > 0) {
    story.chapters.forEach((ch) => {
      lines.push(`### ${ch.title.toUpperCase()}`);
      lines.push(``);
      lines.push(ch.content);
      lines.push(``);
      lines.push(`------------------------------------------------------------------------`);
      lines.push(``);
    });
  } else {
    lines.push(story.story);
    lines.push(``);
  }

  lines.push(`========================================================================`);
  lines.push(`AI STORY QUALITY CHECK REPORT`);
  lines.push(`========================================================================`);
  lines.push(`[✓] Plot Consistency: ${story.quality_check.plot_consistency ? 'PASS' : 'FLAGGED'}`);
  lines.push(`[✓] Character Consistency: ${story.quality_check.character_consistency ? 'PASS' : 'FLAGGED'}`);
  lines.push(`[✓] Genre Alignment: ${story.quality_check.genre_alignment ? 'PASS' : 'FLAGGED'}`);
  lines.push(`[✓] Story Structure: ${story.quality_check.story_structure ? 'PASS' : 'FLAGGED'}`);
  lines.push(``);
  lines.push(`Quality Craft Scores:`);
  lines.push(`- Plot Coherence: ${story.quality_check.plot_coherence_score}/100`);
  lines.push(`- Character Consistency: ${story.quality_check.character_consistency_score}/100`);
  lines.push(`- Genre Fidelity: ${story.quality_check.genre_fidelity_score}/100`);
  lines.push(`- Pacing: ${story.quality_check.pacing_score}/100`);
  lines.push(`- Dialogue: ${story.quality_check.dialogue_score}/100`);
  lines.push(`- Originality: ${story.quality_check.originality_score}/100`);
  lines.push(``);
  if (story.quality_check.strengths.length) {
    lines.push(`Narrative Strengths:`);
    story.quality_check.strengths.forEach((s) => lines.push(`- ${s}`));
  }
  lines.push(``);
  lines.push(`Critique: ${story.quality_check.critique}`);

  const safeTitle = story.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(`${safeTitle}_story.txt`, lines.join('\n'));
}

export function exportStoryPdf(story: CompleteStoryResponse) {
  const printWindow = window.open('', '_blank', 'width=950,height=800');
  if (!printWindow) {
    alert('Please allow popups to preview and save the StoryForge PDF manuscript.');
    return;
  }

  const chaptersHtml = story.chapters && story.chapters.length > 0
    ? story.chapters
        .map(
          (ch) => `
      <section class="chapter-block">
        <h2 class="chapter-title">${ch.title}</h2>
        <div class="chapter-body">
          ${ch.content.split('\n\n').map((p) => `<p>${p.trim()}</p>`).join('')}
        </div>
      </section>
    `
        )
        .join('')
    : `
      <div class="chapter-body">
        ${story.story.split('\n\n').map((p) => `<p>${p.trim()}</p>`).join('')}
      </div>
    `;

  const charactersHtml = story.characters
    .map(
      (c) => `
    <div class="char-box">
      <strong>${c.name}</strong> <em>(${c.role}, Age ${c.age})</em>
      <div class="char-meta"><strong>Goal:</strong> ${c.goal} &bull; <strong>Motivation:</strong> ${c.motivation}</div>
      <div class="char-meta"><strong>Arc:</strong> ${c.character_arc}</div>
    </div>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${story.title} — StoryForge AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@400;600;700&display=swap');
    body {
      font-family: 'Lora', serif;
      margin: 0;
      padding: 40px 60px;
      color: #1a1a1a;
      background: #ffffff;
      line-height: 1.8;
      font-size: 15px;
    }
    .no-print {
      margin-bottom: 30px;
      display: flex;
      gap: 12px;
      font-family: 'Outfit', sans-serif;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      border: none;
    }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-secondary { background: #e5e7eb; color: #374151; }
    .cover {
      text-align: center;
      padding: 40px 0 30px 0;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 40px;
    }
    .badge-bar {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 16px;
      font-family: 'Outfit', sans-serif;
    }
    .badge {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
    }
    .main-title {
      font-family: 'Cinzel', serif;
      font-size: 36px;
      font-weight: 900;
      margin: 0 0 10px 0;
      letter-spacing: 0.04em;
      color: #0f172a;
    }
    .premise-box {
      background: #f8fafc;
      border-left: 4px solid #6366f1;
      padding: 16px 20px;
      font-style: italic;
      color: #475569;
      margin: 20px auto;
      max-width: 700px;
      text-align: left;
    }
    .chapter-block {
      margin-bottom: 40px;
      page-break-inside: auto;
    }
    .chapter-title {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 8px;
      margin-top: 30px;
      color: #1e293b;
    }
    .chapter-body p {
      margin-bottom: 16px;
      text-align: justify;
      text-indent: 1.5em;
    }
    .chapter-body p:first-of-type {
      text-indent: 0;
    }
    .chapter-body p:first-of-type::first-letter {
      font-family: 'Cinzel', serif;
      font-size: 3em;
      float: left;
      line-height: 0.8;
      margin-right: 8px;
      color: #4f46e5;
    }
    .character-bible {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      page-break-before: always;
      font-family: 'Outfit', sans-serif;
    }
    .char-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    .char-box {
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 8px;
      background: #f8fafc;
      font-size: 13px;
    }
    .char-meta {
      color: #64748b;
      margin-top: 4px;
    }
    .quality-check-box {
      margin-top: 40px;
      padding: 20px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      font-family: 'Outfit', sans-serif;
    }
    .quality-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #166534;
    }
    .print-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      font-family: 'Outfit', sans-serif;
    }
    @media print {
      body { padding: 20px 30px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn btn-secondary" onclick="window.close()">Close</button>
  </div>

  <div class="cover">
    <div class="badge-bar">
      <span class="badge">Genre: ${story.genre}</span>
      <span class="badge">Tones: ${story.tones.join(', ')}</span>
      <span class="badge">Style: ${story.writing_style}</span>
      <span class="badge">${story.word_count} words &bull; ${story.reading_time}</span>
    </div>
    <h1 class="main-title">${story.title}</h1>
    <div class="premise-box">${story.blueprint.premise}</div>
  </div>

  <main>
    ${chaptersHtml}
  </main>

  <section class="character-bible">
    <h3 style="font-family: 'Cinzel', serif; margin-bottom: 6px;">Character Bible</h3>
    <div class="char-grid">${charactersHtml}</div>
  </section>

  <div class="quality-check-box">
    <strong>AI Story Quality Check:</strong>
    <div class="quality-grid">
      <div>✓ Plot consistency</div>
      <div>✓ Character consistency</div>
      <div>✓ Genre alignment</div>
      <div>✓ Story structure</div>
    </div>
    <p style="font-size: 12px; color: #15803d; margin: 10px 0 0 0;">
      Originality: ${story.quality_check.originality_score}% &bull; Coherence: ${story.quality_check.plot_coherence_score}% &bull; Pacing: ${story.quality_check.pacing_score}%
    </p>
  </div>

  <div class="print-footer">
    Crafted with StoryForge AI &bull; Turn a Simple Idea Into a Complete Story &bull; Powered by Google Gemini
  </div>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportStoryJson(story: CompleteStoryResponse) {
  const safeTitle = story.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(`${safeTitle}_storyforge.json`, JSON.stringify(story, null, 2), 'application/json');
}

export function exportVisualStoryPdf(story: CompleteStoryResponse, scenes: import('../types').VisualScene[]) {
  const printWindow = window.open('', '_blank', 'width=1000,height=900');
  if (!printWindow) {
    alert('Please allow popups to export the Visual Storybook PDF.');
    return;
  }

  const scenesHtml = scenes.map((s, idx) => `
    <div class="visual-scene-page">
      <div class="scene-header">
        <span class="scene-pill">SCENE ${s.scene_number || idx + 1}</span>
        <h2 class="scene-headline">${s.title}</h2>
      </div>

      ${s.image_url ? `
        <div class="scene-image-container">
          <img src="${s.image_url}" alt="${s.title}" class="scene-img" />
        </div>
      ` : `
        <div class="scene-placeholder">
          <em>[Visual Scene ${idx + 1}: ${s.title}]</em>
          <p style="font-size: 11px; margin-top: 6px; color: #64748b;">${s.image_prompt}</p>
        </div>
      `}

      <div class="scene-meta-row">
        <span><strong>Location:</strong> ${s.location_name || 'Key Setting'}</span>
        <span><strong>Characters:</strong> ${(s.characters_involved || []).join(', ') || 'Protagonist'}</span>
        <span><strong>Mood:</strong> ${s.mood || 'Dramatic'}</span>
      </div>

      <div class="scene-description-box">
        <strong>Scene Visual Focus:</strong> ${s.description}
      </div>

      ${s.story_excerpt ? `
        <div class="scene-story-box">
          <div class="story-label">Story Narrative:</div>
          <p>${s.story_excerpt}</p>
        </div>
      ` : ''}
    </div>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${story.title} — Illustrated Visual Storybook</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@400;600;700&display=swap');
    body {
      font-family: 'Lora', serif;
      margin: 0;
      padding: 30px 40px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.7;
    }
    .no-print {
      margin-bottom: 25px;
      display: flex;
      gap: 12px;
      font-family: 'Outfit', sans-serif;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 14px;
      border: none;
    }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-secondary { background: #f1f5f9; color: #334155; }
    .book-cover {
      text-align: center;
      padding: 50px 0 40px 0;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 40px;
      page-break-after: always;
    }
    .genre-badge {
      font-family: 'Outfit', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 12px;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 12px;
    }
    .book-title {
      font-family: 'Cinzel', serif;
      font-size: 42px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 15px 0;
    }
    .book-premise {
      max-width: 650px;
      margin: 0 auto;
      font-style: italic;
      color: #475569;
      font-size: 16px;
    }
    .visual-scene-page {
      margin-bottom: 50px;
      page-break-inside: avoid;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 40px;
    }
    .scene-header {
      margin-bottom: 15px;
      font-family: 'Outfit', sans-serif;
    }
    .scene-pill {
      background: #e0e7ff;
      color: #3730a3;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      display: inline-block;
      margin-bottom: 6px;
    }
    .scene-headline {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      margin: 0;
      color: #1e1b4b;
    }
    .scene-image-container {
      margin: 15px 0 20px 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      background: #0f172a;
    }
    .scene-img {
      width: 100%;
      max-height: 520px;
      object-fit: cover;
      display: block;
    }
    .scene-placeholder {
      padding: 40px;
      text-align: center;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      margin: 15px 0;
    }
    .scene-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-family: 'Outfit', sans-serif;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
    }
    .scene-description-box {
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      padding: 12px 16px;
      font-size: 14px;
      color: #334155;
      margin-bottom: 15px;
      border-radius: 0 8px 8px 0;
    }
    .scene-story-box {
      margin-top: 15px;
      font-size: 15px;
      color: #1e293b;
      line-height: 1.8;
    }
    .story-label {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    @media print {
      body { padding: 15px; }
      .no-print { display: none; }
      .visual-scene-page { page-break-after: always; border: none; margin-bottom: 0; padding-bottom: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save Visual Storybook PDF</button>
    <button class="btn btn-secondary" onclick="window.close()">Close</button>
  </div>

  <div class="book-cover">
    <div class="genre-badge">${story.genre} &bull; ${story.writing_style} Visual Storybook</div>
    <h1 class="book-title">${story.title}</h1>
    <p class="book-premise">${story.blueprint.premise}</p>
    <div style="margin-top: 30px; font-family: 'Outfit', sans-serif; font-size: 13px; color: #64748b;">
      ${scenes.length} Illustrated Scenes &bull; Complete Narrative Sequence
    </div>
  </div>

  <main>
    ${scenesHtml}
  </main>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export async function downloadSceneImage(imageUrl: string, sceneNumber: number, title: string) {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `scene_${sceneNumber}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download error:', err);
    window.open(imageUrl, '_blank');
  }
}
