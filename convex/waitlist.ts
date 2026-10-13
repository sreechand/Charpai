import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const add = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    note: v.optional(v.string()),
    phone: v.optional(v.string())
  },
  returns: v.id("waitlist"),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const phone = args.phone?.trim() || undefined;
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError("Enter a valid email address.");
    }
    if (phone && (phone.length > 40 || !/^\+?[\d\s().-]+$/.test(phone) || !/^[\d]{7,15}$/.test(phone.replace(/\D/g, "")))) {
      throw new ConvexError("Enter a phone number with 7–15 digits, including the country code.");
    }
    if (args.name.length > 120 || (args.note?.length || 0) > 1000) throw new ConvexError("Your entry is too long.");
    const existing = await ctx.db.query("waitlist").withIndex("by_email", q => q.eq("email", email)).first();
    // Do not let an anonymous duplicate overwrite someone's contact details.
    if (existing) return existing._id;
    return await ctx.db.insert("waitlist", {
      ...args,
      email,
      phone,
      consentAt: Date.now(),
      createdAt: Date.now()
    });
  }
});
