---
title: Guess the Character
description: A Hedbanz-style party game where everyone wears a character they cannot see, and you guess yours by asking yes or no questions.
date: 2026-07-01
tech: [JavaScript, Node.js, Discord.js, Socket.IO, SQLite, Device tilt controls]
links:
  - label: Play
    url: "https://guess-the-character.com"
  - label: Source
    url: "#" # PLACEHOLDER: GitHub repo URL (the repo is private for now)
status: live
order: 1
---

Guess the Character is a game for two to eight people. Each player is secretly
given a character they can't see themselves, then everyone takes turns asking
yes or no questions until someone works out who they are. Fewest turns wins.

It runs three ways from one shared character library: as a Discord bot that
acts as the impartial host, dealing characters, DMing each player, running the
turn clock, and keeping score; as a phone game where each player holds a phone
to their forehead and tilts it to answer; and as a computer game where every
screen shows everyone's character except the player's own.
