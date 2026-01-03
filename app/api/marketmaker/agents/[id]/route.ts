import { type NextRequest, NextResponse } from "next/server"
import { agentsStore } from "@/lib/marketmaker-store"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!agentsStore.has(id)) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const agent = agentsStore.get(id)
    agent.status = status
    agentsStore.set(id, agent)

    console.log(`[v0] Updated agent ${id} status to ${status}`)
    return NextResponse.json(agent)
  } catch (error) {
    console.error("[v0] Error updating agent:", error)
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!agentsStore.has(id)) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    agentsStore.delete(id)
    console.log(`[v0] Deleted agent ${id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting agent:", error)
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
  }
}
