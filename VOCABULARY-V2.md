# Vocabulary system, V2

V2 keeps the existing eight large study themes. Smaller semantic clusters are displayed as orientation labels inside a theme, not as separate destinations, so the learner does not need to keep switching between tiny lists.

## Learning loop

1. Recall meaning from a concrete situation and a Norwegian sentence.
2. Recall the relevant forms. Nouns include gender/article and inflection; verbs include present, past and participle; adjectives and other inflecting items include the forms that matter for use.
3. Answer a contextual form-choice question. The goal is to connect the form to its job in a sentence, not merely recognize a translation.
4. Read, listen, and produce a changed sentence. Browser speech synthesis is used when a Norwegian voice is available.
5. Schedule the entry according to recall and usage performance. The app records form recall and contextual use separately; an error shortens the review interval.

## Rotation and weighting

- Sampling is weighted toward high-frequency items, weak items, and due reviews.
- Items from the most recent sessions are strongly down-weighted unless they are due.
- A session samples without replacement, so one session cannot repeat an entry.
- Contexts are rotated per entry. Recent contexts are avoided when an alternative exists; due vocabulary may recur, but should not simply repeat the same example.
- Data and progress currently live in this browser's local storage. They do not yet synchronize between devices or accounts.

## Current seed inventory

The eight themes cover daily basics, people and family, home, food and shopping, time and routine, health, travel, and study/work. The V2 addition file contributes 62 curated lexical entries across nouns, adjectives, adverbs, and useful phrases. Together with the existing verb/noun lists and the separate 82-entry *Fremtid* unit, the mixed unique study pool contains 236 entries at this release. Theme counts overlap because a shared lemma can appear in more than one useful context; the mixed queue deduplicates by entry key.

This is a useful foundation, not yet a complete B2-sized vocabulary course. The next content batches should prioritize A1 daily-life coverage, then A2 public services and work, and only then expand into B1/B2 abstract and domain vocabulary. New entries should have reviewed Bokmål forms, explicit sense notes, at least two translated contexts where practical, audio-readable text, and a contextual use prompt.

## Internal content roadmap (not official CEFR word-count requirements)

For planning only, aim for cumulative headword/lexical-unit coverage of roughly 600 at A1, 1,400 at A2, 2,600 at B1, and 4,000 at B2. Multiword chunks should be counted and reported separately from single-word headwords. These are product targets, not CEFR-prescribed vocabulary counts or a promise that memorizing a count alone yields a level.

Before publishing new batches, validate uniqueness, part of speech, Bokmål spelling and inflection, sense-specific Chinese glosses, natural example sentences/translations, and whether the target structure is answerable without AI. Usage prompts should always have a deterministic local answer and an explanatory rationale.
