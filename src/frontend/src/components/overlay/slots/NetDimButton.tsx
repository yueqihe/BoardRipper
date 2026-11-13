import { uiText } from '../../../i18n';
import { IconBulb, IconBulbFilled, IconBulbOff } from '@tabler/icons-react';
import { boardStore } from '../../../store/board-store';
import type { SlotCtx } from '../slot-ctx';

const MODE_INFO = {
  off:       { icon: IconBulbOff,    title: uiText("Selection dimming: OFF (click for dim)") },
  dim:       { icon: IconBulb,       title: uiText("Selection dimming: ON (click for darklight)") },
  darklight: { icon: IconBulbFilled, title: uiText("Darklight: spotlight around selected (click to turn off)") },
} as const;

export function NetDimButton({ ctx }: { ctx: SlotCtx }) {
  const { dimMode } = ctx.thisTab;
  const info = MODE_INFO[dimMode];
  const Icon = info.icon;
  return (
    <button
      className={`board-netlines-toggle ${dimMode !== 'off' ? 'active' : ''}`}
      onClick={() => boardStore.cycleDimMode()}
      title={info.title}
    >
      <Icon size={16} />
    </button>
  );
}
