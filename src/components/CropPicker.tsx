import { CROP_CATEGORIES, type Crop } from "@/lib/market-data";
import { useT } from "@/lib/i18n";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function CropPicker({ value, onChange }: { value: Crop; onChange: (c: Crop) => void }) {
  const { tCrop, tCategory } = useT();
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Crop)}>
      <SelectTrigger className="w-[220px]">
        {/* Render translated label ourselves so it updates when language changes */}
        <SelectValue>{tCrop(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(CROP_CATEGORIES) as [string, readonly string[]][]).map(([cat, crops]) => (
          <SelectGroup key={cat}>
            <SelectLabel>{tCategory(cat)}</SelectLabel>
            {crops.map((c) => (
              <SelectItem key={c} value={c}>{tCrop(c)}</SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
