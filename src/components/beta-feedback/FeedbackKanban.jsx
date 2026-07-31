import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { KANBAN_COLUMNS, columnForStatus, severityColor, statusColor } from '@/lib/betaFeedbackEngine';

export default function FeedbackKanban({ items, onMove, onOpen }) {
  const byCol = (colKey) => items.filter((i) => columnForStatus(i.status) === colKey);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    if (sourceCol === destCol) return;
    const dragged = byCol(sourceCol)[result.source.index];
    if (dragged) onMove(dragged, destCol);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 min-w-max">
          {KANBAN_COLUMNS.map((col) => {
            const colItems = byCol(col.key);
            return (
              <div key={col.key} className="w-72 shrink-0">
                <Droppable droppableId={col.key}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`rounded-2xl border border-white/10 bg-white/[0.02] p-3 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-white/[0.05]' : ''}`}>
                      <div className={`flex items-center justify-between px-1 pb-2 mb-2 border-t-2 ${col.accent} pt-2`}>
                        <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">{col.label}</span>
                        <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded-full">{colItems.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colItems.map((item, idx) => (
                          <Draggable key={item.id} draggableId={item.id} index={idx}>
                            {(p, s) => (
                              <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                                onClick={() => onOpen(item)}
                                className={`rounded-xl border border-white/10 bg-[#0d0d14] p-3 cursor-pointer hover:border-accent-orange/30 transition-colors ${s.isDragging ? 'shadow-lg ring-1 ring-accent-orange/30' : ''}`}>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <span className="text-[12px] font-semibold text-white leading-snug line-clamp-2">{item.title}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${severityColor[item.severity] || severityColor.Low}`}>{item.severity}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${statusColor[item.status] || statusColor.New}`}>{item.status}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/8">
                                  <span className="text-[9px] text-white/35 font-mono">{item.feedback_id}</span>
                                  {!!item.vote_count && <span className="text-[9px] text-amber-400">+{item.vote_count}</span>}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}