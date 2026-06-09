# Security Specification - Paisa Saathi

This specification defines the security invariants and payload-level verification tests for the Paisa Saathi application.

## Full-Stack Proxy Architecture Security Model
Paisa Saathi follows a secure full-stack architecture where the React client interacts only with the Node Express backend APIs (`/api/*`). The Firestore database credentials are kept private on the server (`firebase-applet-config.json`) and are never exposed to the public browser client.

Since the server behaves as a trusted system proxy, it submits requests on behalf of multiple users. The Firestore Security Rules are structured as a second layer of defense, enforcing strict schema validity, type consistency, ID restrictions, string/array length bounds, and timestamp safety on every operation.

---

## Data Invariants

### 1. Users (`/users/{userId}`)
- User document IDs must match the `userId` field.
- `mobile_number` is required, must be a string, and cannot exceed 20 characters.
- `monthly_income`, `financial_score`, `savings_target`, etc., must be non-negative numbers.

### 2. Expenses (`/expenses/{expenseId}`)
- `user_id`, `amount`, and `category` are required.
- `amount` must be a positive number.
- `category` cannot exceed 100 characters.

### 3. Goals (`/goals/{goalId}`)
- `user_id`, `title`, and `target_amount` are required.
- `target_amount` must be a positive number.
- `status` must be either `'Active'` or `'Completed'`.

### 4. Alerts (`/alerts/{alertId}`)
- `user_id` and `alert_title` are required.
- `alert_title` cannot exceed 200 characters.

### 5. Chat History (`/chat_history/{chatId}`)
- `user_id`, `user_message`, and `ai_response` are required.
- Is structurally read-only and immutable post-creation.

---

## The "Dirty Dozen" Malicious Payloads

The security rules are designed to prevent the following 12 hazardous client payloads or operations from being written to Firestore.

### 1. User Profile Ghost Field (Privilege Escalation)
Attempting to create or update a user profile with unauthorized access flags like `isAdmin: true` or `role: "admin"`.
**Check**: Denied by strict keys count and explicit property checks.

### 2. ID Poisoning Attack
Creating a record with a massive 1.5MB corrupted or toxic characters string as the document ID (e.g. overflow injection).
**Check**: Denied by `isValidId(id)` validation limiting ID string size and allowed character pattern.

### 3. Missing Required Fields on Expenses
Attempting to insert an expense document without the `amount` property.
**Check**: Denied by `incoming().keys().hasAll(['id', 'user_id', 'amount', 'category'])` assertion.

### 4. Shadow Field Injection / Denial of Wallet on Users
An update modifying or injecting infinite unknown array nodes into a User document.
**Check**: Denied by size matching checks on create and update property limitations.

### 5. Type-Spoofing Amount
Passing a boolean (`true`) or a massive nested map instead of a number for the expense `amount`.
**Check**: Denied by `incoming().amount is number`.

### 6. Negative Value Poisoning
Writing negative values for budgets or expenses transactions (e.g., `amount: -1000`).
**Check**: Denied by `incoming().amount >= 0` validator.

### 7. Underflow Goals Target
Writing a savings goal target of standard 0 or negative value to cause mathematical instability inside dashboards.
**Check**: Denied by `incoming().target_amount >= 0`.

### 8. Goal State Transition Shortcutting
Transitioning a Goal's state directly with arbitrary strings or bypassing verification limits.
**Check**: Denied by `incoming().status in ['Active', 'Completed']` rules.

### 9. PII Exposure on Alerts
Injecting raw PII data fields into System Security Alerts.
**Check**: Denied by strict schema keys validation on Alerts.

### 10. Chat History Alteration
Attempting to overwrite/modify past conversational logs with fake replies.
**Check**: Denied by marking chat logs as wholly immutable on update (`allow update: if false`).

### 11. String Size Denial-of-Wallet
Injecting a comment or a user name containing a 10MB structured text block to exhaust cloud Firestore query and transfer bandwidth.
**Check**: Denied by `.size() <= MAX` bounds checks on all strings.

### 12. Orphaned Records Violation
Writing expenses with empty identifiers or mismatching foreign reference states.
**Check**: Enforced using correct references and path checks.

---

## Test Runner Specification

All tests must be validated to confirm that raw client execution of any of the above "Dirty Dozen" or irregular payloads will result in a standard `PERMISSION_DENIED` error.
