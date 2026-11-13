import { uiText } from '../../../i18n';
import { IconTooltip } from '@tabler/icons-react';
import { boardStore } from '../../../store/board-store';
import type { SlotCtx } from '../slot-ctx';

export function HoverInfoButton({ ctx }: { ctx: SlotCtx }) {
  const { showHoverInfo } = ctx.thisTab;
  return (
    <button
      className={`board-netlines-toggle ${showHoverInfo ? 'active' : ''}`}
      onClick={() => boardStore.toggleHoverInfo()}
      title={showHoverInfo ? uiText("Hover info: ON") : uiText("Hover info: OFF")}
    >
      <IconTooltip size={16} />
    </button>
  );
}
