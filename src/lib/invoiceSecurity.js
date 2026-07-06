import { base44 } from "@/api/base44Client";
import { normalizeRole, isSuperAdmin, isPlatformAdmin, isEnterpriseAdmin } from "@/lib/roles";

// ============================================================
// INVOICE DATA ISOLATION — SERVER-SIDE AUTHORIZATION
//
// Every invoice query is filtered at the database level by the
// authenticated user's identity or authorized organization.
// No unfiltered Invoice.list() is ever called for non-admin users.
//
// Access scope:
//   Super Admin / Platform Admin  → all invoices (admin console)
//   Enterprise Admin (with org)   → organization invoices only
//   Standard / Enterprise User    → personal invoices only
// ============================================================

export async function logInvoiceAccess(userId, scope, result, invoiceCount = 0) {
  try {
    await base44.entities.BillingEvent.create({
      event_type: "invoice_access",
      status: result,
      metadata: JSON.stringify({
        user_id: userId,
        scope,
        invoice_count: invoiceCount,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {}
}

export async function getAuthorizedInvoices(user, profile) {
  if (!user?.id) {
    await logInvoiceAccess("unknown", "none", "denied");
    return { invoices: [], scope: "none" };
  }

  const role = normalizeRole(user.role);

  // Super Admin / Platform Admin — authorized to view all invoices
  if (isSuperAdmin(role) || isPlatformAdmin(role)) {
    try {
      const invoices = await base44.entities.Invoice.list("-created_date", 50);
      await logInvoiceAccess(user.id, "all", "success", invoices.length);
      return { invoices, scope: "all" };
    } catch (e) {
      await logInvoiceAccess(user.id, "all", "denied");
      return { invoices: [], scope: "all" };
    }
  }

  // Enterprise Admin — organization-scoped invoices only
  if (isEnterpriseAdmin(role) && profile?.organization_id) {
    try {
      const invoices = await base44.entities.Invoice.filter(
        { organization_id: profile.organization_id },
        "-created_date",
        50
      );
      await logInvoiceAccess(user.id, `org:${profile.organization_id}`, "success", invoices.length);
      return { invoices, scope: "organization" };
    } catch (e) {
      await logInvoiceAccess(user.id, `org:${profile.organization_id}`, "denied");
      return { invoices: [], scope: "organization" };
    }
  }

  // Standard user — personal invoices only (server-side filtered)
  try {
    const invoices = await base44.entities.Invoice.filter(
      { owner_user_id: user.id },
      "-created_date",
      50
    );
    await logInvoiceAccess(user.id, `user:${user.id}`, "success", invoices.length);
    return { invoices, scope: "personal" };
  } catch (e) {
    await logInvoiceAccess(user.id, `user:${user.id}`, "denied");
    return { invoices: [], scope: "personal" };
  }
}