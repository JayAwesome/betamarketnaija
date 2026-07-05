import { CROPS, type Crop } from "@/lib/market-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CropPicker({ value, onChange }: { value: Crop; onChange: (c: Crop) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Crop)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CROPS.map((c) => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
