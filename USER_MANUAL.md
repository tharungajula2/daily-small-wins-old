# Welcome to Trelis Life — Master User Manual & Concept Guide

This document is the absolute source of truth for understanding the architecture, philosophy, and UI/UX of **Trelis Life**. 

Trelis Life is not a typical habit tracker. It does not track complicated numbers, nor does it enforce punishing streaks or stress you out with notifications. Instead, it is a **Life Operating System** built to help you bring calm, quiet structure to your day through the simple capture of "Small Wins" (Gems).

---

## Table of Contents
1. [The Trelis Philosophy: Playlists & Gems](#1-the-trelis-philosophy-playlists--gems)
2. [First-Time Account Creation & Log In](#2-first-time-account-creation--log-in)
3. [The Onboarding Setup Screen](#3-the-onboarding-setup-screen)
4. [The Dashboard (Your Main Screen)](#4-the-dashboard-your-main-screen)
5. [The Arc Card (Morning & Evening Rituals)](#5-the-arc-card-morning--evening-rituals)
6. [Playlists (Anchors) & Gems (Small Wins)](#6-playlists-anchors--gems-small-wins)
7. [The Vault (Your Ledger of Wins)](#7-the-vault-your-ledger-of-wins)
8. [The D-Day Target](#8-the-d-day-target)
9. [Quiet Partners (Silent Support System)](#9-quiet-partners-silent-support-system)
10. [The Sunday Weekly Debrief](#10-the-sunday-weekly-debrief)
11. [Settings Portal](#11-settings-portal)

---

## 1. The Trelis Philosophy: Playlists & Gems
To understand Trelis Life, you must understand its core paradigm shift:

*   **No "Promises" to break:** In traditional apps, you make a promise (e.g., "Run 5 miles") and if you fail, you feel bad. Trelis Life completely removes the concept of completion or failure for your daily habits.
*   **Playlists (Anchors):** Your custom habits are no longer tasks to be checked off. They are simply **Categories** (think of them as YouTube Playlists). They sit on your dashboard as sleek, pure white cards. You cannot "check" them off or "complete" them. They are just containers.
*   **Gems (Small Wins):** Throughout the day, you perform actions related to your Playlists. Every time you do something positive, you log a **Gem ✨**. For example, if your Playlist is "Body-Mind", you might capture a Gem that says "15 min walk #sunlight". 
*   **The Goal:** The goal is simply to capture as many beautiful Gems as you can into your Playlists, building a ledger of positive momentum without the stress of binary pass/fail metrics.

---

## 2. First-Time Account Creation & Log In
When you open Trelis Life at `/login`, you will see a clean sign-in screen.
*   The application operates strictly via Supabase Authentication.
*   It is offline-first but synchronizes securely to the cloud (Row Level Security enforced).
*   A grayscale compliance message reminds users that Trelis is a wellness structure, not a medical device.

---

## 3. The Onboarding Setup Screen
New accounts enter a guided setup screen (`/onboarding`).
*   **Set Windows:** You set your target wake and sleep times. These define the boundaries of your "Arc".
*   **Set Your Playlists:** You are prompted to set up your core Playlists (formerly called Anchors). By default, these cover themes like "Breaking Loops", "Body-Mind", and "Stillness/Reset". 
*   *Note: During onboarding, you are no longer asked to provide "Keep definitions" or "Codenames" or "Frequencies". You are simply naming the categories where your future Gems will live.*

---

## 4. The Dashboard (Your Main Screen)
This is where you spend your time. It is designed to look like "Steve Jobs range perfection": clean, sleek, pure white cards with crisp shadows against an off-white `#F7F6F2` canvas.

### The Header Bar:
*   **Total Wins HUD:** Displays the lifetime total of all Gems you have ever captured. This is your ultimate score of positive momentum.
*   **Pause Tokens:** Displays how many streak-saving tokens you have left (you start with 2 per month).

### The Circadian Color Themes:
The app background automatically shifts colors depending on the time of day, moving from a warm morning glow to bright daylight, twilight amber, and finally a cool dark slate at night.

---

## 5. The Arc Card (Morning & Evening Rituals)
This is the central keystone card at the top of your dashboard.

### Morning Check-In (Tap when you wake up)
*   **Wake Time Button:** Shows what time you woke up.
*   **Feet-on-Floor Checkbox:** Check this as soon as you physically get out of bed.
*   **Sleep Quality & Mood:** Rate your sleep and mood using the 1-to-5 scale.
*   Tap the **Submit** button to lock in your morning.

### Evening Wind-Down (Tap before sleep)
*   **Win of the Day Text Box:** Write one good thing that happened today.
*   **Parking Lot Text Box:** Dump any worries or to-dos to clear your mind before sleep.
*   **Bedtime Log:** Click to log when you go to sleep.

---

## 6. Playlists (Anchors) & Gems (Small Wins)
This is the core interaction loop of Trelis Life.

### The UI / UX:
*   Your Playlists are displayed as pure white cards on the dashboard.
*   **There is no checkbox.** You cannot complete a Playlist. 
*   On the right side of every Playlist is an elegant, translucent amber button: **`+ ✨ GEM`**.

### How to Capture a Gem:
1.  Tap the **`+ ✨ GEM`** button.
2.  A sleek drawer slides up titled **"✨ LOG A GEM"**.
3.  **Label Field:** Type a short description of your small win (e.g., "Ate an apple", "Walked the dog", "Paused before reacting").
4.  **Quick Tags:** Tap any relevant preset tags (e.g., `#nutrition`, `#sunlight`).
5.  Tap the golden **CAPTURE GEM ✨** button.

### What happens when you capture a Gem?
*   The drawer closes.
*   Your new Gem immediately appears at the bottom of the Playlist card on your dashboard as a beautifully styled, amber-tinted row with the ✨ icon.
*   Your Total Wins counter at the top of the app instantly increases by 1.
*   The Gem is saved permanently to your ledger (The Vault).

---

## 7. The Vault (Your Ledger of Wins)
The Vault (`/vault`) is your permanent historical record. 
Because we do not use failure-based streaks, the Vault is simply a beautiful, chronological ledger of all the good things you have done.

### What is stored in the Vault?
*   **Gems:** Every small win you capture via your Playlists.
*   **Wins of the Day:** The daily highlight you write during your Evening Wind-Down.
*   **Reflections:** Your Sunday Weekly Debrief entries.

*Note: Legacy data structures (like 'Keeps') are silently calculated into your total lifetime score, but the Vault strictly renders the new Gems paradigm to keep the interface perfectly clean.*

---

## 8. The D-Day Target
At the top of the dashboard sits the **D-Day Target** card.
*   This is a hardcoded, unchangeable countdown target set to **January 1, 2027**.
*   It displays the exact days, hours, and minutes remaining until this deadline.
*   It serves as a constant, silent reminder of your ultimate timeline, pushing you to capture Gems today rather than tomorrow.

---

## 9. Quiet Partners (Silent Support System)
The **Quiet Partner** feature lets you stay connected with an accountability partner without the toxicity of social media.
*   **No Numbers:** You cannot see their streak numbers or the actual text of their Gems.
*   **Progress Dots:** You only see simple dots indicating activity.
*   **Nudges:** You can send a silent, pre-written nudge (e.g., `Proud of you`) that appears gently on their screen.

---

## 10. The Sunday Weekly Debrief
The `/debrief` page is locked from Monday to Saturday. On Sunday, the vault opens to allow you to reflect.
*   **Drain Box:** What drained your energy?
*   **Win Box:** What was your biggest victory?
*   **Change Box:** What is the one thing you will do differently next week?
*   Once committed, this reflection is permanently sealed and logged in your Vault.

---

## 11. Settings Portal
The `/settings` screen allows you to manage the deep parameters of your Life OS.
*   **Manage Playlists (Anchors):** Add new Playlists or retire old ones. Since Playlists are just categories, you only need to provide a Title.
*   **Vision Priming:** Write a core intention statement that you can choose to display every morning.
*   **Morning Tap Line:** Customize the text on your Morning Check-In button (e.g., `"I am awake."`).
*   **Quiet Partner Setup:** Send or revoke partner invitations.
*   **Sign Out:** Securely purge the local cache and disconnect from Supabase.
