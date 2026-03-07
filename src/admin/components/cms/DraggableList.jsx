/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * DraggableList Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Reorderable list component with drag-and-drop using @dnd-kit
 * 
 * @props
 * - items: Array of items (must have `id` field)
 * - onReorder: Callback function(newItems) called after reorder
 * - renderItem: Function(item, index, dragHandleProps) that renders each item
 * 
 * @usage
 * <DraggableList
 *   items={features}
 *   onReorder={setFeatures}
 *   renderItem={(item, index, dragHandleProps) => (
 *     <div>
 *       <div {...dragHandleProps}>
 *         <GripVertical className="w-4 h-4" />
 *       </div>
 *       <input value={item.title} onChange={...} />
 *     </div>
 *   )}
 * />
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

/**
 * Individual sortable item wrapper
 */
function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {children({ attributes, listeners })}
    </div>
  );
}

/**
 * Main DraggableList component
 */
export function DraggableList({
  items = [],
  onReorder,
  renderItem,
  emptyMessage = 'No items yet',
}) {
  const [activeId, setActiveId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {({ attributes, listeners }) => {
                // Provide drag handle props to render function
                const dragHandleProps = {
                  ...attributes,
                  ...listeners,
                  className: 'cursor-grab active:cursor-grabbing touch-none',
                };

                return renderItem(item, index, dragHandleProps);
              }}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay (optional, for better visual feedback) */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-gray-800 border border-indigo-500 rounded-lg p-4 shadow-xl opacity-90">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default DraggableList;
