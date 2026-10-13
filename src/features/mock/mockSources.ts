import { createMockPlanningDataSource } from '../decision-planning/planning.fixtures'
import { createMockStoreWorkspaceDataSource } from '../store-workspace/storeWorkspace.fixtures'
import { planningContextFixture, PLANNING_FIXTURE_IDS } from '../decision-planning/planning.fixtures'
import type { WireSavedDetail } from '../operations/operations.wire'
import type { PlanningRun, PlanningDataSource } from '../decision-planning/planning.types'
export const mockRuns=new Map<string,PlanningRun>()
export const mockWorkspaceSource=createMockStoreWorkspaceDataSource()
export const mockSavedRequirements=new Map<string,WireSavedDetail>()
for(const r of planningContextFixture().saved_requirements??[])mockSavedRequirements.set(PLANNING_FIXTURE_IDS.store+r.saved_requirement_id,{
  ...r,store_id:PLANNING_FIXTURE_IDS.store,version:'synthetic-saved/1',state:'active',created_at:r.updated_at,created_by_user_id:'d1000000-0000-4000-8000-000000000001',updated_by_user_id:'d1000000-0000-4000-8000-000000000001',default_reference:null,
})
const source=createMockPlanningDataSource({
  async context(s,signal){const b=await mockWorkspaceSource.planningContext(s,signal);return {...b,data:{...b.data,saved_requirements:[...mockSavedRequirements.values()].filter(r=>r.store_id===s&&r.state==='active').map(r=>({saved_requirement_id:r.saved_requirement_id,name:r.name,updated_at:r.updated_at,requirements:structuredClone(r.requirements),validation:r.validation,warnings:r.warnings}))}}},
  saved(s,id){return mockSavedRequirements.get(s+id)},
})
export const mockPlanningSource:PlanningDataSource={...source,
  async read(s,id,signal){const r=await source.read(s,id,signal);mockRuns.set(id,structuredClone(r.data));return r},
}
