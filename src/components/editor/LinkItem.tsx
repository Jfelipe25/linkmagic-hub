import { GripVertical, Trash2, Link as LinkIcon } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CustomLink } from '@/types/profile';

interface LinkItemProps {
  link: CustomLink;
  onUpdate: (id: string, field: 'label' | 'url', value: string) => void;
  onRemove: (id: string) => void;
}

const LinkItem = ({ link, onUpdate, onRemove }: LinkItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-md border border-input bg-background p-2">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical size={16} />
      </button>
      <LinkIcon size={14} className="text-primary shrink-0" />
      <input
        type="text"
        value={link.label}
        onChange={(e) => onUpdate(link.id, 'label', e.target.value)}
        placeholder="Título"
        className="flex-1 h-8 rounded-md border border-input bg-secondary px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
      />
      <input
        type="url"
        value={link.url}
        onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
        placeholder="https://..."
        className="flex-1 h-8 rounded-md border border-input bg-secondary px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
      />
      <button onClick={() => onRemove(link.id)} className="text-muted-foreground hover:text-destructive shrink-0">
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default LinkItem;
