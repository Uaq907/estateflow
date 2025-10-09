

import { z } from "zod";
import type { Permission } from "./permissions";

export const ownerSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name is required."),
    contact: z.string().optional().nullable(),
    email: z.preprocess(
      (val) => (val === "" ? null : val),
      z.string().email().optional().nullable()
    ),
    nationality: z.string().optional().nullable(),
    emiratesId: z.string().optional().nullable(),
    emiratesIdUrl: z.string().optional().nullable(),
    taxNumber: z.string().optional().nullable(),
});

export type Owner = z.infer<typeof ownerSchema>;

export const notificationPreferencesSchema = z.object({
  new_expense_submitted: z.boolean().default(true),
  expense_approved: z.boolean().default(true),
  expense_rejected: z.boolean().default(true),
  lease_expiring: z.boolean().default(true),
  lease_expiring_days: z.coerce.number().default(90),
  contract_expiring: z.boolean().default(true),
  contract_expiring_days: z.coerce.number().default(90),
  payment_due: z.boolean().default(true),
  payment_due_days: z.coerce.number().default(7),
  cheque_due: z.boolean().default(true),
  cheque_due_days: z.coerce.number().default(7),
  contract_renewal: z.boolean().default(true),
  contract_renewal_days: z.coerce.number().default(60),
}).default({});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;


export const employeeSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").optional().nullable(),
  position: z.string().min(2, "Position is required."),
  department: z.string().min(2, "Department is required."),
  startDate: z.coerce.date({ required_error: "A start date is required."}),
  phone: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  emiratesId: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  allowLogin: z.coerce.boolean().default(true),
  dateOfBirth: z.coerce.date().optional().nullable(),
  status: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  salary: z.coerce.number().optional().nullable(),
  visaNumber: z.string().optional().nullable(),
  visaExpiryDate: z.coerce.date().optional().nullable(),
  insuranceNumber: z.string().optional().nullable(),
  insuranceExpiryDate: z.coerce.date().optional().nullable(),
  telegramBotToken: z.string().optional().nullable(),
  telegramChannelId: z.string().optional().nullable(),
  enableEmailAlerts: z.coerce.boolean().default(false),
  profilePictureUrl: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional().nullable().transform(val => val ?? []),
  notificationPreferences: notificationPreferencesSchema.optional().nullable(),
  preferredLanguage: z.enum(['ar', 'en']).default('ar').optional().nullable(),
  // New salary fields
  basicSalary: z.coerce.number().optional().nullable(),
  housingAllowance: z.coerce.number().optional().nullable(),
  transportAllowance: z.coerce.number().optional().nullable(),
  otherAllowance: z.coerce.number().optional().nullable(),
  // For permission checks
  assignedPropertyIds: z.array(z.string()).optional().nullable(),
});

export type Employee = z.infer<typeof employeeSchema>;


export const propertySchema = z.object({
    id: z.string(),
    name: z.string().min(3, "Property name is required.").optional().nullable(),
    type: z.string().min(3, "Property type is required."),
    location: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    purpose: z.string().optional().nullable(),
    price: z.coerce.number().optional().nullable(),
    size: z.coerce.number().optional().nullable(),
    sizeUnit: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    dateListed: z.coerce.date().optional().nullable(),
    floors: z.coerce.number().optional().nullable(),
    rooms: z.coerce.number().optional().nullable(),
    configuration: z.string().optional().nullable(),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    ownerId: z.string().optional().nullable(),
    managerId: z.string().optional().nullable(),
    accountNumber: z.string().optional().nullable(),
    // For display purposes
    totalUnits: z.coerce.number().optional().nullable(),
    occupiedUnits: z.coerce.number().optional().nullable(),
    availableUnits: z.coerce.number().optional().nullable(),
    ownerName: z.string().optional().nullable(),
    leasesWithoutContract: z.coerce.number().optional().nullable(),
});

export type Property = z.infer<typeof propertySchema>;

export const propertyDocumentSchema = z.object({
    id: z.string(),
    propertyId: z.string(),
    documentName: z.string(),
    documentUrl: z.string(),
    createdAt: z.coerce.date(),
});

export type PropertyDocument = z.infer<typeof propertyDocumentSchema>;


export const tenantSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name is required."),
    email: z.string().email("A valid email is required."),
    password: z.string().min(8, "Password must be at least 8 characters.").optional().nullable(),
    phone: z.string().optional().nullable(),
    idNumber: z.string().optional().nullable(),
    idType: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    idDocumentUrl: z.string().optional().nullable(),
    allowLogin: z.coerce.boolean().default(false),
});

export type Tenant = z.infer<typeof tenantSchema>;

export const leaseSchema = z.object({
    id: z.string(),
    unitId: z.string(),
    tenantId: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(['Active', 'Completed', 'Cancelled', 'Completed with Dues', 'Cancelled with Dues']),
    // Expanded fields
    tenantSince: z.coerce.date().optional().nullable(),
    totalLeaseAmount: z.coerce.number().optional().nullable(),
    taxedAmount: z.coerce.number().optional().nullable(),
    rentPaymentAmount: z.coerce.number().optional().nullable(),
    numberOfPayments: z.coerce.number().int().optional().nullable(),
    renewalIncreasePercentage: z.coerce.number().optional().nullable(),
    contractUrl: z.string().optional().nullable(),
    guaranteeChequeAmount: z.coerce.number().optional().nullable(),
    guaranteeChequeUrl: z.string().optional().nullable(),
    // Commercial fields
    businessName: z.string().optional().nullable(),
    businessType: z.string().optional().nullable(),
    tradeLicenseNumber: z.string().optional().nullable(),
    tradeLicenseUrl: z.string().optional().nullable(),
    // Added for display
    totalPaidAmount: z.coerce.number().optional().nullable(),
    missingAttachmentsCount: z.coerce.number().optional().nullable(),
    paymentsCount: z.coerce.number().optional().nullable(),
});

export type Lease = z.infer<typeof leaseSchema>;


export const unitSchema = z.object({
    id: z.string(),
    propertyId: z.string(),
    unitNumber: z.string().min(1, "Unit number is required."),
    type: z.string().min(3, "Unit type is required."),
    status: z.string(),
    size: z.coerce.number().optional().nullable(),
    sizeUnit: z.string().optional().nullable(),
    price: z.coerce.number().optional().nullable(),
    description: z.string().optional().nullable(),
    floor: z.coerce.number().optional().nullable(),
    accountNumber: z.string().optional().nullable(),
    configuration: z.string().optional().nullable(),
    tenantName: z.string().optional().nullable(), // For display purposes
    businessName: z.string().optional().nullable(), // For display purposes
    leaseEndDate: z.coerce.date().optional().nullable(), // For display
    activeLeaseId: z.string().optional().nullable(), // For removing tenant
    contractUrl: z.string().optional().nullable(), // For checking if contract is attached
    nextPaymentDueDate: z.coerce.date().optional().nullable(),
    hasPendingExtension: z.coerce.boolean().optional().nullable(),
});

export type Unit = z.infer<typeof unitSchema>;

export const paymentTransactionSchema = z.object({
    id: z.string(),
    leasePaymentId: z.string(),
    amountPaid: z.coerce.number(),
    paymentDate: z.coerce.date(),
    paymentMethod: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    documentUrl: z.string().optional().nullable(),
});

export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;


export const leasePaymentSchema = z.object({
    id: z.string(),
    leaseId: z.string(),
    dueDate: z.coerce.date(),
    amount: z.coerce.number(),
    status: z.string(),
    paymentMethod: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    chequeNumber: z.string().optional().nullable(),
    chequeImageUrl: z.string().optional().nullable(),
    transactions: z.array(paymentTransactionSchema).optional().default([]),
    // For display in dashboard insights
    tenantName: z.string().optional().nullable(),
    propertyName: z.string().optional().nullable(),
    unitNumber: z.string().optional().nullable(),
    unitType: z.string().optional().nullable(),
    businessName: z.string().optional().nullable(),
    // For payment extensions
    extensionRequested: z.coerce.boolean().optional().nullable(),
    requestedDueDate: z.coerce.date().optional().nullable(),
    extensionStatus: z.enum(['Pending', 'Approved', 'Rejected']).optional().nullable(),
    extensionReason: z.string().optional().nullable(),
    managerNotes: z.string().optional().nullable(),
});

export type LeasePayment = z.infer<typeof leasePaymentSchema>;


// Used for the Lease Detail page to join data
export type LeaseWithDetails = {
    lease: Lease;
    tenant: Tenant;
    unit: Unit;
    property: Property;
};


export const expenseSchema = z.object({
    id: z.string(),
    propertyId: z.string(),
    unitId: z.string().optional().nullable(),
    employeeId: z.string(),
    managerId: z.string().optional().nullable(),
    amount: z.coerce.number(),
    category: z.string().min(1, "Category is required."),
    supplier: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Needs Correction']),
    receiptUrl: z.string().optional().nullable(),
    managerNotes: z.string().optional().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    taxNumber: z.string().optional().nullable(),
    isVat: z.coerce.boolean().optional().nullable(),
    baseAmount: z.coerce.number().optional().nullable(),
    taxAmount: z.coerce.number().optional().nullable(),
    isRecurring: z.coerce.boolean().optional().nullable(),
    recurrenceType: z.enum(['Monthly', 'Quarterly', 'Annually']).optional().nullable(),
    recurrenceEndDate: z.coerce.date().optional().nullable(),
    // For display purposes
    propertyName: z.string().optional(),
    unitNumber: z.string().optional().nullable(),
    employeeName: z.string().optional(),
    managerName: z.string().optional().nullable(),
});

export type Expense = z.infer<typeof expenseSchema>;

export const maintenanceContractSchema = z.object({
    id: z.string(),
    propertyId: z.string(),
    serviceType: z.string().min(1, "Service type is required."),
    vendorName: z.string().min(1, "Vendor name is required."),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    contractAmount: z.coerce.number(),
    paymentSchedule: z.enum(['Monthly', 'Quarterly', 'Annually', 'One-time']),
    nextDueDate: z.coerce.date().optional().nullable(),
    contractUrl: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    isVat: z.coerce.boolean().optional().nullable(),
    baseAmount: z.coerce.number().optional().nullable(),
    taxAmount: z.coerce.number().optional().nullable(),
    // For display
    propertyName: z.string().optional(),
});

export type MaintenanceContract = z.infer<typeof maintenanceContractSchema>;

export const assetSchema = z.object({
    id: z.string(),
    propertyId: z.string(),
    unitId: z.string().optional().nullable(),
    name: z.string().min(1, "Asset name is required."),
    category: z.string().optional().nullable(),
    manufacturer: z.string().optional().nullable(),
    modelNumber: z.string().optional().nullable(),
    serialNumber: z.string().optional().nullable(),
    status: z.enum(['In Service', 'Under Repair', 'Decommissioned', 'In Storage']),
    purchaseDate: z.coerce.date().optional().nullable(),
    purchasePrice: z.coerce.number().optional().nullable(),
    warrantyExpiryDate: z.coerce.date().optional().nullable(),
    locationInProperty: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    invoiceUrl: z.string().optional().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    // For display
    propertyName: z.string().optional(),
    unitNumber: z.string().optional().nullable(),
});

export type Asset = z.infer<typeof assetSchema>;

export const payeeSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Payee name is required."),
    contactPerson: z.string().optional().nullable(),
    contactEmail: z.preprocess(
      (val) => (val === "" ? null : val),
      z.string().email().optional().nullable()
    ),
    notes: z.string().optional().nullable(),
});

export type Payee = z.infer<typeof payeeSchema>;

export const bankSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Bank name is required."),
    branch: z.string().optional().nullable(),
    accountNumber: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type Bank = z.infer<typeof bankSchema>;

export const chequeTransactionSchema = z.object({
    id: z.string(),
    chequeId: z.string(),
    amountPaid: z.coerce.number(),
    paymentDate: z.coerce.date(),
    paymentMethod: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    documentUrl: z.string().optional().nullable(),
});

export type ChequeTransaction = z.infer<typeof chequeTransactionSchema>;


export const chequeSchema = z.object({
    id: z.string(),
    payeeType: z.enum(['saved', 'tenant', 'manual']),
    payeeId: z.string().optional().nullable(),
    tenantId: z.string().optional().nullable(),
    manualPayeeName: z.string().optional().nullable(),
    bankId: z.string().min(1, "Bank is required."),
    chequeNumber: z.string().optional().nullable(),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
    chequeDate: z.coerce.date().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    status: z.enum(['Submitted', 'Pending', 'Partially Paid', 'Cleared', 'Bounced', 'Cancelled']).optional().nullable().default('Pending').transform(val => val || 'Pending'),
    description: z.string().optional().nullable(),
    chequeImageUrl: z.string().optional().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    // For display & transactions
    savedPayeeName: z.string().optional().nullable(),
    tenantName: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    transactions: z.array(chequeTransactionSchema).optional().default([]),
    totalPaidAmount: z.coerce.number().optional().nullable(),
    createdById: z.string().optional().nullable(),
    createdByName: z.string().optional().nullable(),
});

export type Cheque = z.infer<typeof chequeSchema>;

export const unitConfigurationSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required."),
    type: z.string().min(1, "Type is required."),
});

export type UnitConfiguration = z.infer<typeof unitConfigurationSchema>;

export const calendarEventSchema = z.object({
    id: z.string(),
    date: z.coerce.date(),
    title: z.string(),
    type: z.enum(['lease', 'payment', 'maintenance', 'cheque', 'expense']),
    link: z.string(),
    details: z.string().optional().nullable(),
});

export type CalendarEvent = z.infer<typeof calendarEventSchema>;

export const activityLogSchema = z.object({
  id: z.string(),
  timestamp: z.coerce.date(),
  employeeId: z.string().optional().nullable(),
  employeeName: z.string().optional().nullable(),
  action: z.string(),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
});

export type ActivityLog = z.infer<typeof activityLogSchema>;

export const pushSubscriptionSchema = z.object({
  employeeId: z.string(),
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
});

export type PushSubscription = z.infer<typeof pushSubscriptionSchema>;

export const evictionRequestSchema = z.object({
  id: z.string(),
  tenantId: z.string().optional().nullable(),
  tenantName: z.string().min(2, "Tenant name is required."),
  propertyName: z.string().min(2, "Property name is required."),
  unitNumber: z.string().min(1, "Unit number is required."),
  reason: z.string().min(2, "Reason is required."),
  description: z.string().optional().nullable(),
  dueAmount: z.coerce.number().default(0),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  submittedDate: z.coerce.date(),
  createdById: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type EvictionRequest = z.infer<typeof evictionRequestSchema>;

export const purchaseRequestSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string().optional().nullable(),
  title: z.string().min(3, "Title is required."),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  estimatedAmount: z.coerce.number().min(0, "Amount must be positive."),
  propertyId: z.string().optional().nullable(),
  propertyName: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']).default('Pending'),
  approvedBy: z.string().optional().nullable(),
  approvedByName: z.string().optional().nullable(),
  approvedAt: z.coerce.date().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;
