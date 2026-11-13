import { uiText } from '../../i18n';
/**
 * Static search index for the Settings panel.
 *
 * Each entry represents either a single control (`field` set — the Slider/
 * Toggle prop) or a section/subsection block (`field` undefined — used so
 * searches like "navigation" or "library" surface the whole block).
 *
 * Keep this in sync with the SettingsPanel JSX by hand. The dev console will
 * complain via `validateSearchIndex()` (see SettingsSearch.tsx) when a
 * rendered `<Slider field=...>` / `<Toggle field=...>` is missing from the
 * index.
 */

import type { SettingsTabId } from '../SettingsPanel';

/** Section ids we route to. Mirrors the SectionId union in SettingsPanel +
 *  pseudo-ids for sections that don't use the main CollapsibleSection
 *  (Library Sync, OBD, Theme tab). */
export type SearchSectionId =
  | 'outline' | 'parts' | 'pins' | 'partTypeOverrides' | 'netColors'
  | 'selection' | 'boardOverlay' | 'netLines'
  | 'zoomLod' | 'navigation' | 'shortcuts'
  | 'performance' | 'pdf' | 'updates' | 'troubleshooting'
  | 'server' | 'dbinfo' | 'library-sync' | 'obd'
  | 'theme';

export interface IndexEntry {
  /** Slider/Toggle field name. Omit for section-level entries. */
  field?: string;
  tab: SettingsTabId;
  section: SearchSectionId;
  label: string;
  tooltip?: string;
  /** Extra synonyms / search terms not in label or tooltip. */
  keywords?: string[];
}

/** Helper for entries with no field (section / subsection rows). */
function S(tab: SettingsTabId, section: SearchSectionId, label: string, keywords?: string[]): IndexEntry {
  return { tab, section, label, keywords };
}
/** Helper for Slider/Toggle entries. */
function F(tab: SettingsTabId, section: SearchSectionId, field: string, label: string, tooltip?: string, keywords?: string[]): IndexEntry {
  return { tab, section, field, label, tooltip, keywords };
}

export const SETTINGS_INDEX: IndexEntry[] = [
  // ── THEME TAB ──────────────────────────────────────────────────────────
  S('theme', 'theme', uiText("Theme")),
  S('theme', 'theme', uiText("Board theme"), ['theme', 'colour set', 'color set']),
  S('theme', 'theme', uiText("Interface colours"), ['interface colors', 'ui colours']),
  S('theme', 'theme', uiText("Accent"), ['focus color', 'active state', 'pill color', '--accent']),
  S('theme', 'theme', uiText("Background"), ['canvas background', '--bg-primary']),
  S('theme', 'theme', uiText("Chrome"), ['toolbar', 'status bar', 'tab strip', '--bg-tertiary']),
  S('theme', 'theme', uiText("Sidebar navigation"), ['activity rail', 'icon rail', 'sidebar tabs', 'text tabs', 'captions', 'hide sidebar']),

  // ── BOARD TAB ──────────────────────────────────────────────────────────

  // Board Outline
  S('board', 'outline', uiText("Board Outline"), ['outline', 'pcb edge']),
  F('board', 'outline', 'outlineWidth', uiText("Stroke Width"), uiText("Thickness of the PCB board outline stroke (mils)")),
  F('board', 'outline', 'outlineAlpha', uiText("Stroke Opacity"), uiText("Transparency of the board outline. 0 = invisible, 1 = fully opaque")),
  F('board', 'outline', 'boardFillAlpha', uiText("Board Fill"), uiText("Semi-transparent fill inside the board outline. Helps distinguish the PCB area from the background")),
  F('board', 'outline', 'useMetadataBoardColor', uiText("Use board metadata color"),
    uiText("When on, boards with a known PCB color (Apple → black, Dell → blue, etc.) render with that tint instead of the theme default. Boards without a metadata match silently fall back to the theme default. Intensity is the Board Fill slider above."),
    ['metadata color', 'pcb color', 'apple black', 'dell blue']),

  // Parts / Components
  S('board', 'parts', uiText("Parts / Components"), ['parts', 'components', 'chip']),
  F('board', 'parts', 'partBorderWidth', uiText("Border Width"), uiText("Thickness of component border outlines (mils). Always at least 1px on screen regardless of zoom")),
  F('board', 'parts', 'partBorderAlpha', uiText("Border Opacity"), uiText("Transparency of component border outlines. 0 = invisible, 1 = fully opaque")),
  F('board', 'parts', 'partPadding', uiText("Padding"), uiText("Extra space (mils) between component pins and the part border. Larger = more room around the IC/chip outline")),
  F('board', 'parts', 'partMinBodyRatio', uiText("2-Pin Body Ratio"), uiText("Short-axis to pin-distance ratio for 2-pin parts (resistors, capacitors). 0.333 = 1:3 proportion. 0 = use file data as-is")),
  F('board', 'parts', 'showComponentColors', uiText("Type colours (show)"), uiText("Fill component bodies with colors based on their type prefix (R = resistor, C = capacitor, U = IC, etc.). Colors are configured in Part Type Overrides")),
  F('board', 'parts', 'componentFillAlpha', uiText("Type colours (fill opacity)"), uiText("Transparency of the component type color fills. 0 = invisible, 1 = fully opaque")),
  F('board', 'parts', 'partLabelScale', uiText("Part names (size)"), uiText("Multiplier on the auto-fit designator size; the same row shows or hides the names"), ['label', 'designator', 'size']),
  F('board', 'parts', 'showPartLabels', uiText("Part names (show)"), uiText("Display component reference designators (e.g. U1, R100, C42) centered on each part"), ['refdes', 'designator', 'text', 'font']),
  F('board', 'parts', 'partLabelShadow', uiText("Label Drop Shadow"), uiText("Add a dark shadow halo behind part labels for better readability against colored or busy backgrounds"), ['text shadow', 'label glow']),
  F('board', 'parts', 'autoMarkMechanical', uiText("Hide Mechanical Fills"), uiText("Auto-detect EMI shields, heatsink frames and oversized through-hole connector shadows. Detected parts render without a body fill so smaller components beneath stay visible."), ['shield', 'heatsink', 'mechanical']),
  F('board', 'parts', 'labelMinSize', uiText("Min Label Size"), uiText("Minimum font size (board mils) for part / pin / net-name labels. Acts as a floor on the auto-computed size, so tiny components still get a readable label. Labels smaller than the Zoom LOD thresholds are still hidden."),
    ['text size', 'font size', 'label size', 'minimum label', 'min text', 'small medium large', 'tier']),

  // Pins / Pads
  S('board', 'pins', uiText("Pins / Pads"), ['pin', 'pad', 'pads', 'bga']),
  F('board', 'pins', 'pinMinRadius', uiText("Min Radius"), uiText("Minimum pin circle radius (mils). All pins are rendered at least this size. Also the base size when Scale Factor = 0")),
  F('board', 'pins', 'pinMaxRadius', uiText("Max Radius"), uiText("Maximum pin circle radius (mils). Caps the visual size of large pins. On dense parts (BGA), pins are auto-clamped smaller to avoid overlap")),
  F('board', 'pins', 'pinScaleFactor', uiText("Scale Factor"), uiText("How much the file-specified pin radius affects rendered size. 0 = all pins identical (Min Radius). 1 = proportional to file data. >1 = exaggerated differences")),
  F('board', 'pins', 'pinAlpha', uiText("Fill Opacity"), uiText("Fill transparency of pin circles and rectangular pads. 0 = invisible, 1 = fully opaque")),
  F('board', 'pins', 'pinNumberScale', uiText("Pin numbers (size)"), uiText("Multiplier on the pin-number text size; the same row shows or hides the numbers"), ['label', 'size']),
  F('board', 'pins', 'showPinNumbers', uiText("Pin numbers (show)"), uiText("Display pin number/name labels inside pin circles on multi-pin components (ICs, connectors). On BGA parts, numbers and net names alternate vertically to reduce overlap")),
  F('board', 'pins', 'netLabelScale', uiText("Net names (size)"), uiText("Multiplier on the net-name text size on pins; the same row shows or hides the names"), ['label', 'size']),
  F('board', 'pins', 'showNetNames', uiText("Net names (show)"), uiText("Display the net name on each pin (GND and NC are excluded — already colour-coded). Turn off to unclutter dense parts, or to leave the pin free for diode readings"), ['net', 'net name', 'label', 'signal', 'declutter']),
  F('board', 'pins', 'diodeValueScale', uiText("Diode values (size)"), uiText("Multiplier on the on-pin diode reading size; the same row shows or hides the readings"), ['diode', 'size']),
  F('board', 'pins', 'showDiodeValues', uiText("Diode values (show)"), uiText("Draw diode-mode reference readings on pins (XZZ-baked values + OpenBoardData). Only visible on boards that carry readings; also in the board sidebar View tab"), ['diode', 'voltage', 'reading', 'obd', 'measurement']),
  F('board', 'pins', 'diodeValuesOnly', uiText("Diode Values Only"), uiText("While diode values are shown, hide pin numbers and net names board-wide so a pin carries nothing but its reading. Your Show Pin Numbers / Show Net Names settings are left untouched. Same as the third state of the diode button on the board overlay"), ['diode', 'only', 'declutter', 'diode mode', 'reading']),
  F('board', 'pins', 'showPin1Marker', uiText("Pin 1 Marker"), uiText("Highlight pin 1 with red color and a triangle indicator on multi-pin parts"), ['triangle', 'red', 'orientation']),
  F('board', 'pins', 'pinNetLabelBg', uiText("Pin Label Background"), uiText("Draw a dark background plate behind net name labels on circle pins. Improves readability when labels overflow beyond the pin area")),
  F('board', 'pins', 'twoPinNetLabelBg', uiText("2-Pin Label Background"), uiText("Draw a dark background plate behind net name labels on 2-pin rectangular pads")),
  F('board', 'pins', 'bgaLabelGapFactor', uiText("BGA Label Gap"), uiText("Visible vertical gap between pin number and net name labels on dense BGA parts, as a fraction of pin radius. On BGAs, pin numbers and net names alternate above/below the pin center to avoid overlap.")),

  // Part properties
  S('board', 'partTypeOverrides', uiText("Part properties"), ['part type', 'overrides', 'prefix']),
  F('board', 'partTypeOverrides', 'hierarchyDepth', uiText("Hierarchy Depth"), uiText("How many hops the hierarchical (chain + adjacent) net-line mode follows through bridging parts. 1 = immediate neighbours; up to 4 follows longer series chains."), ['chain', 'adjacent', 'propagation', 'hops']),
  S('board', 'partTypeOverrides', uiText("Part Type Overrides"), ['part type', 'prefix', 'pad shape', 'body shape', 'fill color', 'hide', 'bridge']),

  // Pin Color Rules (was "Pin Colors by Net")
  S('board', 'netColors', uiText("Pin Color Rules"), ['net color', 'pin color', 'gnd', 'vcc', 'pp', 'rule', 'pattern']),
  S('board', 'netColors', uiText("Default pin color"), ['top side', 'bottom side', 'default color']),
  S('board', 'netColors', uiText("No-Connect Patterns"), ['nc', 'no connect', 'nc_pad']),

  // Selection & Highlight
  S('board', 'selection', uiText("Selection & Highlight"), ['highlight', 'selected', 'dim', 'glow']),
  F('board', 'selection', 'selectionWidth', uiText("Selection Border"), uiText("Thickness of the selection outline in screen pixels — the same at every zoom level")),
  F('board', 'selection', 'selectionMinScreenPx', uiText("Selection Min Size"), uiText("A selected part is never drawn smaller than this on screen (px): zoomed out the outline is padded to this size, zoomed in it sits exactly on the component border"), ['minimum', 'tiny', 'zoom', 'findable']),
  F('board', 'selection', 'selectionFillAlpha', uiText("Selection Fill"), uiText("Brightness of the semi-transparent fill inside the selected component outline. 0 = no fill, higher = brighter")),
  F('board', 'selection', 'selectionPadding', uiText("Selection Padding"), uiText("Extra gap (mils) between the component border and the selection outline. 0 = the outline is the border")),
  F('board', 'selection', 'netHighlightGrow', uiText("Net Highlight Ring"), uiText("How much larger (mils) the yellow net highlight circle is compared to the pin circle. Creates a visible ring around each pin in the selected net")),
  F('board', 'selection', 'netHighlightAlpha', uiText("Highlight Ring Opacity"), uiText("Opacity of the yellow highlight ring around pins in the selected net. Higher = more visible ring")),
  F('board', 'selection', 'dimOverlayAlpha', uiText("Dim Overlay Strength"), uiText("Opacity of the black overlay that dims unselected areas when a net is highlighted. 0 = no dimming, higher = darker"), ['spotlight', 'darklight']),
  F('board', 'selection', 'ambientDim', uiText("Ambient Dim"), uiText("Always dim the board even when nothing is selected. Hovering over a pin punches through the overlay to reveal its net. Useful for high-contrast inspection"), ['spotlight', 'always dim']),
  F('board', 'selection', 'showElevatedPartLabel', uiText("Floating Part Label"), uiText("Show a large background-backed label above the selected component with its reference designator (e.g. U1)")),
  F('board', 'selection', 'showElevatedPinLabel', uiText("Floating Pin Label"), uiText("Show a background-backed label above the selected pin with its pin number and net name")),

  // Board overlay
  S('board', 'boardOverlay', uiText("Board overlay"), ['overlay', 'slot', 'pdf follow', 'scroll mode', 'fit board', 'hover info', 'net dim', 'net lines', 'ghosts', 'parts dropdown', 'nets dropdown']),
  S('board', 'boardOverlay', uiText("Selection overlay"), ['selection name', 'big text']),
  S('board', 'boardOverlay', uiText("Parts on select"), ['highlight', 'pan if offscreen', 'pan zoom fit']),
  S('board', 'boardOverlay', uiText("Nets on select"), ['highlight', 'pan if offscreen', 'pan zoom fit']),
  S('board', 'boardOverlay', uiText("Search auto dim"), ['auto dim', 'search']),
  S('board', 'boardOverlay', uiText("Overlay position"), ['left', 'center']),

  // Net Lines
  S('board', 'netLines', uiText("Net Lines"), ['net line', 'connection', 'route', 'trace']),
  S('board', 'netLines', uiText("Line colours"), ['net color', 'adjacent color', 'primary color', 'chain color'], ),
  F('board', 'netLines', 'netLineWidth', uiText("Line Width"), uiText("Thickness of the connection lines drawn between pins of the same net when a net is selected")),
  F('board', 'netLines', 'netLineAlpha', uiText("Line Opacity"), uiText("Transparency of net connection lines. 0 = invisible, 1 = fully opaque")),
  F('board', 'netLines', 'netLineDashed', uiText("Dashed (on/off)"), uiText("Draw net connection lines as dashed instead of solid. Easier to distinguish from board traces")),
  F('board', 'netLines', 'netLineDashLength', uiText("Dashed (dash length)"), uiText("Length of each dash segment (screen pixels) in the dashed net line pattern")),
  F('board', 'netLines', 'netLinePulse', uiText("Pulse Animation"), uiText("Animate net lines with a red traveling pulse effect, making the connection path easier to follow across the board")),

  // ── INPUT TAB ──────────────────────────────────────────────────────────

  // Zoom Level of Detail
  S('input', 'zoomLod', uiText("Zoom Level of Detail"), ['lod', 'level of detail', 'show labels', 'hide labels', 'zoom threshold']),
  F('input', 'zoomLod', 'labelMinScreenPx', uiText("Part Labels"), uiText("Part name labels (R1, U1, C42) appear when they reach this many screen pixels. At 100% zoom a medium (8 mil) label = 8px. Set to 10 to hide them below 125% zoom.")),
  F('input', 'zoomLod', 'circleLabelMinScreenPx', uiText("Pin Labels"), uiText("Pin numbers and net names on ICs/BGAs appear when they reach this many screen pixels. At 100% zoom a 6-mil pin label = 6px.")),
  F('input', 'zoomLod', 'twoPinLabelMinScreenPx', uiText("2-Pin Net Names"), uiText("Net names on resistors/capacitors (2-pin parts) appear when they reach this many screen pixels.")),
  F('input', 'zoomLod', 'labelHideThreshold', uiText("Label Cull (mils)"), uiText("Labels smaller than this (in board mils) are permanently removed from the scene — never drawn at any zoom. Saves GPU memory on dense boards.")),
  F('input', 'zoomLod', 'labelZoomHide', uiText("Global Zoom Floor"), uiText("Hard minimum zoom level to show ANY text. 0 = disabled. All labels vanish below this zoom level.")),
  F('input', 'zoomLod', 'selectedLabelMinPx', uiText("Selected Part Labels"), uiText("The selected part's labels never render smaller than this many screen pixels while selected (Text fast mode). 0 = scale naturally.")),

  // Navigation
  S('input', 'navigation', uiText("Navigation"), ['scroll', 'pan', 'zoom', 'wheel', 'drag', 'pinch']),
  S('input', 'navigation', uiText("Interactive gesture setup"), ['welcome', 'wizard', 'first run', 'gesture', 're-run setup']),
  S('input', 'navigation', uiText("Scroll wheel behavior"), ['scroll', 'wheel', 'pan', 'zoom', 'bindings', 'shift', 'ctrl', 'cmd', 'horizontal', 'macos']),
  S('input', 'navigation', uiText("Trackpad/Mouse drag behavior"), ['drag', 'left drag', 'pan', 'zoom', 'shift drag']),
  S('input', 'navigation', uiText("Keyboard pan / zoom"), ['wsad', 'arrow keys', 'keyboard']),
  F('input', 'navigation', 'wheelDetection', uiText("Mouse wheel detection"), uiText("When scroll is set to pan, classic mouse-wheel events override to zoom instead — avoids jerky pan with a physical scroll wheel. Trackpads and fine-grained wheels are unaffected.")),
  F('input', 'navigation', 'keyboardPanFraction', uiText("Keyboard Pan Step"), uiText("Fraction of screen dimension panned per WSAD or Alt+Arrow keypress. Default: 10% of screen width/height per press.")),
  F('input', 'navigation', 'keyboardZoomDelta', uiText("Keyboard Zoom Step"), uiText("Raw zoom delta per Shift+W / Shift+S keypress. Applies to both board and PDF.")),
  F('input', 'navigation', 'wheelSmooth', uiText("Wheel Smoothing"), uiText("Mouse wheel zoom smoothness. 1 = instant snap, higher = smoother animated zoom. Default: 5")),
  F('input', 'navigation', 'fitPadding', uiText("Fit Padding"), uiText("Extra padding (screen pixels) added when fitting the board to the viewport (Fit to Screen, double-click zoom). Prevents the board from touching viewport edges")),
  F('input', 'navigation', 'navTargetSize', uiText("Component Size"), uiText("Target on-screen size of a component after navigating to it from search / NetList / Worklist. Expressed as a fraction of the smaller viewport dimension. Default 0.25 (~25%)."), ['navigate to', 'zoom on click']),
  F('input', 'navigation', 'navZoomMode', uiText("Zoom Mode"), uiText("How navigation should treat zoom level: Auto / Keep / Always."), ['auto keep always', 'navigation zoom']),
  F('input', 'navigation', 'disableInertia', uiText("Inertia"), uiText("Continue panning with momentum after releasing a drag gesture."), ['momentum', 'glide']),
  F('input', 'navigation', 'clickThreshold', uiText("Pin Click Radius"), uiText("Maximum distance (screen pixels) from a pin center that counts as a click on that pin. Larger = easier to click small or densely packed pins")),

  // Shortcuts
  S('input', 'shortcuts', uiText("Keyboard Shortcuts"), ['keybind', 'shortcut', 'hotkey']),

  // ── SYSTEM TAB ─────────────────────────────────────────────────────────

  // Performance & Debug
  S('system', 'performance', uiText("Performance & Debug"), ['perf', 'fps', 'debug']),
  F('system', 'performance', 'showPerfOverlay', uiText("Show Perf Overlay"), uiText("Show per-phase frame-time stats (frame / lod / sel / net / gpu) on each board panel. Same toggle as the small \"i\" button at the bottom-left of a panel")),
  F('system', 'performance', 'textFastMode', uiText("Text fast mode (experimental)"), uiText("Draw board text on a 2D overlay instead of in-scene text objects — faster on dense boards. Experimental: report rendering glitches.")),
  F('system', 'performance', 'smoothZoom', uiText("Smooth wheel zoom"), uiText("Animated cursor-anchored zoom")),
  F('system', 'performance', 'cap60Fps', uiText("Cap to 60 FPS"), uiText("Limit the renderer to 60 frames per second. Disable to let the ticker run at the display refresh rate (120/144/240 Hz) — smoother but more CPU/GPU work")),
  F('system', 'performance', 'boardAntialiasing', uiText("Edge smoothing (MSAA)"), uiText("Multisampled rendering for the board. Keep it on; thin lines break into jaggies without it. Off saves GPU work. Takes effect when a board panel is next opened")),
  F('system', 'performance', 'twoFingerRotate', uiText("Two-finger rotation"), uiText("On a touch screen, turning two fingers turns the board about the point between them. Starts locked: a turn past 24° unlocks, a two-finger double-tap locks again. Angle kept on lift, snapped to a right angle within 10°")),
  F('system', 'performance', 'rotateUnlockDeg', uiText("Rotation unlock angle"), uiText("While two-finger rotation is locked, the fingers must turn this far before it unlocks. Default 24°")),
  F('system', 'performance', 'rotateSnapDeg', uiText("Rotation snap window"), uiText("A two-finger rotation ending within this many degrees of 0/90/180/270 snaps to that right angle; 0 never snaps. Default 10°")),
  F('system', 'performance', 'boardResolutionCap', uiText("Render resolution limit"), uiText("Ceiling on the board render resolution; 0 = none. Lower is faster on an older tablet or laptop. Set by the Board quality preset"), ['quality', 'preset', 'ipad', 'slow', 'fps']),
  F('system', 'performance', 'traceCorners', uiText("Simple trace corners"), uiText("Bevelled bends and square ends instead of rounded ones: about half the trace geometry. Set by the Board quality preset"), ['quality', 'preset', 'traces']),
  F('system', 'performance', 'touchPerformanceMode', uiText("Touch device performance mode"), uiText("On a tablet: 60 FPS cap and a 1.5× render resolution ceiling for the board; edge smoothing stays on. Board text keeps full resolution. No effect on a mouse or trackpad machine")),
  F('system', 'performance', 'labelAtlasResolution', uiText("Label Atlas Resolution"), uiText("Pixel multiplier for the BitmapFont atlases used by pin/net/part labels. Higher = sharper labels at deep zoom; texture memory grows ~quadratically. Default 8. Triggers a scene rebuild.")),
  F('system', 'performance', 'hideTextDuringZoom', uiText("Hide Text During Zoom"), uiText("Temporarily hide all text labels while zooming or panning for smoother performance. Labels reappear when interaction stops")),
  F('system', 'performance', 'showPadVertices', uiText("[Debug] Pad Vertex Crosshairs"), uiText("Draw magenta crosshair markers at each pin's exact coordinate from the board file. Useful for verifying parser accuracy")),
  F('system', 'performance', 'showVertexNumbers', uiText("[Debug] Outline Vertex Numbers"), uiText("Show numbered markers at each board outline vertex. Yellow = unique, orange = duplicate coordinates. Works for all board formats")),

  // PDF Viewer
  S('system', 'pdf', uiText("PDF Viewer"), ['pdf', 'pdfjs', 'schematic']),
  S('system', 'pdf', uiText("Render quality"), ['quality', 'max high medium low']),
  S('system', 'pdf', uiText("Render mode"), ['render mode', 'auto', 'standard', 'always tile']),
  S('system', 'pdf', uiText("Watermark filter"), ['watermark', 'vinafix', 'chinafix', 'erase']),
  S('system', 'pdf', uiText("PDF Navigation"), ['pdf nav', 'inertia']),
  F('system', 'pdf', 'pdfEnableBoundaries', uiText("Pan Boundaries"), uiText("Clamp PDF pan to page edges: prevents scrolling off the document at the first/last page and centers horizontally when the page fits the viewport."), ['pdf pan', 'clamp']),
  S('system', 'pdf', uiText("PDF Shortcuts")),
  S('system', 'pdf', uiText("PDF Scroll wheel behavior"), ['pdf scroll', 'pdf wheel', 'pdf bindings']),

  // ── LIBRARY TAB ────────────────────────────────────────────────────────

  // Scanning & Indexing
  S('library', 'server', uiText("Scanning & Indexing"), ['library', 'folder', 'scan', 'index', 'rescan']),
  S('library', 'server', uiText("Library Folder"), ['library path', 'docker mount']),
  S('library', 'server', uiText("Auto-scan on startup")),
  S('library', 'server', uiText("Auto-load bound PDFs"), ['auto pdf', 'open pdf on board']),
  S('library', 'server', uiText("Recent history depth"), ['history', 'recent files']),
  S('library', 'server', uiText("Clear recent history")),

  // Database info (split out of Scanning & Indexing)
  S('library', 'dbinfo', uiText("Database info"), ['db stats', 'file count', 'index status', 'database']),
  S('library', 'dbinfo', uiText("Open Database Editor")),
  S('library', 'dbinfo', uiText("Find duplicates"), ['dedup', 'duplicates', 'duplicate detection']),
  S('library', 'dbinfo', uiText("Reset PDF Text"), ['reset pdf index', 'wipe pdf']),
  S('library', 'dbinfo', uiText("Reset Database"), ['wipe', 'reset all']),

  // Library Sync (standalone collapsible)
  S('library', 'library-sync', uiText("Library Sync"), ['webdav', 'copyparty', 'mirror', 'sync']),
  S('library', 'library-sync', uiText("Sync config"), ['url', 'schedule', 'target', 'enabled']),
  S('library', 'library-sync', uiText("Sync progress"), ['running', 'transferring']),
  S('library', 'library-sync', uiText("Sync errors"), ['failed', 'error log']),
  S('library', 'library-sync', uiText("Indexing status"), ['scan', 'pdf index']),

  // ── SYSTEM TAB (continued) ─────────────────────────────────────────────

  // Software update (standalone collapsible, moved from Library Sync)
  S('system', 'updates', uiText("Software update"), ['boardripper update', 'self-update', 'check now', 'version', 'upgrade']),
  S('system', 'updates', uiText("Drop-to-update recovery"), ['update bundle', 'offline update', 'brupdate', 'drag and drop update']),

  // Troubleshooting (standalone collapsible — cache/render resets)
  S('system', 'troubleshooting', uiText("Troubleshooting"), ['cache', 'reset caches', 'restart render', 'reset pdf caches', 'clear cache', 'indexeddb', 'reset settings', 'reset all', 'local settings', 'defaults', 'factory reset', 'clear settings', 'localstorage']),

  // OpenBoardData (standalone collapsible)
  S('library', 'obd', uiText("OpenBoardData"), ['obd', 'diagnostic', 'voltage', 'diode', 'resistance', 'measurements']),
  S('library', 'obd', uiText("Sync OBD index")),
  S('library', 'obd', uiText("Delete all OBD data"), ['wipe obd', 'reset obd']),
];

// ──────────────────────────────────────────────────────────────────────────

export interface MatchResult {
  /** Slider/Toggle field names whose entry matched. These get highlighted. */
  fieldMatches: Set<string>;
  /** Section ids that were matched directly (via section-level entries OR
   *  containment of any field match). Sections in this set should be visible
   *  in the rendered panel. */
  sectionMatches: Set<SearchSectionId>;
  /** Sections matched by section-level entries only (no specific field).
   *  When the user types "navigation", we want to show ALL controls in the
   *  Navigation section, not hide everything except matching sliders.
   *  Slider/Toggle filtering checks this set to decide whether to show
   *  itself unconditionally inside a whole-section match. */
  wholeSectionMatches: Set<SearchSectionId>;
  /** Match count per tab (used for the tab-pill badges). */
  perTabCount: Map<SettingsTabId, number>;
  /** Total entries matched. */
  total: number;
}

const EMPTY_RESULT: MatchResult = {
  fieldMatches: new Set(),
  sectionMatches: new Set(),
  wholeSectionMatches: new Set(),
  perTabCount: new Map(),
  total: 0,
};

function normalize(s: string): string {
  return s.toLowerCase();
}

function entryMatches(e: IndexEntry, tokens: string[]): boolean {
  const haystack = normalize(
    e.label + ' ' + (e.tooltip ?? '') + ' ' + (e.keywords?.join(' ') ?? '')
  );
  for (const t of tokens) {
    if (!haystack.includes(t)) return false;
  }
  return true;
}

export function searchSettings(query: string): MatchResult {
  const q = query.trim();
  if (!q) return EMPTY_RESULT;
  const tokens = normalize(q).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return EMPTY_RESULT;

  const fieldMatches = new Set<string>();
  const sectionMatches = new Set<SearchSectionId>();
  const wholeSectionMatches = new Set<SearchSectionId>();
  const perTabCount = new Map<SettingsTabId, number>();
  let total = 0;

  for (const e of SETTINGS_INDEX) {
    if (!entryMatches(e, tokens)) continue;
    total++;
    perTabCount.set(e.tab, (perTabCount.get(e.tab) ?? 0) + 1);
    sectionMatches.add(e.section);
    if (e.field) {
      fieldMatches.add(e.field);
    } else {
      wholeSectionMatches.add(e.section);
    }
  }

  return { fieldMatches, sectionMatches, wholeSectionMatches, perTabCount, total };
}

/** Build a quick map field → entry for dev-time validation + section lookup. */
const FIELD_TO_ENTRY: Map<string, IndexEntry> = (() => {
  const m = new Map<string, IndexEntry>();
  for (const e of SETTINGS_INDEX) {
    if (e.field) m.set(e.field, e);
  }
  return m;
})();

/** Returns true when the given Slider/Toggle field appears in the index. */
export function hasIndexEntryFor(field: string): boolean {
  return FIELD_TO_ENTRY.has(field);
}

/** Look up which section a Slider/Toggle field lives in. Returns undefined
 *  when the field isn't in the index (during a drift window before the
 *  index gets updated). */
export function getSectionForField(field: string): SearchSectionId | undefined {
  return FIELD_TO_ENTRY.get(field)?.section;
}
