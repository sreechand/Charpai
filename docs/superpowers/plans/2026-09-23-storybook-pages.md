# Storybook confirmation and unlisted pages

## Goal

Let users review generated storybook recommendations before applying them, publish accepted storybooks to unlisted public pages, list those pages in the signed-in profile area, and allow owners to delete/unpublish them.

## Steps

1. Add Convex storage for published storybook pages with authenticated owner mutations and a public slug query.
2. Change generation so returned draft/intake data is held as a pending recommendation until the user confirms or cancels.
3. On confirmation, save the run, apply the draft, and publish an unlisted page for the accepted draft.
4. Add a profile list for the user's pages with public links and delete actions.
5. Add `/s/[slug]` as a standalone public reader page that returns 404 for missing or deleted pages.
6. Run Convex codegen/typecheck and Next lint/build checks.
