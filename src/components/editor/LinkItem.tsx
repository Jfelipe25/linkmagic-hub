import { useState } from 'react';
import { GripVertical, Trash2, Link as LinkIcon, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CustomLink } from '@/types/profile';

interface LinkItemProps {
  link: CustomLink;
  onUpdate: (id: string, field: 'label' | 'url' | 'schedule_start' | 'schedule_end', value: string) => void;
  onRemove: (id: string) => void;
}

const LinkItem = ({ link, onUpdate, onRemove }: LinkItemProps) => {
  const [showSchedule, setShowSchedule] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasSchedule = link.schedule_start || link.schedule_end;

  return (
    <div ref={setNodeRef} style={style} className="rounded-md border border-input bg-background p-2 space-y-2">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical size={16} />
        </button>
        <LinkIcon size={14} className="text-primary shrink-0" />
        <input
          type="text" value={link.label} onChange={(e) => onUpdate(link.id, 'label', e.target.value)}
          placeholder="Título"
          className="flex-1 h-8 rounded-md border border-input bg-secondary px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
        />
        <input
          type="url" value={link.url} onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
          placeholder="https://..."
          className="flex-1 h-8 rounded-md border border-input bg-secondary px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
        />
        <button onClick={() => setShowSchedule(!showSchedule)}
          className={`shrink-0 transition-colors ${hasSchedule ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          title="Smart link - Programar">
          <Clock size={14} />
        </button>
        <button onClick={() => onRemove(link.id)} className="text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 size={16} />
        </button>
      </div>
      {showSchedule && (
        <div className="flex gap-2 pl-8">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground">Visible desde</label>
            <input
              type="datetime-local" value={link.schedule_start || ''}
              onChange={(e) => onUpdate(link.id, 'schedule_start', e.target.value)}
              className="w-full h-7 rounded border border-input bg-secondary px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground">Visible hasta</label>
            <input
              type="datetime-local" value={link.schedule_end || ''}
              onChange={(e) => onUpdate(link.id, 'schedule_end', e.target.value)}
              className="w-full h-7 rounded border border-input bg-secondary px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkItem;
