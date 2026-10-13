import {
  ChartArea,
  ChartCandlestick,
  ChartColumnBig,
  ChartLine,
  ChartScatter,
  Dices,
  Map,
  SwatchBook,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const charts = [
  { value: "mixed", label: "Mixed", Icon: Dices },
  { value: "bar", label: "Bar", Icon: ChartColumnBig },
  { value: "area", label: "Area", Icon: ChartArea },
  { value: "boxplot", label: "Boxplot", Icon: ChartCandlestick },
  { value: "line", label: "Line", Icon: ChartLine },
  { value: "map", label: "Map", Icon: Map },
  { value: "scatter", label: "Scatter", Icon: ChartScatter },
];

// Choose how palettes are previewed in the overview
const PlotTypeSelect = ({ value, onValueChange }) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="w-[150px]" aria-label="Preview type">
      <SelectValue placeholder="Select plot type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="palette">
        <SwatchBook className="inline-block mr-2 w-4 h-4" /> Palette
      </SelectItem>
      <SelectSeparator />
      <SelectGroup>
        <SelectLabel>Charts</SelectLabel>
        {charts.map(({ value, label, Icon }) => (
          <SelectItem key={value} value={value}>
            <Icon className="inline-block mr-2 w-4 h-4" /> {label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

export default PlotTypeSelect;
