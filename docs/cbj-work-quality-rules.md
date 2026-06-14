# CBJ Work Quality Rules

This document is an internal repository note. It must not be rendered on the public website.

## Purpose

CBJ work must not wait for the user to point out obvious problems

The assistant must inspect the purpose, structure, code, visible output, and past user preferences before saying that something is acceptable

This applies to all CBJ-related work and adjacent production work, including articles, code, page design, layout design, UI, images, SNS posts, captions, prompts, documents, and implementation plans

## Core rule

Do not add parts just because they look designed

Before adding a component, section, card, visual effect, paragraph, image, CTA, layout wrapper, navigation block, footer block, or explanation, ask whether it is actually needed

If it is not needed, remove it or do not propose it

## Required checks before proposing or implementing

1. Purpose
   - What is this page, image, article, or asset supposed to do
   - Is it an index, document, profile, form, article, visual, SNS hook, or conversion path

2. Necessity
   - Is each section necessary
   - Is each card, block, image, CTA, note, paragraph, wrapper, nav, footer, and sidebar necessary
   - Can the same job be done better with less UI or less text

3. Structure
   - Does the order match how a real user reads or acts
   - Does the main subject appear first
   - Does any secondary element steal the role of the main content

4. Mobile first
   - What appears first on smartphone
   - How far is the user from the main action or main answer
   - Are blocks too tall
   - Are repeated cards creating unnecessary scroll

5. Existing world view
   - Does this match the existing CBJ visual language
   - Does it feel like the same media site, not a separate template page
   - Does it avoid generic AI layout patterns

6. Copy and language
   - Is the Japanese natural
   - Did a rule create broken Japanese
   - Is the wording serving the reader, not just satisfying a checklist

7. Code-level inspection
   - Does the code itself reveal a problem
   - Are wrappers, footers, layout order, hidden mobile elements, or shared components causing visible issues
   - Do not rely on build success as proof of design success

8. Output inspection
   - Check the actual rendered or generated result when available
   - If a screenshot or PDF shows the result is weak, call it weak
   - Do not claim completion based only on file edits

9. Self-rejection
   - Reject the output before the user has to reject it
   - State the exact reason something is not acceptable
   - Do not answer with approval when the result only partially satisfies the goal

## Page design rules

Page design must be judged as a full screen and a full scroll, not as a collection of components

Before implementing a page, decide the page type and the correct visual language for that type

- Index pages need clear scan paths and compact links
- Document pages need typography, rules, tables, and readable text
- Profile pages need a strong subject and concise evidence
- Form pages need the form to be easy to reach
- Article pages need the article to remain the main subject
- Landing pages need a clear first impression and a controlled conversion path

Do not confuse component completeness with design quality

A page can have a hero, cards, CTA, related links, nav, and footer and still be a bad page

Always check:

- First screen impression
- Visual hierarchy
- Reading order
- Scroll weight
- Main subject clarity
- Footer weight
- Navigation weight
- Whether the page feels like a designed editorial page or a generic UI template

## Design-specific rules

### Avoid default card thinking

Cards are not the default solution

Use cards only when the user needs to choose, compare, scan independent options, or follow a clear navigation set

Do not use cards for ordinary document text, legal text, profile data, notes, or related links if a table, list, line rule, or text link works better

### Remove before adding

Before adding decoration, ask what can be removed

Common removals to consider:

- Outer wrapper cards
- Nested cards
- Large dark CTA blocks
- Repeated summary cards
- Large related blocks
- Oversized footers
- Decorative text that delays the main content
- Cards used only to make a page look designed
- Shared layout wrappers that make a page heavier than its purpose requires

### Page role decides layout

- Index pages can use compact rows or link lists
- Document pages should use headings, rules, tables, and text
- Profile pages should use a profile table and concise evidence
- Form pages should make the form easy to reach
- Article pages should keep trust signals light and keep the article as the main subject

## Writing and article rules

Do not produce text that only sounds organized

Check whether the article or caption gives the reader a real judgment tool

Avoid:

- Generic summaries
- Thin conclusions
- AI-like repeated phrasing
- Forced structure
- Over-explaining obvious points
- Adding sections only to increase length

Prefer:

- Concrete conditions
- Reader decision points
- What changes by car, year, grade, condition, budget, use case, or risk
- Natural automotive media tone

## Image and visual generation rules

Do not accept a generated image just because it is visually busy or stylish

Check:

- Realism
- Subject accuracy
- Composition
- Scale
- Lighting consistency
- Reflections
- Human anatomy when people appear
- Car details and model-specific shape
- Whether it looks like a real camera or a generic AI render
- Whether the user has already rejected this kind of result before

If the image is not good enough, say so first and explain what must change

## SNS rules

Do not make a post only look like a template

Check:

- First-slide hook strength
- Whether each slide has one role
- Whether the reader knows why to continue
- Whether the CTA is simple
- Whether the format matches the selected platform size
- Whether the design is readable on smartphone
- Whether the copy sounds natural in Japanese

## Code and repository rules

Do not say a repository task is complete without checking the relevant files

For implementation work:

- Fetch the current file before editing
- Avoid guessing file contents
- Avoid updating huge files without full content safety
- Do not run update operations with partial or empty content
- Check shared layout components, not only the visible page file
- Check mobile behavior in code when possible
- Check whether footer, nav, wrappers, and shared components are affecting the page
- Treat build success as only a technical pass, not a design pass

## Completion rule

A task is not complete merely because code was changed

Completion requires:

- Purpose is satisfied
- Unnecessary UI or text is removed
- Mobile order is correct
- Existing CBJ world view is preserved
- User-specific rules are respected
- Output would survive the question: 本当にこれでいいのか

If any of these are uncertain, say that completion is not confirmed

## Response rule

Do not respond by agreeing after the user discovers the better direction

Before presenting a plan or result, include the strongest objections to the assistant's own proposal and remove weak ideas first

If the better answer is to delete, simplify, or reject, say that before proposing additions
