---
id: DOC-27
title: "Component Inventory & UI Primitives"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - CMP
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-27 — Component Inventory & UI Primitives


## Component levels

- **L0 Foundations** — contexts, tokens and runtime systems.
- **L1 Primitives** — small reusable building blocks.
- **L2 System Components** — reusable components specific to our interface language.
- **L3 Feature Components** — components belonging to product features.

Dependency direction:

`L3 → L2 → L1 → L0`

Primitives never depend on feature-specific state.

## L0 Foundations

Initial inventory:

- Theme
- Design Tokens
- Material Tokens
- Motion Tokens
- Responsive Modes
- Selection Context
- Input Context
- Surface Context
- Audio Context
- Locale Context
- Feature Flags
- Local Preference Schema / Migration

Possible later foundations only when justified:

- Performance Capability Context
- Network Status
- Analytics Context

## Design Tokens

Centralize:

- color
- spacing
- radius
- typography
- shadow
- blur
- opacity
- layer
- motion
- focus
- materials

Avoid arbitrary one-off values generated independently per feature.

## Theme and Material Systems

Theme supports light/dark/system and semantic tokens. Components should not scatter `if (theme === ...)` styling everywhere.

Material levels:

- MAT-0 Solid
- MAT-1 Frost
- MAT-2 Liquid
- MAT-3 Hero Glass

Feature components request material semantics; they do not rebuild Liquid Glass.

## L1 primitives

Initial inventory:

- Surface
- Stack
- Cluster
- Grid
- Icon
- Text
- Heading
- Button
- IconButton
- Link
- Toggle
- SegmentedControl
- Progress
- Badge
- Divider
- Avatar
- Tooltip
- Skeleton
- VisuallyHidden
- ScrollArea

Native HTML remains underneath where possible.

### Surface

Fundamental visual primitive. Owns material/background/border/radius/shadow/reduced-transparency fallback/basic interaction response. Does not own project selection, navigation or widget semantics.

### Button

Semantic variants such as Primary / Secondary / Ghost / Danger. Tier-C interaction. System/content actions share the same underlying button system.

### Icons

Use one coherent icon strategy. Do not mix many icon libraries. Signature destination icons may become custom later.

## L2 material family

Potential system compositions:

- LiquidSurface
- GlassControl
- GlassPanel
- GlassCapsule
- GlassDock
- GlassHighlight

`GlassHighlight` may be internal and power the moving selection material in Dock/segments.

## L2 navigation family

- GlobalDock
- DockItem
- ContextSelector
- LinearSelector
- ShelfSelector
- NavigationRail
- SegmentNavigation
- DetailTabs
- ActionHint
- ActionHintBar
- BackControl

### GlobalDock

Owns six spaces, active/focus state, moving glass material, responsive composition, input hints and safe-area positioning.

### LinearSelector

Owns neighbors, spatial promotion, roving focus, wheel handling and keyboard/gamepad selection.

### ShelfSelector

Horizontal collection browser for Experience/Education/Certifications/Media and similar content.

### ActionHint

Semantic API:

```tsx
<ActionHint action="CONFIRM" label="Select" />
```

Renders mode-appropriate hints automatically.

## L2 system chrome

- SystemShell
- IdentityStatus
- SystemControls
- SystemClock
- LanguageControl
- ThemeControl
- SoundControl
- SettingsControl
- SystemStatusIndicator

`SystemShell` owns major structural regions and portals, not project-specific business logic.

## DynamicBackdrop

Dedicated system component for selected artwork, fallback gradient, contextual tint, readability wash, texture, responsive art direction, nearby preloading, crossfades and reduced-motion behavior.

Potential `BackdropAsset` model supports desktop/mobile crop/focal point/fallback/accent.

## L2 widget / Personal Field family

- PersonalField
- ProjectHeroSlot
- WidgetField
- WidgetSlot
- WidgetShell
- WidgetHeader
- WidgetBody
- WidgetError
- WidgetEmpty
- WidgetSkeleton
- WidgetAction
- WidgetRegion (generic non-Home contexts)
- WidgetCustomizeControl
- WidgetCustomizeSurface
- WidgetSizeControl
- WidgetOrderControl

`PersonalField` composes the selected Project Hero and central Widget Field on Home. `WidgetField` owns controlled slot composition, budget, logical ordering, responsive mapping and personalization application. A nonvisual `WidgetResolver` selects eligible widgets; a separate local preference layer applies pin/hidden/order/supported-size intent without overriding eligibility.

`WidgetRegion` remains available for simpler non-Home spaces that do not need the full personalizable field.

## L2 surface family

- PopoverSurface
- SheetSurface
- OverlaySurface
- RouteDetailSurface
- UtilitySurface
- SystemDialog
- SurfaceHeader
- SurfaceFooter
- OverlayBackdrop

Do not collapse everything into one giant Modal with dozens of booleans.

## L2 feedback family

- Toast
- ToastRegion
- AchievementToast
- InlineNotice
- ErrorNotice
- SuccessState
- EmptyState
- OfflineIndicator

## L2 data-display family

- StatusChip
- TechTag
- Metric
- MetadataRow
- ProgressIndicator
- DateDisplay
- ExternalLink
- MediaThumbnail
- AvatarStack
- CodeSnippet

`StatusChip` represents domain status, not interaction state.

## L2 form family

- Field
- TextInput
- TextArea
- Select
- Checkbox
- RadioGroup
- FormError
- CharacterCount
- SubmitButton

`Field` owns label/description/control/error/required semantics. Avoid placeholder-as-label.

Inputs usually favor MAT-0/MAT-1 readability over maximum transparency.

## L2 media family

- MediaGrid
- MediaViewer
- ImageViewer
- VideoPlayer
- ArchitectureViewerShell
- MediaCounter

Architecture Viewer may later provide zoom/pan/reset/legend/fullscreen around project-specific diagrams.

## L3 Home / Projects

- HomeWorkspace
- PersonalField
- ProjectHeroSlot
- WidgetField
- LibraryCollectionSwitcher
- ProjectSelector
- ProjectTile
- ProjectSummary
- ProjectHeroIdentity
- ProjectActions
- ProjectDetail
- ProjectDetailNav
- ProjectOverview
- ProjectArchitecture
- ProjectChallenges
- ProjectMediaSection
- ProjectMakingSection
- ExperienceShelf / ExperienceCard
- EducationShelf / EducationCard
- CertificationShelf / CertificationCard
- ComingSoonTile

### ProjectTile

- Tier A
- context influence I3
- states include rest/hover/focus/selected/pressed/coming-soon/new/updated
- recomposes significantly between Expanded vertical selector and Compact carousel

### ProjectDetail

Orchestrates smaller sections through `RouteDetailSurface`. Must not become one enormous monolithic component.

## L3 widgets

Initial:

- CurrentlyBuildingWidget
- ProjectMediaWidget
- DevActivityWidget
- RelatedAchievementWidget
- PersonalBestWidget
- DailyChallengeWidget
- LatestSketchWidget

Future widgets remain optional.

## L3 Achievements

- AchievementsWorkspace
- AchievementCategorySelector
- AchievementGrid
- AchievementTile
- AchievementProgress
- AchievementDetail
- AchievementUnlockToast
- SecretAchievement

AchievementTile supports locked/unlocked/secret/new/focused/selected but does not own unlock business logic.

## L3 Arcade

- ArcadeWorkspace
- GameSelector
- GameTile
- GameDetail
- GameSessionShell
- GameHUD
- Leaderboard
- LeaderboardEntry
- GameResult
- GlitchRunnerGame
- ReflexDeployGame

`GameSessionShell` owns pause/resume/exit/input-scope/visibility pause/result transition common to all games.

## L3 Channel

- ChannelWorkspace
- ChannelSwitcher
- TechPulseFeed / TechPulseCard
- DevLogFeed / DevLogEntry
- CurrentlyBuildingFeed

Tech Pulse cards visibly attribute external sources.

## L3 Social

- SocialWorkspace
- SocialRail
- Guestbook / GuestbookEntry / GuestbookComposer
- ReportContent
- SketchWall / SketchTile / SketchViewer
- DrawingWorkspace / DrawingToolbar / DrawingCanvas
- ColorPalette / StrokeControl
- PublishSketchFlow
- ReactionBar

`DrawingCanvas` owns high-frequency rendering outside global React state and does not own moderation/publication.

## L3 Contact

- ContactWorkspace
- ContactProfile
- ContactForm
- ContactSuccess
- SocialLinkList
- AvailabilityStatus

## L3 CV

- CVSurface
- CVPreview
- CVLanguageOption
- CVDownloadAction
- CVMetadata
- optional CVPagePreview

The UI consumes RenderCV artifacts; it never generates the CV client-side.

## L3 Settings

- SettingsSurface
- SettingsSection
- ThemeSettings
- LanguageSettings
- SoundSettings
- MotionSettings
- TransparencySettings
- PrivacySettings
- LocalDataSettings

Only expose controls that perform real behavior.

## L3 Command Palette

- CommandPalette
- CommandInput
- CommandResults
- CommandItem
- ShortcutHint

Backed by a nonvisual command registry with id/label/keywords/action/availability/shortcut/category.

## Boot / Onboarding

- BootSequence
- BootStep
- OnboardingCoachMark
- OnboardingOverlay
- InputCoachMark

Boot respects first visit/skip/reduced motion. Coach marks adapt to input mode.

## Making Of / Changelog / Status / 404

Reuse system components rather than inventing unrelated article UIs.

Potential pieces include DecisionTimeline, ArchitectureDiagram, DesignReferenceSection, ReleaseEntry, VersionBadge, ServiceStatus, BuildInfo, NotFoundWorkspace and RecoveryActions.

## Admin

Potential:

- AdminShell
- AdminNavigation
- ModerationQueue / ModerationItem
- GuestbookModeration
- SketchModeration
- ReportQueue
- BanManager
- ContentEditor
- ProjectStatusEditor
- AuditLog

Admin optimizes for clarity/density. It may use dedicated admin rows/components rather than forcing cinematic public components into management workflows.

## Folder strategy

```text
src/
├── components/
│   ├── primitives/
│   ├── navigation/
│   ├── surfaces/
│   ├── feedback/
│   ├── forms/
│   └── system/
├── features/
│   ├── projects/
│   ├── achievements/
│   ├── arcade/
│   ├── channel/
│   ├── social/
│   ├── contact/
│   ├── cv/
│   ├── settings/
│   └── admin/
├── input/
├── design-system/
└── lib/
```

## Component API philosophy

Props express meaning, not arbitrary visual internals. Favor composition over giant universal Card components.

## Server/client boundaries

Prefer Server Components for static/content-heavy information where possible. Use client components where interaction actually requires it.

Heavy lazy-loaded candidates:

- Drawing
- Glitch Runner
- Reflex Deploy
- interactive Architecture Viewer
- Admin
- heavy Media Viewer

## Data and translations

Feature components receive typed domain data through data/service layers rather than uncontrolled direct provider calls.

Localization is centralized. Do not scatter `if (language === 'es')` conditionals through the UI.

## Isolated component environment

An isolated component environment is required. **Storybook is the approved V0 baseline**; any replacement requires an explicit technical change decision rather than ad-hoc substitution.

Use it for state matrices, accessibility review and visual regression.

## Component contract

Every meaningful L2/L3 component documents:

- purpose
- interaction tier
- material
- states/state combinations
- inputs/actions
- data ownership
- context influence
- responsive behavior
- accessibility
- loading/error
- motion

## Component matrix

Maintain a living matrix, for example:

| Component | Tier | Material | Influence | Focus | Responsive | Gamepad |
|---|---|---|---|---|---|---|
| ProjectTile | A | MAT-1/2 | I3 | Yes | Yes | Yes |
| WidgetShell | B | MAT-2 | I0 | Yes | Yes | Yes |
| DockItem | B | inherited | I0 | Yes | Yes | Yes |
| AchievementTile | B | MAT-1/2 | I1 | Yes | Yes | Yes |
| Button | C | varies | I0 | Yes | Yes | native action |
| DrawingCanvas | special | MAT-0 | I0 | specialized | Yes | partial |

## Decision registry

- CMP-001 — Components are Foundations, Primitives, System Components and Feature Components.
- CMP-002 — Feature semantics never enter foundational primitives.
- CMP-003 — Material behavior derives from the centralized Material System.
- CMP-004 — Surface is the fundamental visual primitive.
- CMP-005 — Liquid Glass uses reusable system components instead of feature-specific CSS.
- CMP-006 — GlobalDock is a signature reusable system component.
- CMP-007 — Context selectors share common navigation behavior.
- CMP-008 — DynamicBackdrop is a dedicated application-level component.
- CMP-009 — Widgets compose WidgetShell; Home composes them through PersonalField/WidgetField, while simpler spaces may use WidgetRegion.
- CMP-010 — Surface components follow DOC-26 taxonomy.
- CMP-011 — Feedback uses shared Toast/Notice/State components.
- CMP-012 — Forms use semantic shared fields.
- CMP-013 — ProjectTile is Tier-A/I3.
- CMP-014 — ProjectDetail is composed from smaller domain sections.
- CMP-015 — DrawingCanvas owns high-frequency drawing behavior outside global React state.
- CMP-016 — GameSessionShell owns cross-game session/input behavior.
- CMP-017 — CV UI consumes RenderCV output but does not generate it client-side.
- CMP-018 — Admin components may differ from cinematic public components.
- CMP-019 — Codebase uses feature-based organization plus shared component families.
- CMP-020 — Component names describe responsibility rather than appearance.
- CMP-021 — Composition is preferred over giant variant-based components.
- CMP-022 — Server Components are preferred wherever interactivity is not required.
- CMP-023 — Heavy subsystems are lazy-loaded.
- CMP-024 — Components receive typed domain/data-layer data rather than uncontrolled direct integration calls.
- CMP-025 — Translation logic is centralized.
- CMP-026 — Every meaningful component documents interaction/accessibility/responsive/material behavior.
- CMP-027 — An isolated component environment is required; Storybook is the approved V0 baseline unless explicitly superseded by a later technical decision.
- CMP-028 — Component visual states support regression testing.
- CMP-029 — Every component belongs to explicit interaction/material/context tiers where applicable.
- CMP-030 — Implementation tooling consults the inventory before creating reusable UI primitives.

- CMP-031 — `PersonalField` is the Home composition primitive that hosts ProjectHeroSlot + WidgetField.
- CMP-032 — `WidgetField` owns controlled responsive slot composition and applies logical local preferences.
- CMP-033 — Widget customization controls are explicit components; drag is optional enhancement, not the only interaction.
- CMP-034 — Local widget preference schemas are versioned/migratable rather than unstructured storage blobs.
