"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({
  id,
  itemClassName,
  children,
}: {
  id: string;
  itemClassName?: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={`admin-sortable-item ${itemClassName ?? ""}${isDragging ? " dragging" : ""}`}>
      <button
        type="button"
        className="admin-drag-handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <i className="bi bi-grip-vertical" aria-hidden="true" />
      </button>
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Generic vertical drag-and-drop list. Calls `onReorder` with the new ordered
 * array. Use for client-only reorder (e.g. gallery URLs) or have `onReorder`
 * call a server action that persists order (see `persistOrder` in lib/reorder).
 */
export default function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  itemClassName,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  renderItem: (item: T) => ReactNode;
  itemClassName?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="admin-gallery">
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id} itemClassName={itemClassName}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
