import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Papa from 'papaparse';

interface User {
  id?: number; // Optional, as it might be auto-incremented by the database
  username: string;
  password?: string;
  department: string;
  role: 'admin' | 'manager' | 'user';
  permissions?: string; // Optional, if not always provided
  created_at?: string; // Optional, can be set by the server
  name: string;
  isActive: boolean;
}

interface ImportMapping {
  csvColumn: string;
  dbField: keyof User;
}

export default function UserImport() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ImportMapping[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'mapping' | 'importing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatePasswords, setGeneratePasswords] = useState(true);
  const [importedCount, setImportedCount] = useState(0);

  const dbFields: { key: keyof User; label: string; required: boolean }[] = [
    { key: 'username', label: 'Kullanıcı Adı', required: true },
    { key: 'name', label: 'Ad Soyad', required: true },
    { key: 'department', label: 'Departman', required: true },
    { key: 'role', label: 'Rol', required: true },
    { key: 'password', label: 'Şifre', required: false },
    { key: 'permissions', label: 'İzinler', required: false },
    { key: 'isActive', label: 'Durum', required: false },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      setErrorMessage('Lütfen geçerli bir Excel (.xlsx, .xls) veya CSV (.csv) dosyası seçin');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('Dosya boyutu 10MB\'tan küçük olmalıdır');
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
    setImportStatus('idle');

    if (fileExtension === 'csv') {
      parseCSVFile(selectedFile);
    } else {
      parseExcelFile(selectedFile);
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMessage('Dosya içeriği okunamadı');
          return;
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
          setErrorMessage('Dosya boş görünüyor');
          return;
        }

        const firstLine = lines[0];
        let delimiter = ',';
        if (firstLine.includes(';')) delimiter = ';';
        else if (firstLine.includes('\t')) delimiter = '\t';

        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
        const dataRows = lines.slice(1).map(line => {
          const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val !== ''));

        setCsvHeaders(headers);
        setCsvData(dataRows);

        const autoMapping = createAutoMapping(headers);
        setMapping(autoMapping);

        setImportStatus('mapping');
        setIsDialogOpen(true);
      } catch (error) {
        console.error('CSV parsing error:', error);
        setErrorMessage('CSV dosyası işlenirken hata oluştu: ' + (error as Error).message);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Dosya okuma hatası oluştu');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const parseExcelFile = async (file: File) => {
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellText: false, cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const jsonData: any[][] = [];

      for (let row = range.s.r; row <= range.e.r; row++) {
        const rowData: any[] = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          rowData.push(cell ? (cell.v || '') : '');
        }
        jsonData.push(rowData);
      }

      if (jsonData.length === 0) {
        setErrorMessage('Excel dosyası boş görünüyor');
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h).trim()).filter(h => h !== '');
      const dataRows = jsonData.slice(1)
        .filter(row => row.some(cell => cell !== '' && cell != null))
        .map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            const cellValue = row[index];
            obj[header] = cellValue != null ? String(cellValue).trim() : '';
          });
          return obj;
        });

      setCsvHeaders(headers);
      setCsvData(dataRows);

      const autoMapping = createAutoMapping(headers);
      setMapping(autoMapping);

      setImportStatus('mapping');
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Excel parsing error:', error);
      setErrorMessage('Excel dosyası okunurken hata oluştu: ' + (error as Error).message);
    }
  };

  const createAutoMapping = (headers: string[]): ImportMapping[] => {
    const mappings: ImportMapping[] = [];

    const mappingRules: { [key: string]: keyof User } = {
      'username': 'username',
      'kullaniciadi': 'username',
      'kullanici': 'username',
      'name': 'name',
      'adsoyad': 'name',
      'isim': 'name',
      'ad': 'name',
      'department': 'department',
      'departman': 'department',
      'bolum': 'department',
      'role': 'role',
      'rol': 'role',
      'yetki': 'role',
      'password': 'password',
      'sifre': 'password',
      'parola': 'password',
      'permissions': 'permissions',
      'izinler': 'permissions',
      'status': 'isActive',
      'durum': 'isActive',
      'aktif': 'isActive',
      'active': 'isActive',
    };

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '');
      const dbField = mappingRules[normalizedHeader];
      if (dbField) {
        const existingMapping = mappings.find(m => m.dbField === dbField);
        if (!existingMapping) {
          mappings.push({ csvColumn: header, dbField });
        }
      }
    });

    return mappings;
  };

  const updateMapping = (csvColumn: string, dbField: string | '') => {
    setMapping(prev => {
      const filtered = prev.filter(m => m.csvColumn !== csvColumn);
      if (dbField && dbField !== 'none' && dbField.trim() !== '') {
        const finalFiltered = filtered.filter(m => m.dbField !== dbField);
        return [...finalFiltered, { csvColumn, dbField } as ImportMapping];
      }
      return filtered;
    });
  };

  const validateMapping = (): boolean => {
    const requiredFields = dbFields.filter(f => f.required).map(f => f.key);
    const mappedFields = mapping.map(m => m.dbField);
    const missingFields: string[] = [];

    for (const required of requiredFields) {
      if (!mappedFields.includes(required)) {
        const fieldInfo = dbFields.find(f => f.key === required);
        missingFields.push(fieldInfo?.label || required);
      }
    }

    if (missingFields.length > 0) {
      setErrorMessage(`Şu gerekli alanlar eşleştirme yapılmadı: ${missingFields.join(', ')}. Lütfen CSV sütunlarını gerekli veritabanı alanlarıyla eşleştirin.`);
      return false;
    }

    if (mapping.length === 0) {
      setErrorMessage('Hiçbir alan eşleştirmesi yapılmadı. En azından gerekli alanları eşleştirin.');
      return false;
    }

    return true;
  };

  const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const processImport = async () => {
    if (!validateMapping()) return;

    setImportStatus('importing');

    try {
      const users: User[] = csvData
        .filter(row => Object.values(row).some(value => value && value.toString().trim() !== ''))
        .map(row => {
          const user: User = {
            username: '',
            name: '',
            department: 'General', // Default value for required field
            role: 'user', // Default role
            isActive: true, // Default status
          };

          mapping.forEach(({ csvColumn, dbField }) => {
            let value = row[csvColumn];

            if (value === undefined || value === null) {
              value = '';
            } else {
              value = value.toString().trim();
            }

            switch (dbField) {
              case 'username':
                user.username = value || '';
                break;
              case 'name':
                user.name = value || '';
                break;
              case 'department':
                user.department = value || 'General'; // Ensure department is never null
                break;
              case 'role':
                const roleMap = { 'admin': 'admin', 'yönetici': 'admin', 'manager': 'manager', 'müdür': 'manager', 'user': 'user', 'kullanıcı': 'user' };
                user.role = roleMap[value.toLowerCase()] || 'user';
                break;
              case 'password':
                user.password = value;
                break;
              case 'permissions':
                user.permissions = value;
                break;
              case 'isActive':
                const statusMap = { 'active': true, 'aktif': true, 'inactive': false, 'pasif': false };
                user.isActive = statusMap[value.toLowerCase()] !== undefined ? statusMap[value.toLowerCase()] : true;
                break;
            }
          });

          if (generatePasswords && (!user.password || user.password.trim() === '')) {
            user.password = generateRandomPassword();
          }

          if (!user.username || user.username.trim() === '') {
            throw new Error(`Kullanıcı adı boş olamaz`);
          }
          if (!user.name || user.name.trim() === '') {
            user.name = user.username; // Fallback to username if name is empty
          }
          if (!user.department || user.department.trim() === '') {
            user.department = 'General'; // Ensure department is always set
          }

          return user;
        });

      console.log('Processed users for MSSQL:', users);

      const response = await fetch('/api/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users, hashPasswords: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import işlemi başarısız');
      }

      const result = await response.json();
      console.log('Import result:', result);
      setImportedCount(result.importedCount || 0);

      if (result.errors && result.errors.length > 0) {
        setErrorMessage(`${result.importedCount} kullanıcı içe aktarıldı, ${result.errors.length} hata: ${result.errors.join(', ')}`);
      }

      setImportStatus('success');
    } catch (error) {
      console.error('Import error:', error);
      setErrorMessage('Import işlemi sırasında hata oluştu: ' + (error as Error).message);
      setImportStatus('error');
    }
  };

  const resetImport = () => {
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setMapping([]);
    setImportStatus('idle');
    setErrorMessage('');
    setIsDialogOpen(false);
    setImportedCount(0);
  };

  const downloadTemplate = () => {
    const template = [
      ['username', 'name', 'department', 'role', 'password', 'permissions', 'isActive'],
      ['admin', 'Admin User', 'Management', 'admin', '', '', 'active'],
      ['safety1', 'Safety Manager', 'Safety', 'manager', '', '', 'active'],
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_import_template.csv';
    link.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Kullanıcı İçe Aktarma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {importStatus === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {importedCount} kullanıcı başarıyla içe aktarıldı!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="file-upload">Excel veya CSV Dosyası</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Şablon İndir
          </Button>
        </div>

        {file && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Seçilen dosya:</strong> {file.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {csvData.length} satır bulundu
            </p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Alan Eşleştirme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate-passwords"
                  checked={generatePasswords}
                  onCheckedChange={setGeneratePasswords}
                />
                <Label htmlFor="generate-passwords">
                  Boş şifre alanları için otomatik şifre oluştur
                </Label>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4 font-medium">
                  <div>CSV Sütunu</div>
                  <div>Veritabanı Alanı</div>
                  <div>Örnek Veri</div>
                </div>

                {csvHeaders.map(header => (
                  <div key={header} className="grid grid-cols-3 gap-4 items-center">
                    <div className="p-2 bg-muted rounded">
                      {header}
                    </div>
                    <Select
                      value={mapping.find(m => m.csvColumn === header)?.dbField || 'none'}
                      onValueChange={(value) => updateMapping(header, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Alan seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Alan seçin</SelectItem>
                        {dbFields.map(field => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label} {field.required && '*'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="p-2 text-sm text-muted-foreground bg-gray-50 rounded">
                      {csvData.length > 0 ? csvData[0][header] || '-' : '-'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={resetImport}>
                  İptal
                </Button>
                <div className="flex items-center gap-2">
                  {mapping.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {mapping.length} alan eşleştirildi
                    </span>
                  )}
                  <Button
                    onClick={processImport}
                    disabled={importStatus === 'importing' || mapping.length === 0}
                  >
                    {importStatus === 'importing' ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}