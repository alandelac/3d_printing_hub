## Create the constitution ##
We have a 3D Printing Hub project, a place to manage filaments, prints, stock, and sells related to a 3d printing business

Look in README.md for input from stakeholders. Make a constitution in a specs directory:
- `mission.md`
- `tech-stack.md`
- `roadmap.md`should be based on the TODO.md for high-level implementation order, in very small phases of work

Interview me about the mission, target audience, tech stack gaps.

Important: You *must*use your AskUserQuestion tool, grouped on these 3, before writing to disk.

## Write the specs for a feature

Find the next phase on `specs/roadmap.md` and make a branch, ask me about the feature spec
create
- a new directory yyyy-mm-dd-feature-name under specs for this feature work
- in there:
    - `plan.md` as a series of numbered task groups
    - `requirement.md` for the scope, decisions, context
    - `validation.md` for how to know th eimplementation succeeded and can be merged

refer to `specs/mission.md` and `specs/tech-stack.md` for guidance

Important: you must use your askUserqQestion tool, grouped on these 3, before writing to disk

## run implemention

Implement the remaining task groups

## Update the CHANGELOG before merging

Run the `changelog` skill (`/changelog` in the Cline chat, or follow
`.cline/skills/changelog/SKILL.md`): group the branch's commits by author date into the
root `CHANGELOG.md`, one bullet per commit with its short SHA, review the generated
output, then validate the file with `test-changelog.ps1` before merging.
