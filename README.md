# RENIT Tournament — starter

This package is a working **front-end demo** for the RENIT Tournament idea.

## What works now
- Home/game categories
- Match list and match details
- Join a match
- Demo wallet stored in browser localStorage
- Profile + joined matches
- Results placeholder
- Demo admin modal that can create matches
- Responsive mobile UI

## Important
This is NOT yet a real multi-user production tournament backend. The demo stores data in the current browser only.

## To make it truly live
Connect the same UI to Supabase (or another backend) for:
- authentication
- users
- tournaments
- registrations
- wallet ledger
- deposits/withdrawals
- room ID/password
- results
- admin roles
- realtime updates
- server-side validation

Do not put payment secrets or admin service-role keys in browser JavaScript.
