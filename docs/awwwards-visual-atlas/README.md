# Awwwards Visual Design Atlas

This is an internal visual-design reference system for CBJ work

It must not be rendered on the public website

## Purpose

This atlas exists so Awwwards-inspired research is used as visual design judgment, not as a text summary

Do not copy Awwwards sites, screenshots, code, animation, or assets into CBJ

Use the atlas to recognize page-design patterns, judge whether a page is visually overbuilt, and translate award-level web design into CBJ's editorial media context

## Source scope

The atlas is based on the public Awwwards discovery structure:

- Awards: Nominees, Sites of the Day, Sites of the Month, Sites of the Year, Annual Awards
- Categories: Architecture, Business & Corporate, Design Agencies, E-Commerce, Fashion, Luxury, Magazine / Newspaper / Blog, Photography, Technology, Web & Interactive
- Tags: About Page, Contact Page, Content architecture, Footer Design, Forms and Input, Fullscreen, Header Design, Horizontal Layout, Minimal, Navigation Menu, Project Page, Responsive, Scrolling, Storytelling, Typography, UI design
- Technology: GSAP, React, Three.js, WebGL, Webflow, Next.js, Tailwind and related implementation tags

## How to use

Before designing or judging a CBJ page, load:

1. `collection-map.json`
2. `evaluation-rubric.json`
3. The relevant pattern files in `patterns/`
4. The relevant CBJ translation file in `cbj-translation/`

Then judge the page as a screen and a scroll, not as a set of components

## Important rule

The atlas is not a reason to add more UI

Most CBJ pages should become better by removing unnecessary cards, wrappers, dark blocks, duplicate navigation, oversized footers, and decorative sections

## Visual recognition method

For each page, check the following visual fields:

- subject_mass
- negative_space
- typography_scale
- section_rhythm
- navigation_weight
- image_role
- motion_role
- footer_weight
- mobile_first_view
- scroll_fatigue
- cbj_fit

If a design scores high on trend but low on CBJ fit, do not use it
