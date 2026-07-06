import { CROP_CATEGORIES, type Crop } from "@/lib/market-data";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function CropPicker({ value, onChange }: { value: Crop; onChange: (c: Crop) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Crop)}>
      <SelectTrigger className="w-[220px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(CROP_CATEGORIES) as [string, readonly string[]][]).map(([cat, crops]) => (
          <SelectGroup key={cat}>
            <SelectLabel>{cat}</SelectLabel>
            {crops.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
