import { mockProject } from "@/data/mock-project";
import type { HowlsyProject } from "@/types/project";

export type ProjectIntake = {
  goal: string;
  context: string;
  experience: string;
  constraints: string;
};

/**
 * Creates a temporary Howlsy project from the user's intake information.
 *
 * This function provides a single boundary between raw intake data and the
 * structured HowlsyProject model. The mock project supplies placeholder
 * planning data until AI-generated projects are introduced.
 */
export function createProjectFromIntake(
  intake: ProjectIntake
): HowlsyProject {
  const goal = intake.goal.trim() || mockProject.goal;

  return {
    ...mockProject,
    title: goal,
    goal,
    context: intake.context.trim(),
    experience: intake.experience.trim(),
    constraints: intake.constraints.trim(),
    updatedAt: new Date().toISOString(),
  };
}