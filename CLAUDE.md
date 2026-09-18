# CLAUDE.md

This app runs on Thinkube. Its Gitea repository is
`thinkube-deployments/<app>`, where `<app>` is the name of the folder this
file is in. The push to that repository is the deploy.

## Change the app

1. Edit the code in `~/apps/<app>`, the checkout that Thinkube IDE opens.
2. Run the tests in `backend/`, with the database login loaded first:

   ```bash
   set -a; . ~/.env; set +a; export ADMIN_USERNAME=tkadmin
   cd ~/apps/<app>/backend
   ./run_tests.sh              # every test
   ./run_tests.sh <file>       # one test file
   ```

   Without the login, every database test fails with
   `fe_sendauth: no password supplied`.
3. Commit, then pull and push:

   ```bash
   git add <files>
   git commit -m "<what changed>"
   git pull --rebase
   git push
   ```

   `git pull --rebase` is needed because every build commits
   "build: automatic update of <app> to <tag>" to main after it deploys.
4. The push is the deploy. It runs the tests, builds the images and rolls
   them out. No other command is needed. To see whether the push is live,
   call the thinkube-control MCP tool `get_commit_rollout` with the app name
   and the commit.

## Never redeploy to ship code

- Do not call `redeploy_template` or `deploy_template` to ship code changes.
- `redeploy_template` resets this checkout to Gitea's main
  (`git reset --hard`), copies the template over it with
  `copier copy --force`, and regenerates `k8s/`.
- Redeploy only after changing `thinkube.yaml`, and only when the checkout
  is clean and every commit is pushed. It refuses a checkout with
  uncommitted changes or unpushed commits.

## Work inside the backend pod does not last

Anything you run inside the app's backend pod, such as a script started with
`kubectl exec`, stops at the next push: the push replaces the pod.
