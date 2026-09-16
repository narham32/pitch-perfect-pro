# Pitch Perfect Pro

ROLE & CONTEXT

You are a senior fullstack engineer and product architect specialized in SaaS platforms and sports management systems.

Your task is to build a complete Football Management System Platform where multiple Event Organizers (EO) can create and manage football competitions, teams can register for competitions, and matches can be managed with lineups and statistics.

The system must be scalable, modular, and production-ready.

Use modern stack:

Frontend: React / Next.js

Backend: Supabase

Database: PostgreSQL

Auth: Supabase Auth

Storage: Supabase Storage

Styling: TailwindCSS

State Management: React Query or Zustand

Build a modern SaaS-style platform similar to Tournify or Challengermode but focused on football competitions.

PRODUCT VISION

The platform is a centralized ecosystem where:

Super Admin manages the entire platform

Event Organizers create and manage competitions

Teams register and participate in competitions

Players are registered under teams

Matches are organized with lineup and match events

The system should support multiple tournaments running simultaneously from different organizers.

USER ROLES

The platform has 4 main roles:

Super Admin

Event Organizer (EO)

Team Manager

Public Viewer

Each role has different dashboards and permissions.

SUPER ADMIN FEATURES

Super Admin manages the entire platform.

Dashboard must include:

Total Event Organizers

Total Competitions

Total Teams

Total Players

Total Matches

Platform Revenue

Management modules:

Event Organizer Management

Approve or suspend EO accounts

Competition Monitoring

View all competitions from all EO

User Management

Manage all platform users

Payment Monitoring

Track competition registration payments

Platform Settings

Global configuration

Analytics Dashboard

EVENT ORGANIZER FEATURES

EOs manage competitions and matches.

Workflow:

Create EO Account

Create Competition

Configure Competition Rules

Open Team Registration

Verify Teams

Verify Players

Generate Match Schedule

Manage Matches

Modules:

EO Dashboard

Statistics overview

Competition Management

Create competition

Competition logo

Age category

Location

Entry fee

Max teams

Competition format

Competition formats supported:

League

Group Stage + Knockout

Full Knockout

Team Registration Management

View registered teams

Approve teams

Reject teams

Player Verification

Approve player eligibility

Check age rules

Fixture Generator

Automatically generate match schedule

Edit match schedule

Match Control Panel

Input match result

Record goals

Yellow cards

Red cards

Substitution events

Statistics System

Standings table

Top scorer

Fair play ranking

TEAM MANAGER FEATURES

Teams participate in competitions.

Workflow:

Create Team Account

Create Team Profile

Register for Competition

Upload Payment

Add Players

Submit Squad

Submit Match Lineup

Modules:

Team Dashboard

Team Profile

Team logo

Team name

City

Manager

Player Management

Add player

Player photo

Birth date

Position

Jersey number

Upload ID document

Competition Registration

Browse competitions

Register team

Upload payment proof

Squad Management

Submit final squad for competition

PLAYER DATA MODEL

Each player contains:

Full name

Date of birth

Photo

Position

Jersey number

ID verification

Team association

Player statistics:

Goals

Assists

Yellow cards

Red cards

MATCH MANAGEMENT SYSTEM

Match structure:

Match

Home Team

Away Team

Venue

Match Date

Referee

Score

Match Status

Match stages:

Scheduled

Lineup Submitted

Live

Finished

LINEUP SYSTEM

Teams must submit lineup before match.

Lineup includes:

Starting XI

Goalkeeper

Defenders

Midfielders

Forwards

Substitutes bench

Maximum players configurable by competition rules.

MATCH EVENT SYSTEM

Match operators can record match events.

Supported events:

Goal

Assist

Yellow Card

Red Card

Substitution

Penalty

Each event includes:

Minute

Player

Team

Event Type

AUTOMATIC STATISTICS

After match completion the system updates:

Team standings

Played

Wins

Draw

Loss

Goals For

Goals Against

Points

Player statistics

Goals

Assists

Cards

Top scorer leaderboard.

PUBLIC COMPETITION PORTAL

Visitors can view competitions without login.

Public pages:

Competition List

Competition Detail

Standings Table

Match Schedule

Match Results

Team Profiles

Player Profiles

Competition page must include:

Standings

Fixtures

Results

Top Scorers

DATABASE STRUCTURE

Core tables required:

users

roles

event_organizers

competitions

competition_categories

competition_regulations

teams

team_players

competition_registrations

matches

match_lineups

match_events

standings

payments

media_assets

Ensure relational integrity using foreign keys.

FILE STORAGE

Use Supabase Storage for:

Team logos

Competition logos

Player photos

ID verification documents

Payment proofs

UI / UX DESIGN

Design requirements:

Modern sports dashboard UI

Dark + light mode

Responsive design

Mobile friendly

Main navigation structure:

Super Admin Menu

Dashboard

Event Organizers

Competitions

Teams

Players

Payments

Analytics

EO Menu

Dashboard

Competitions

Teams

Players

Fixtures

Matches

Statistics

Team Menu

Dashboard

Team Profile

Players

Competitions

Payments

Public Menu

Competitions

Teams

Players

Matches

Standings

SECURITY

Implement role-based access control.

Only EO can manage competitions they created.

Teams can only edit their own players.

Super Admin has global control.

DEPLOYMENT READY

The system must be structured for production deployment.

Use:

Environment variables

API route separation

Database migrations

Secure authentication

GOAL

Generate a fully working Football Management System platform where multiple Event Organizers can run competitions and teams can participate digitally.

Ensure the system architecture is scalable and modular.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8f32ac6d-2ca5-4e96-a49b-b7600a6c1177).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
