import { uiText } from '../i18n';
import { useBoardStore } from '../hooks/useBoardStore';
import { useMemoryStat } from '../hooks/useMemoryStat';
import { getAllExtensions } from '../parsers/registry';

declare const __APP_VERSION__: string;

export function StatusBar() {
  const { board, selection, selectedPart, selectedPin } = useBoardStore();
  const mem = useMemoryStat();

  return (
    <div className="statusbar" data-testid="statusbar">
      {board ? (
        <>
          {/* One string, not two text nodes: switching tabs removed the
              version node beside a translated format name and React threw,
              which unmounted the whole app (issue #36). A format is a name. */}
          <span title={uiText("Board file format")} translate="no">
            {board.formatVersion ? `${board.format} (${board.formatVersion})` : board.format}
          </span>
          <span className="statusbar-sep">|</span>
          <span title={uiText("BoardRipper version")}>v{__APP_VERSION__}</span>
          <span className="statusbar-sep">|</span>
          <span>{uiText("Components: ")}{board.parts.length}</span>
          <span className="statusbar-sep">|</span>
          <span>{uiText("Nets: ")}{board.nets.size}</span>
          {board.nails.length > 0 && (
            <>
              <span className="statusbar-sep">|</span>
              <span>{uiText("Nails: ")}{board.nails.length}</span>
            </>
          )}
          {board.traces && board.traces.length > 0 && (
            <>
              <span className="statusbar-sep">|</span>
              <span>{uiText("Traces: ")}{board.traces.length}</span>
            </>
          )}
          {selectedPart && (
            <>
              <span className="statusbar-sep">|</span>
              <span>{uiText("Selected: ")}{selectedPart.name}</span>
            </>
          )}
          {selectedPin && (
            <>
              <span className="statusbar-sep">|</span>
              <span>{uiText("Pin: ")}{selectedPin.name} → {selectedPin.net}</span>
            </>
          )}
          {selection.highlightedNet && (
            <>
              <span className="statusbar-sep">|</span>
              <span>{uiText("Net: ")}{selection.highlightedNet}</span>
            </>
          )}
        </>
      ) : (
        <span>{uiText("BoardRipper v")}{__APP_VERSION__}{uiText(" — Supports ")}{getAllExtensions().join(', ')}{uiText(" formats. Vibecoded by RipperDoc")}</span>
      )}
      {mem && (
        <>
          <span className="statusbar-sep">|</span>
          <span title={mem.title} data-testid="statusbar-mem">{mem.label}</span>
        </>
      )}
    </div>
  );
}
