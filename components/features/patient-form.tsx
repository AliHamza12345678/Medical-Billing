'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/features/file-upload';
import { insuranceProviders } from '@/data/insurance';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'Valid ZIP required'),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  notes: z.string().optional(),
  insurance: z
    .array(
      z.object({
        provider: z.string().min(1, 'Required'),
        memberId: z.string().min(1, 'Required'),
        groupNumber: z.string().min(1, 'Required'),
        planName: z.string().min(1, 'Required'),
        priority: z.enum(['Primary', 'Secondary', 'Tertiary']),
        copay: z.coerce.number().min(0),
        deductible: z.coerce.number().min(0),
        coveragePercent: z.coerce.number().min(0).max(100),
        effectiveDate: z.string().min(1, 'Required'),
        expiryDate: z.string().min(1, 'Required'),
      })
    )
    .min(1, 'At least one insurance plan is required'),
});

type FormValues = z.infer<typeof schema>;

interface PatientFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function PatientForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save Patient' }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      insurance: [
        {
          provider: '',
          memberId: '',
          groupNumber: '',
          planName: '',
          priority: 'Primary',
          copay: 0,
          deductible: 0,
          coveragePercent: 80,
          effectiveDate: '',
          expiryDate: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'insurance' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Basic demographic details about the patient</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First Name" error={errors.firstName?.message}>
            <Input {...register('firstName')} placeholder="John" />
          </Field>
          <Field label="Last Name" error={errors.lastName?.message}>
            <Input {...register('lastName')} placeholder="Smith" />
          </Field>
          <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
            <Input type="date" {...register('dateOfBirth')} />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="(555) 123-4567" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="john@email.com" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
          <CardDescription>Where the patient resides</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-4">
            <Field label="Street Address" error={errors.address?.message}>
              <Input {...register('address')} placeholder="123 Main St" />
            </Field>
          </div>
          <Field label="City" error={errors.city?.message}>
            <Input {...register('city')} placeholder="Boston" />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <Input {...register('state')} placeholder="MA" />
          </Field>
          <Field label="ZIP Code" error={errors.zip?.message}>
            <Input {...register('zip')} placeholder="02101" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Insurance Information
            </CardTitle>
            <CardDescription>Add one or more insurance plans</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                provider: '',
                memberId: '',
                groupNumber: '',
                planName: '',
                priority: 'Secondary',
                copay: 0,
                deductible: 0,
                coveragePercent: 70,
                effectiveDate: '',
                expiryDate: '',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Plan
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, idx) => (
            <div key={field.id} className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                    {idx + 1}
                  </span>
                  Insurance Plan {idx + 1}
                </h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Provider" error={errors.insurance?.[idx]?.provider?.message}>
                  <Controller
                    control={control}
                    name={`insurance.${idx}.provider`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {insuranceProviders.map((p) => (
                            <SelectItem key={p.id} value={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Member ID" error={errors.insurance?.[idx]?.memberId?.message}>
                  <Input {...register(`insurance.${idx}.memberId`)} placeholder="ABC123456" />
                </Field>
                <Field label="Group Number" error={errors.insurance?.[idx]?.groupNumber?.message}>
                  <Input {...register(`insurance.${idx}.groupNumber`)} placeholder="GRP-00123" />
                </Field>
                <Field label="Plan Name" error={errors.insurance?.[idx]?.planName?.message}>
                  <Input {...register(`insurance.${idx}.planName`)} placeholder="PPO Preferred" />
                </Field>
                <Field label="Priority" error={errors.insurance?.[idx]?.priority?.message}>
                  <Controller
                    control={control}
                    name={`insurance.${idx}.priority`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Secondary">Secondary</SelectItem>
                          <SelectItem value="Tertiary">Tertiary</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Copay ($)" error={errors.insurance?.[idx]?.copay?.message}>
                  <Input type="number" {...register(`insurance.${idx}.copay`)} placeholder="25" />
                </Field>
                <Field label="Deductible ($)" error={errors.insurance?.[idx]?.deductible?.message}>
                  <Input type="number" {...register(`insurance.${idx}.deductible`)} placeholder="1500" />
                </Field>
                <Field label="Coverage %" error={errors.insurance?.[idx]?.coveragePercent?.message}>
                  <Input type="number" {...register(`insurance.${idx}.coveragePercent`)} placeholder="80" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Effective">
                    <Input type="date" {...register(`insurance.${idx}.effectiveDate`)} />
                  </Field>
                  <Field label="Expiry">
                    <Input type="date" {...register(`insurance.${idx}.expiryDate`)} />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
          <CardDescription>Upload insurance cards, ID, or referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload hint="Insurance card, ID, referral letter — PDF, PNG, JPG up to 10MB" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea {...register('notes')} placeholder="Any additional notes about this patient..." rows={3} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
