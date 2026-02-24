# Specification

## Summary
**Goal:** Restore a colorful earthy green and warm amber visual theme across all frontend pages of the Farmer EKYC app.

**Planned changes:**
- Update `frontend/src/index.css` to define vivid, saturated CSS custom property color tokens for deep earthy green (primary) and warm amber/golden (accent), replacing any muted or near-grey values.
- Update `frontend/tailwind.config.js` to extend the theme with these color tokens so utility classes (`bg-primary`, `text-accent`, `border-primary`, etc.) produce colorful results.
- Restyle the top navigation bar to use a rich earthy green background with contrasting amber or white text.
- Update primary action buttons across all pages to use saturated green or amber fill colors.
- Add visible colored borders or colored header bands to card containers using the green/amber palette.
- Render status badges (Pending, Approved, Rejected) in distinct vivid colors (amber, green, red).
- Apply green or amber accent colors to form field focus states and labels.
- Apply colorful backgrounds or colored icons to Manager Dashboard stat cards.
- Ensure visual consistency across all pages: AgentSignup, AgentLogin, AgentDashboard, SubmitFarmerEKYC, AcknowledgmentScreen, CheckApplicationStatus, ManagerLogin, ManagerDashboard, AgentApproval, FarmerApplicationApproval, and CreateAgentAccount.

**User-visible outcome:** All screens in the Farmer EKYC app display a rich, saturated earthy green and warm amber color scheme — buttons, headers, cards, badges, and form elements are all visually colorful and consistent, with no page appearing grey or monochrome.
