import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import PaletteDetailDialog from "./my-components/PaletteDetailDialog";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Plot from "./my-components/Plot";

const PaletteDisplay = ({ palettes }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("qualitative");
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [plotType, setPlotType] = useState("palette");

  // Plot types to cycle through when plotType is set to 'mixed' (should not be a multiple of 3 ideally)
  const mixedPlotTypes = ["bar", "area", "boxplot", "line", "scatter"];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize palette types for select dropdown
  const paletteTypes = ["all", "qualitative", "divergent", "sequential"];

  // Memoize filtered palettes
  const filteredPalettes = useMemo(() => {
    return palettes.filter((palette) => {
      const matchesSearch =
        palette.palette
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        palette.package
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || palette.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [palettes, debouncedSearchTerm, selectedType]);

  // Calculate the number of columns based on viewport width
  const getColumnCount = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [columnCount, setColumnCount] = useState(getColumnCount());

  // Update column count on window resize
  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getColumnCount]);

  // Calculate rows for virtualization
  const rowCount = Math.ceil(filteredPalettes.length / columnCount);

  // Dynamically adjust estimated row height based on plot type
  const getEstimatedRowHeight = () => {
    return plotType === "palette" ? 160 : 400;
  };

  // Key change: include plotType in dependencies to force re-creation when plot type changes
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => getEstimatedRowHeight(),
    overscan: 5,
    gap: 24,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [plotType]);

  // URL hash handling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const palette = palettes.find((p) => p.id === decodeURIComponent(hash));
        if (palette) {
          setSelectedPalette(palette);
        }
      } else {
        setSelectedPalette(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [palettes]);

  const handlePaletteSelect = (e, palette) => {
    e.preventDefault();
    window.location.hash = encodeURIComponent(palette.id);
  };

  const handlePaletteClose = () => {
    history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search,
    );
    setSelectedPalette(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-24" />

        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <Input
            placeholder="Search palettes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <div className="lg:order-3">
            <Select value={plotType} onValueChange={setPlotType}>
              <SelectTrigger className="w-[180px] ml-auto">
                <SelectValue placeholder="Select plot type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="palette">
                  {" "}
                  <SwatchBook className="inline-block mr-2" /> Palette{" "}
                </SelectItem>
                <SelectSeparator></SelectSeparator>
                <SelectGroup>
                  <SelectLabel>Charts</SelectLabel>
                  <SelectItem value="mixed">
                    {" "}
                    <Dices className="inline-block mr-2" /> Mixed{" "}
                  </SelectItem>
                  <SelectItem value="bar">
                    {" "}
                    <ChartColumnBig className="inline-block mr-2" /> Bar{" "}
                  </SelectItem>
                  <SelectItem value="area">
                    {" "}
                    <ChartArea className="inline-block mr-2" /> Area{" "}
                  </SelectItem>
                  <SelectItem value="boxplot">
                    {" "}
                    <ChartCandlestick className="inline-block mr-2" /> Boxplot{" "}
                  </SelectItem>
                  <SelectItem value="line">
                    {" "}
                    <ChartLine className="inline-block mr-2" /> Line{" "}
                  </SelectItem>
                  <SelectItem value="map">
                    {" "}
                    <Map className="inline-block mr-2" /> Map{" "}
                  </SelectItem>
                  <SelectItem value="scatter">
                    {" "}
                    <ChartScatter className="inline-block mr-2" /> Scatter{" "}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex mx-auto flex-wrap">
            <div className="flex items-center space-x-2 mx-auto text-sm text-gray-500">
              Palette Type
            </div>
            <RadioGroup
              value={selectedType}
              onValueChange={setSelectedType}
              className="flex mx-3 space-x-2"
            >
              {paletteTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={`type-${type}`} />
                  <Label
                    htmlFor={`type-${type}`}
                    className="capitalize cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 lg:text-center">
          Showing {filteredPalettes.length} of {palettes.length} palettes
        </p>

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columnCount;
            const rowPalettes = filteredPalettes.slice(
              startIndex,
              startIndex + columnCount,
            );

            return (
              <div
                key={virtualRow.index}
                className={`absolute left-0 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-shifted`}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {rowPalettes.map((palette, paletteIndexInRow) => (
                  <a
                    onClick={(e) => handlePaletteSelect(e, palette)}
                    key={palette.id}
                    href={`#${encodeURIComponent(palette.id)}`}
                  >
                    <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                      <CardHeader className="pt-4 pb-2">
                        <div className="relative">
                          <span className="text-sm text-gray-400 absolute top-1 right-0">
                            &#123;{palette.package}&#125; • {palette.length} •{" "}
                            {palette.type}
                          </span>
                          <span className="text-xl text-gray-600 relative inline-block bg-white pr-3">
                            {palette.palette}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {plotType === "palette" ? (
                          <div className="flex h-12 rounded-md overflow-hidden">
                            {palette.colors.map((color, index) => (
                              <div
                                key={`${palette.id}-${index}`}
                                className="flex-1 h-full"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        ) : (
                          <Plot
                            colors={palette.colors}
                            type={
                              plotType === "mixed"
                                ? mixedPlotTypes[
                                    (startIndex + paletteIndexInRow) %
                                      mixedPlotTypes.length
                                  ]
                                : plotType
                            }
                          ></Plot>
                        )}
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            );
          })}
        </div>

        {filteredPalettes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No palettes found matching your criteria
          </div>
        )}

        {selectedPalette && (
          <PaletteDetailDialog
            palette={selectedPalette}
            isOpen={!!selectedPalette}
            onClose={handlePaletteClose}
          />
        )}
      </div>
    </div>
  );
};

export default PaletteDisplay;
