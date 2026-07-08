import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Trello, Bug, Lightbulb, TrendingUp } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";
import { ROADMAP_STAGES } from "@/lib/productManagement";
import { getTypeMeta } from "@/lib/feedbackConfig";

export default function ProductRoadmap({ pm, onSelect }) {
  const roadmapItems = pm.feedback.filter(f =>
    ["bug", "feature", "improvement", "idea"].includes(f.type)
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    pm.updateRoadmapStage(draggableId, destination.droppableId);
  };

  return (
    <div>
      <SectionHeader icon={Trello} title="Product Roadmap" description="Drag cards between stages to update the roadmap. Powered by the Feedback entity's roadmap_stage field." />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
          {ROADMAP_STAGES.map(stage => {
            const items = roadmapItems.filter(f => (f.roadmap_stage || "backlog") === stage.id);
            return (
              <div key={stage.id} className="w-72 shrink-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-xs font-medium text-white/70">{stage.label}</span>
                  </div>
                  <span className="text-[10px] text-white/30">{items.length}</span>
                </div>
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] rounded-xl border p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? "bg-indigo-500/5 border-indigo-500/30" : "bg-white/[0.02] border-white/5"}`}
                    >
                      {items.map((item, index) => {
                        const tMeta = getTypeMeta(item.type);
                        return (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                onClick={() => onSelect(item.id)}
                                className={`p-2.5 rounded-lg border bg-[#0d0d14] cursor-pointer transition-shadow ${snap.isDragging ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10" : "border-white/5 hover:border-white/15"}`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-sm shrink-0">{tMeta.icon}</span>
                                  <span className="text-xs text-white/80 leading-tight line-clamp-2">{item.title}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-white/30">
                                  <code>{item.feedback_id}</code>
                                  {item.votes > 0 && <span className="text-indigo-400">▲ {item.votes}</span>}
                                  {item.assigned_developer && <span>· @{item.assigned_developer}</span>}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {items.length === 0 && !provided.placeholderProps && (
                        <div className="text-center py-6 text-[10px] text-white/15">Drop here</div>
                      )}
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