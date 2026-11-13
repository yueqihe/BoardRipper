import { uiText } from '../i18n';
import { useDatabank } from '../hooks/useDatabank';
import { ensureDatabaseEditorPanel } from '../store/dockview-api';
import { ResistorColorTool } from './tools/ResistorColorTool';
import { SmdResistorTool } from './tools/SmdResistorTool';
import { CapacitorTool } from './tools/CapacitorTool';
import { WorklistsTool } from './tools/WorklistsTool';
import { PartCompareTool } from './tools/PartCompareTool';
// Which tool is open lives outside this component so the board right-click can
// navigate straight to Part comparison. See `tools/tools-nav.ts`.
import { setActiveTool, useActiveTool, type ToolId } from './tools/tools-nav';

const CALCULATORS: { id: ToolId; name: string; hint: string }[] = [
  { id: 'resistor', name: 'Resistor color-band', hint: uiText("4 / 5 / 6-band to ohms") },
  { id: 'smd', name: 'SMD resistor code', hint: uiText("103, 4R7, 01C to ohms") },
  { id: 'capacitor', name: 'Capacitor converter', hint: uiText("convert pF / nF / µF") },
];

/** Title shown in the back link for tools that are not calculators. */
const TOOL_TITLES: Record<ToolId, string> = {
  resistor: uiText("Resistor color-band"),
  smd: uiText("SMD resistor code"),
  capacitor: uiText("Capacitor converter"),
  worklists: uiText("Worklists"),
  partcompare: uiText("Part comparison"),
};

export function ToolsPanel() {
  const activeTool = useActiveTool();
  const { backendAvailable } = useDatabank();

  if (activeTool) {
    return (
      <div className="tools-panel" data-testid="tools-panel">
        <button
          className="tools-back"
          data-testid="tools-back"
          onClick={() => setActiveTool(null)}
        >{uiText("← Tools / ")}{TOOL_TITLES[activeTool]}
        </button>
        <div className="tools-tool-body">
          {activeTool === 'resistor' && <ResistorColorTool />}
          {activeTool === 'smd' && <SmdResistorTool />}
          {activeTool === 'capacitor' && <CapacitorTool />}
          {activeTool === 'worklists' && <WorklistsTool />}
          {activeTool === 'partcompare' && <PartCompareTool />}
        </div>
      </div>
    );
  }

  return (
    <div className="tools-panel" data-testid="tools-panel">
      <div className="tools-group-label">{uiText("Calculators")}</div>
      {CALCULATORS.map(c => (
        <button
          key={c.id}
          className="tools-entry"
          data-testid={`tools-entry-${c.id}`}
          onClick={() => setActiveTool(c.id)}
        >
          <span className="tools-entry-text">
            {c.name}
            <small>{c.hint}</small>
          </span>
        </button>
      ))}

      <div className="tools-group-label">{uiText("Workbench")}</div>
      <button
        className="tools-entry"
        data-testid="tools-entry-partcompare"
        onClick={() => setActiveTool('partcompare')}
      >
        <span className="tools-entry-text">{uiText("Part comparison")}<small>{uiText("one component's pinout across two open boards")}</small>
        </span>
      </button>
      <button
        className="tools-entry"
        data-testid="tools-entry-worklists"
        onClick={() => setActiveTool('worklists')}
      >
        <span className="tools-entry-text">{uiText("Worklists")}<small>{uiText("every worklist stored on this device")}</small>
        </span>
      </button>
      {backendAvailable && (
        <button
          className="tools-entry"
          data-testid="tools-entry-dbeditor"
          onClick={ensureDatabaseEditorPanel}
        >
          <span className="tools-entry-text">{uiText("Database Editor")}</span>
          <span className="tools-entry-status">{uiText("opens panel")}</span>
        </button>
      )}
      <div className="tools-entry tools-entry-soon" aria-disabled="true">
        <span className="tools-entry-text">{uiText("Wiki")}</span>
        <span className="tools-entry-status">{uiText("soon")}</span>
      </div>
    </div>
  );
}
