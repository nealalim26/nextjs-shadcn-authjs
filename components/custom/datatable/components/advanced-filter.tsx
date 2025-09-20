import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string | string[];
  logic?: 'AND' | 'OR';
}

interface AdvancedFilterProps {
  columns: Array<{
    id: string;
    header: string;
    type: string;
    accessorKey?: string;
  }>;
  onApplyFilters: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
}

const OPERATORS = [
  { value: 'equals', label: 'Equals', type: 'text' },
  { value: 'not_equals', label: 'Not Equals', type: 'text' },
  { value: 'contains', label: 'Contains', type: 'text' },
  { value: 'not_contains', label: 'Does Not Contain', type: 'text' },
  { value: 'starts_with', label: 'Starts With', type: 'text' },
  { value: 'ends_with', label: 'Ends With', type: 'text' },
  { value: 'is_empty', label: 'Is Empty', type: 'none' },
  { value: 'is_not_empty', label: 'Is Not Empty', type: 'none' },
  { value: 'greater_than', label: 'Greater Than', type: 'number' },
  { value: 'less_than', label: 'Less Than', type: 'number' },
  { value: 'between', label: 'Between', type: 'range' },
  { value: 'in', label: 'In List', type: 'array' },
  { value: 'not_in', label: 'Not In List', type: 'array' },
];

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ columns, onApplyFilters, currentFilters }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [conditions, setConditions] = useState<FilterCondition[]>([
    {
      id: '1',
      column: '',
      operator: 'equals',
      value: '',
      logic: 'AND',
    },
  ]);

  // Get filterable columns (exclude actions, select, etc.)
  const filterableColumns = columns.filter(col => 'accessorKey' in col && col.accessorKey && typeof col.accessorKey === 'string' && !['select', 'actions'].includes(col.accessorKey));

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Date.now().toString(),
      column: '',
      operator: 'equals',
      value: '',
      logic: 'AND',
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof FilterCondition, value: any) => {
    setConditions(conditions.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const getOperatorType = (operator: string) => {
    return OPERATORS.find(op => op.value === operator)?.type || 'text';
  };

  const renderValueInput = (condition: FilterCondition) => {
    const operatorType = getOperatorType(condition.operator);

    if (operatorType === 'none') {
      return null;
    }

    if (operatorType === 'array') {
      return (
        <Input
          placeholder="Enter values separated by commas"
          value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
          onChange={e => {
            const values = e.target.value
              .split(',')
              .map(v => v.trim())
              .filter(v => v);
            updateCondition(condition.id, 'value', values);
          }}
        />
      );
    }

    if (operatorType === 'range') {
      const values = Array.isArray(condition.value) ? condition.value : ['', ''];
      return (
        <div className="flex gap-2">
          <Input
            placeholder="From"
            value={values[0] || ''}
            onChange={e => {
              const newValues = [e.target.value, values[1] || ''];
              updateCondition(condition.id, 'value', newValues);
            }}
          />
          <Input
            placeholder="To"
            value={values[1] || ''}
            onChange={e => {
              const newValues = [values[0] || '', e.target.value];
              updateCondition(condition.id, 'value', newValues);
            }}
          />
        </div>
      );
    }

    return <Input placeholder="Enter value" value={typeof condition.value === 'string' ? condition.value : ''} onChange={e => updateCondition(condition.id, 'value', e.target.value)} />;
  };

  const convertConditionsToFilters = (conditions: FilterCondition[]): Record<string, any> => {
    const filters: Record<string, any> = {};

    conditions.forEach(condition => {
      if (!condition.column || !condition.value) return;

      const { column, operator, value } = condition;

      switch (operator) {
        case 'equals':
          filters[column] = value;
          break;
        case 'not_equals':
          filters[column] = { $ne: value };
          break;
        case 'contains':
          filters[column] = { $regex: value, $options: 'i' };
          break;
        case 'not_contains':
          filters[column] = { $not: { $regex: value, $options: 'i' } };
          break;
        case 'starts_with':
          filters[column] = { $regex: `^${value}`, $options: 'i' };
          break;
        case 'ends_with':
          filters[column] = { $regex: `${value}$`, $options: 'i' };
          break;
        case 'is_empty':
          filters[column] = { $in: [null, ''] };
          break;
        case 'is_not_empty':
          filters[column] = { $nin: [null, ''] };
          break;
        case 'greater_than':
          filters[column] = { $gt: value };
          break;
        case 'less_than':
          filters[column] = { $lt: value };
          break;
        case 'between':
          if (Array.isArray(value) && value.length === 2) {
            filters[column] = { $gte: value[0], $lte: value[1] };
          }
          break;
        case 'in':
          filters[column] = { $in: Array.isArray(value) ? value : [value] };
          break;
        case 'not_in':
          filters[column] = { $nin: Array.isArray(value) ? value : [value] };
          break;
        default:
          filters[column] = value;
      }
    });

    return filters;
  };

  const handleApplyFilters = () => {
    const validConditions = conditions.filter(c => c.column && c.value);

    if (validConditions.length === 0) {
      toast.error('Please add at least one valid filter condition');
      return;
    }

    const filters = convertConditionsToFilters(validConditions);
    onApplyFilters(filters);
    setShowDialog(false);
    toast.success(`Applied ${validConditions.length} advanced filter(s)`);
  };

  const handleClearFilters = () => {
    setConditions([
      {
        id: '1',
        column: '',
        operator: 'equals',
        value: '',
        logic: 'AND',
      },
    ]);
    onApplyFilters({});
    setShowDialog(false);
    toast.success('Cleared all filters');
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings2 className="h-4 w-4 mr-2" />
          Advanced Filter
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {Object.keys(currentFilters).length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filter</DialogTitle>
          <DialogDescription>Create complex filter combinations to find exactly what you&apos;re looking for.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <div key={condition.id} className="space-y-3">
              {index > 0 && (
                <div className="flex items-center gap-2">
                  <Select value={condition.logic} onValueChange={(value: 'AND' | 'OR') => updateCondition(condition.id, 'logic', value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="h-px bg-border flex-1" />
                </div>
              )}

              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-3">
                  <Label>Column</Label>
                  <Select value={condition.column} onValueChange={value => updateCondition(condition.id, 'column', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterableColumns.map(col => (
                        <SelectItem key={col.accessorKey || col.id} value={col.accessorKey || col.id}>
                          {typeof col.header === 'string' ? col.header : col.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <Label>Operator</Label>
                  <Select value={condition.operator} onValueChange={value => updateCondition(condition.id, 'operator', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(op => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-5">
                  <Label>Value</Label>
                  {renderValueInput(condition)}
                </div>

                <div className="col-span-1">
                  <Button variant="outline" size="sm" onClick={() => removeCondition(condition.id)} disabled={conditions.length === 1} className="h-10 w-10 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addCondition} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilter;
