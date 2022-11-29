import * as core from "@actions/core";
import { Backport } from "./backport";
import { Github } from "./github";

/**
 * Called from the action.yml.
 *
 * Is separated from backport for testing purposes
 */
async function run(): Promise<void> {
  const token = core.getInput("github_token", { required: true });
  const pwd = core.getInput("github_workspace", { required: true });
  const pattern = new RegExp(core.getInput("label_pattern"));
  const branch_pattern = new RegExp(core.getInput("branch_pattern"))
  const backport_branches = core.getInput("backport_branches").split("\n").filter(x => x !== "")
  const description = core.getInput("pull_description");
  const title = core.getInput("pull_title");

  const github = new Github(token);
  const backport = new Backport(github, {
    pwd,
    labels: { pattern },
    backport_branches,
    branch_pattern,
    pull: { description, title },
  });

  return backport.run();
}

// this would be executed on import in a test file
run();
