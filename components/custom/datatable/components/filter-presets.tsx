import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookmarkPlus, Bookmark, Trash2, Clock, Building, MapPin, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  createdAt: string;
  isDefault?: boolean;
}

interface FilterPresetsProps {
  tableName: string;
  onApplyPreset: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'recent',
    name: 'Recent Assets',
    description: 'Assets added in the last 30 days',
    filters: {
      datetime_encoded: {
        type: 'dateRange',
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'it-department',
    name: 'IT Department',
    description: 'All IT department assets',
    filters: {
      department: 'IT',
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'main-office',
    name: 'Main Office',
    description: 'Assets located in main office',
    filters: {
      location: 'Main Office',
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'computers',
    name: 'Computer Hardware',
    description: 'All computer hardware assets',
    filters: {
      category: 'YBFA08',
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
];

const FilterPresets: React.FC<FilterPresetsProps> = ({ tableName, onApplyPreset, currentFilters }) => {
  const [presets, setPresets] = useState<FilterPreset[]>(DEFAULT_PRESETS);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // Load saved presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem(`filter-presets-${tableName}`);
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        setPresets([...DEFAULT_PRESETS, ...parsed]);
      } catch (error) {
        console.error('Error loading saved presets:', error);
      }
    }
  }, [tableName]);

  // Save presets to localStorage
  const savePresetsToStorage = (newPresets: FilterPreset[]) => {
    const customPresets = newPresets.filter(p => !p.isDefault);
    localStorage.setItem(`filter-presets-${tableName}`, JSON.stringify(customPresets));
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      description: presetDescription.trim() || undefined,
      filters: { ...currentFilters },
      createdAt: new Date().toISOString(),
      isDefault: false,
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);

    toast.success(`Filter preset "${presetName}" saved successfully`);
    setShowSaveDialog(false);
    setPresetName('');
    setPresetDescription('');
  };

  const handleDeletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset?.isDefault) {
      toast.error('Cannot delete default presets');
      return;
    }

    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    toast.success('Filter preset deleted');
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset.filters);
    toast.success(`Applied filter preset: ${preset.name}`);
  };

  const getPresetIcon = (preset: FilterPreset) => {
    if (preset.id === 'recent') return <Clock className="h-4 w-4" />;
    if (preset.id === 'it-department') return <Building className="h-4 w-4" />;
    if (preset.id === 'main-office') return <MapPin className="h-4 w-4" />;
    if (preset.id === 'computers') return <Filter className="h-4 w-4" />;
    return <Bookmark className="h-4 w-4" />;
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Bookmark className="h-4 w-4 mr-2" />
            Filter Presets
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {Object.keys(currentFilters).length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {DEFAULT_PRESETS.map(preset => (
            <DropdownMenuItem key={preset.id} onClick={() => handleApplyPreset(preset)} className="flex items-center gap-2 cursor-pointer">
              {getPresetIcon(preset)}
              <div className="flex-1">
                <div className="font-medium">{preset.name}</div>
                {preset.description && <div className="text-xs text-muted-foreground">{preset.description}</div>}
              </div>
            </DropdownMenuItem>
          ))}

          {presets.filter(p => !p.isDefault).length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Custom Presets</DropdownMenuLabel>
              {presets
                .filter(p => !p.isDefault)
                .map(preset => (
                  <DropdownMenuItem
                    key={preset.id}
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={e => {
                      e.preventDefault();
                      handleApplyPreset(preset);
                    }}
                  >
                    <Bookmark className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{preset.name}</div>
                      {preset.description && <div className="text-xs text-muted-foreground">{preset.description}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))}
            </>
          )}

          <DropdownMenuSeparator />
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={e => e.preventDefault()} className="flex items-center gap-2 cursor-pointer" disabled={!hasActiveFilters}>
                <BookmarkPlus className="h-4 w-4" />
                Save Current Filters
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Filter Preset</DialogTitle>
                <DialogDescription>Save your current filter combination as a preset for quick access later.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input id="preset-name" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Enter preset name..." />
                </div>
                <div>
                  <Label htmlFor="preset-description">Description (Optional)</Label>
                  <Input id="preset-description" value={presetDescription} onChange={e => setPresetDescription(e.target.value)} placeholder="Enter description..." />
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Current Filters:</strong>
                  <div className="mt-1 space-y-1">
                    {Object.entries(currentFilters).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePreset}>Save Preset</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterPresets;
