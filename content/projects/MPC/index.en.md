---
id: "MPC"
lang: "en"
status: "published"
featured: true
order: 2
title: "Combat Loop Prototype"
role: "Gameplay / systems design"
summary: "Core combat rhythm prototype focused on risk-reward tuning and readable feedback."
description: "Core combat rhythm prototype focused on risk-reward tuning and readable feedback."
# Add a real project cover at ./img/cover.webp, then set cover to "./img/cover.webp".
cover: ""
visualClass: "systems-card"
coverClass: "systems-cover"
tags: ["Combat Design","Game Systems","Prototype"]
tools: ["Unity","C#"]
date: "2026-05-30"
---
# Combat Loop Prototype

## Overview

This prototype focuses on a compact combat rhythm: read the enemy intent, commit to a response, and receive immediate feedback that explains why the exchange succeeded or failed.

{{ video youtube:M7lc1UVf-VE title="Combat loop prototype capture" }}

## Design Ownership

- Defined the core attack, dodge, recovery, and punish windows.
- Tuned risk-reward values for close-range commitment.
- Mapped feedback states for hit confirmation, whiff recovery, and defensive timing.

## Iteration Notes

The biggest design goal was keeping the loop readable under pressure. The prototype favors fewer verbs, stronger animation tells, and feedback that makes each failure understandable without pausing the flow.

## What I Would Improve Next

- Add a second enemy archetype to test whether the loop scales beyond one timing profile.
- Build a short tutorial encounter that teaches spacing before damage pressure.
- Compare player recordings against intended decision points.
