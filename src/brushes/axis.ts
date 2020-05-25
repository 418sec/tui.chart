import { TickModel, LineModel } from '@t/components/axis';
import { line } from '@src/brushes/basic';

export function tick(ctx: CanvasRenderingContext2D, tickModel: TickModel) {
  const { x, y, isYAxis } = tickModel;
  const lineModel: LineModel = { type: 'line', x, y, x2: x, y2: y };

  if (isYAxis) {
    lineModel.x -= 5;
  } else {
    lineModel.y2 += 5;
  }

  line(ctx, lineModel);
}