# Security Specification — APAAR SmartVerify AI

## 1. Data Invariants

- **Identity Invariant**: Only authenticated users can write records. A student record's `submittedBy` field must match `request.auth.uid`.
- **RBAC Hierarchy**:
  - `admin`: Full authority to view, verify, flag, and delete student records across all institutions, and view audit trails.
  - `institution`: Allowed to create students and update records they submitted or belong to their institution; cannot alter audit logs or assign admin status.
  - `student`: Can only read their own verified record.
- **Audit Immobility**: Audit logs are strictly append-only (`create` allowed for active operations, `update` and `delete` forbidden).
- **ID & Boundary Protection**: Document IDs must be alphanumeric strings <= 128 characters (`isValidId`). String fields must be length-bounded. APAAR IDs must be exactly 12 digits.
- **Terminal State Guarding**: Immutable creation timestamps (`createdAt` cannot be modified on update).

## 2. The "Dirty Dozen" Threat Payloads

1. **Unauthenticated Student Injection**: Write to `/students/s1` with `request.auth == null`.
2. **Identity Spoofing**: User `attacker_uid` submits student record with `submittedBy: "victim_uid"`.
3. **Invalid APAAR Format**: Submitting `apaarId: "not-a-number"` or 5-digit number to bypass 12-digit requirement.
4. **Denial of Wallet String Injection**: Submitting 100KB string into `name` or `program`.
5. **Path Traversal / Malformed Doc ID**: Writing with ID `../../../etc/passwd` or 1KB junk characters.
6. **Self-Promotion to Admin**: Non-admin user writing directly to `/admins/{their_uid}`.
7. **Privilege Escalation in Profile**: Updating user profile with `role: "admin"` when user is `institution`.
8. **Audit Trail Tampering**: Modifying or overwriting an existing document in `/audit_logs/{id}`.
9. **Audit Trail Deletion**: Deleting an audit log entry in `/audit_logs/{id}`.
10. **Cross-Tenant Modification**: Institution user attempting to update a student submitted by another institution.
11. **Timestamp Manipulation**: Modifying `createdAt` during an update.
12. **Blanket Query Scraping**: Anonymous client querying collection `/students` without authentication.

## 3. Test Runner

Verified via rule structure and authorization predicates in `firestore.rules`.
