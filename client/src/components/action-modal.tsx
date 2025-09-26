import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const actionFormSchema = z.object({
  title: z.string().min(1, 'Başlık girilmelidir'),
  description: z.string().min(1, 'Açıklama girilmelidir'),
  department: z.string().min(1, 'Departman seçilmelidir'),
  priority: z.enum(['high', 'medium', 'low']),
  assigneeId: z.string().min(1, 'Sorumlu seçilmelidir'),
  dueDate: z.string().optional(),
});

type ActionFormData = z.infer<typeof actionFormSchema>;

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionId?: string;
  defaultDepartment?: string;
}

export function ActionModal({ isOpen, onClose, actionId, defaultDepartment }: ActionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    enabled: isOpen,
  });

  const { data: action } = useQuery({
    queryKey: ['/api/actions', actionId],
    enabled: isOpen && !!actionId,
  });

  const form = useForm<ActionFormData>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      department: defaultDepartment || '',
      priority: 'medium',
      assigneeId: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (action && actionId) {
      const actionData = action as any;
      form.reset({
        title: actionData.title,
        description: actionData.description,
        department: actionData.department,
        priority: actionData.priority,
        assigneeId: actionData.assigneeId,
        dueDate: actionData.dueDate ? new Date(actionData.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [action, actionId, form]);

  const createActionMutation = useMutation({
    mutationFn: async (data: ActionFormData) => {
      const url = actionId ? `/api/actions/${actionId}` : '/api/actions';
      const method = actionId ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, url, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/actions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      toast({
        title: 'Başarılı',
        description: actionId ? 'Aksiyon başarıyla güncellendi' : 'Yeni aksiyon başarıyla oluşturuldu',
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Aksiyon kaydedilirken hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (data: ActionFormData) => {
    setIsSubmitting(true);
    try {
      await createActionMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="modal-action">
        <DialogHeader>
          <DialogTitle>{actionId ? 'Aksiyonu Düzenle' : 'Yeni Aksiyon Ekle'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlık</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Aksiyon başlığı"
                      {...field}
                      data-testid="input-action-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departman</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} data-testid="select-department">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Departman seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Safety">Güvenlik</SelectItem>
                      <SelectItem value="Quality">Kalite</SelectItem>
                      <SelectItem value="Production">Üretim</SelectItem>
                      <SelectItem value="Logistics">Lojistik</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Öncelik</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} data-testid="select-priority">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Öncelik seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sorumlu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} data-testid="select-assignee">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sorumlu seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(users as any)?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bitiş Tarihi</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      data-testid="input-due-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Aksiyon detayları"
                      rows={3}
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? 'Kaydediliyor...' : actionId ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
