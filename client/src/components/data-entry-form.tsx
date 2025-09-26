import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const kpiFormSchema = z.object({
  department: z.string().min(1, 'Departman seçilmelidir'),
  value: z.string().min(1, 'Değer girilmelidir'),
  target: z.string().min(1, 'Hedef girilmelidir'),
  metadata: z.object({
    daysSinceIncident: z.number().optional(),
    defectRate: z.number().optional(),
    machineStatus: z.string().optional(),
    actualProduction: z.number().optional(),
    targetProduction: z.number().optional(),
  }).optional(),
});

type KpiFormData = z.infer<typeof kpiFormSchema>;

interface DataEntryFormProps {
  userDepartment: string;
  userName: string;
  onSuccess?: () => void;
}

export function DataEntryForm({ userDepartment, userName, onSuccess }: DataEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<KpiFormData>({
    resolver: zodResolver(kpiFormSchema),
    defaultValues: {
      department: userDepartment,
      value: '',
      target: '',
      metadata: {},
    },
  });

  const createKpiMutation = useMutation({
    mutationFn: async (data: KpiFormData) => {
      const percentage = ((parseFloat(data.value) / parseFloat(data.target)) * 100).toFixed(2);
      
      const response = await apiRequest('POST', '/api/kpi', {
        ...data,
        percentage,
        date: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kpi'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kpi/latest'] });
      toast({
        title: 'Başarılı',
        description: 'KPI verisi başarıyla güncellendi',
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'KPI verisi güncellenirken hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: KpiFormData) => {
    setIsSubmitting(true);
    try {
      await createKpiMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentLabels = {
    Safety: 'Çalışan',
    Quality: 'Kalite',
    Production: 'Maliyet',
    Logistics: 'Teslimatistik',
  };

  const getDepartmentFields = () => {
    switch (userDepartment) {
      case 'Safety':
        return (
          <FormField
            control={form.control}
            name="metadata.daysSinceIncident"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kazasız Gün Sayısı</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-days-since-incident"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'Quality':
        return (
          <FormField
            control={form.control}
            name="metadata.defectRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hata Oranı (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-defect-rate"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'Production':
        return (
          <>
            <FormField
              control={form.control}
              name="metadata.actualProduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gerçekleşen Üretim (adet)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-actual-production"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.machineStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Makine Durumu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-machine-status">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="maintenance">Bakımda</SelectItem>
                      <SelectItem value="fault">Arızalı</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card shadow-sm border border-border" data-testid="form-data-entry">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">
          Veri Girişi - {departmentLabels[userDepartment as keyof typeof departmentLabels]}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Son güncelleme: {userName}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gerçekleşen Değer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        data-testid="input-value"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hedef Değer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        {...field}
                        data-testid="input-target"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {getDepartmentFields()}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-save"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
