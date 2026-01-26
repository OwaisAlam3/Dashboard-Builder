// src/components/Widgets/index.js
import MetricWidget from './MetricWidget';
import StatGridWidget from './StatGridWidget';
import LineChartWidget from './LineChartWidget';
import BarChartWidget from './BarChartWidget';
import PieChartWidget from './PieChartWidget';
import TableWidget from './TableWidget';
import ListWidget from './ListWidget';
import StatusBoardWidget from './StatusBoardWidget';
import HeadingWidget from './HeadingWidget';
import TextBlockWidget from './TextBlockWidget';
import DividerWidget from './DividerWidget';
import ImageWidget from './ImageWidget';
import AlertWidget from './AlertWidget';

export const WIDGET_COMPONENTS = {
  metric: MetricWidget,
  statGrid: StatGridWidget,
  lineChart: LineChartWidget,
  barChart: BarChartWidget,
  pieChart: PieChartWidget,
  table: TableWidget,
  list: ListWidget,
  statusBoard: StatusBoardWidget,
  heading: HeadingWidget,
  textBlock: TextBlockWidget,
  divider: DividerWidget,
  image: ImageWidget,
  alert: AlertWidget,
};