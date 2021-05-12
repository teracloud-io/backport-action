/**
 * Github module
 *
 * Used to isolate the boundary between the code of this project and the github
 * actions api. Handy during testing, because we can easily mock this module's
 * functions. Properties are harder to mock, so this module just offers
 * functions to retrieve those properties.
 */

import * as github from "@actions/github";
import { PullsGetResponseData } from "@octokit/types";

export type PullRequest = PullsGetResponseData;
export type CreatePullRequestResponse = {
  status: number;
  data: {
    number: number;
    requested_reviewers?: { login: string }[];
  };
};
export type RequestReviewersResponse = CreatePullRequestResponse;

export function getRepo() {
  return github.context.repo;
}

export function getPayload() {
  return github.context.payload;
}

export function getPullNumber(): number {
  if (github.context.payload.pull_request) {
    return github.context.payload.pull_request.number;
  }

  // if the pr is not part of the payload
  // the number can be taken from the issue
  return github.context.issue.number;
}

export async function createComment(comment: Comment, token: string) {
  console.log(`Create comment: ${comment.body}`);
  return github.getOctokit(token).issues.createComment(comment);
}

export async function getPullRequest(
  pull_number: number,
  token: string
): Promise<PullRequest> {
  console.log(`Retrieve pull request data for #${pull_number}`);
  return github
    .getOctokit(token)
    .pulls.get({
      ...getRepo(),
      pull_number,
    })
    .then((response) => response.data);
}

export async function isMerged(
  pull: PullRequest,
  token: string
): Promise<boolean> {
  console.log(`Check whether pull request ${pull.number} is merged`);
  return github
    .getOctokit(token)
    .pulls.checkIfMerged({ ...getRepo(), pull_number: pull.number })
    .then((response) => {
      switch (response.status) {
        case 204:
          return true;
        case 404:
          return false;
        default:
          throw new Error(`Unexpected response status: ${response.status}`);
      }
    })
    .catch((error) => {
      if (error?.status == 404) return false;
      else throw error;
    });
}

export async function createPR(
  pr: PR,
  token: string
): Promise<CreatePullRequestResponse> {
  console.log(`Create PR: ${pr.body}`);
  return github.getOctokit(token).pulls.create(pr);
}

export async function requestReviewers(
  request: ReviewRequest,
  token: string
): Promise<RequestReviewersResponse> {
  console.log(`Request reviewers: ${request.reviewers}`);
  return github.getOctokit(token).pulls.requestReviewers(request);
}

type Comment = {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
};

type PR = {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
  maintainer_can_modify: boolean;
};

type ReviewRequest = {
  owner: string;
  repo: string;
  pull_number: number;
  reviewers: string[];
};
