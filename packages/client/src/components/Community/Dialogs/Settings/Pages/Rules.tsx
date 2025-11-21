import CreateRule from "@/components/Dialogs/Rule/Create";
import Loading from "@/components/Loading/Loading";
import { useCommunityRules } from "@/utils/api/community"
import { Pencil, Trash } from "lucide-react";
import { useParams } from "react-router-dom"
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { deleteCommunityRule, updateCommunityRulePriorities } from "@/utils/api/rules";
import { useQueryClient } from "@tanstack/react-query";
import EditRule from "@/components/Dialogs/Rule/Edit";
import type { Rule } from "@/types/rule";
export default function RulesPage() {
    const { name } = useParams();
    const rules = useCommunityRules(name!)
    const qc = useQueryClient();
    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || result.destination.index == result.source.index || !rules.data || !name) return;
        const reorder = Array.from(rules.data);
        const [moved] = reorder.splice(result.source.index, 1);
        reorder.splice(result.destination.index, 0, moved)
        const update = reorder.map((rule, i) => ({
            ...rule,
            priority: reorder.length - i - 1
        }))
        const r = await updateCommunityRulePriorities(name, update.map((r) => (r.id)).reverse())
        if (r.status == 200) qc.setQueryData(["communities", name, "rules"], () => update)
    }

    const del = async (ruleId: string) => {
        const r = await deleteCommunityRule(name!, ruleId);
        if (r.status == 200) qc.setQueryData(["communities", name, "rules"], (old: Rule[]) => ([...old.filter(x => x.id != ruleId)]))
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-col">
                {rules.isLoading && <Loading />}
                {(!rules.isLoading && Array.isArray(rules.data)) && (
                    <div className="space-y-4">
                        <div className="flex my-4 justify-between">
                            <h1 className="text-2xl font-bold">Rules</h1>

                            <CreateRule>
                                <div className="px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-1 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                    Add rule
                                </div>
                            </CreateRule>
                        </div>
                        <div className="flex flex-col gap-2">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="rules">
                                    {(provided) => (
                                        <div {...provided.droppableProps} className="flex flex-col gap-2" ref={provided.innerRef}>
                                            {rules.data?.sort((a, b) => b.priority - a.priority).map((rule, i) => (
                                                <Draggable index={i} key={`${rule.id}-drag`} draggableId={rule.id}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}
                                                            className="p-2 px-4 bg-[#3d3d3d] rounded-lg w-full justify-between flex items-center">
                                                            <div className="flex items-start gap-4">
                                                                <p className="text-white/50 text-lg">{i + 1}.</p>
                                                                <div className="flex flex-col">
                                                                    <h1>{rule.title}</h1>
                                                                    <p className="text-white/50">{rule.content}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <EditRule rule={rule}>
                                                                    <Pencil className="w-4 cursor-pointer" />
                                                                </EditRule>
                                                                <Trash className="w-4 cursor-pointer text-red-400" onClick={() => del(rule.id)} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}