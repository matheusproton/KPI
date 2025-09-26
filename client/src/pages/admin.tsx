import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Key, Users, Building2, FileSpreadsheet, Settings, Home } from 'lucide-react';
import { UserManagement, DepartmentManagement, ProductionStation } from '../../../shared/schema';
import UserImport from '@/components/user-import';
import { ThemeToggle } from "@/components/theme-toggle";


export default function AdminPanel() {
  // User management state
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUserImportOpen, setIsUserImportOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user' | 'viewer',
    department: '',
    name: '',
    isActive: true
  });

  // Department management state
  const [departments, setDepartments] = useState<DepartmentManagement[]>([]);
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false);
  const [isEditDepartmentDialogOpen, setIsEditDepartmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentManagement | null>(null);
  const [departmentFormData, setDepartmentFormData] = useState({
    name: '',
    description: '',
    managerId: 'none',
    isActive: true
  });

  const [activeTab, setActiveTab] = useState('users');

  // Production stations management state
  const [productionStations, setProductionStations] = useState<ProductionStation[]>([]);
  const [isAddStationDialogOpen, setIsAddStationDialogOpen] = useState(false);
  const [isEditStationDialogOpen, setIsEditStationDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<ProductionStation | null>(null);
  const [stationFormData, setStationFormData] = useState({
    name: '',
    code: '',
    description: '',
    location: '',
    responsibleId: 'none',
    isActive: true
  });

  // Load data
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchProductionStations();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Bölümler yüklenirken hata:', error);
    }
  };

  const fetchProductionStations = async () => {
    try {
      const response = await fetch('/api/admin/production-stations');
      if (response.ok) {
        const data = await response.json();
        setProductionStations(data);
      }
    } catch (error) {
      console.error('Üretim istasyonları yüklenirken hata:', error);
    }
  };

  // User management functions
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zorunlu alanları kontrol et
    if (!userFormData.username.trim()) {
      alert('Lütfen kullanıcı adı girin');
      return;
    }

    if (!userFormData.email.trim()) {
      alert('Lütfen e-posta adresi girin');
      return;
    }

    if (!userFormData.name.trim()) {
      alert('Lütfen ad soyad girin');
      return;
    }

    if (!userFormData.department || userFormData.department.trim() === '' || userFormData.department === 'undefined' || userFormData.department === 'null') {
      alert('Lütfen bir departman seçin');
      return;
    }

    if (!editingUser && (!userFormData.password || userFormData.password.trim() === '')) {
      alert('Lütfen şifre girin');
      return;
    }

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      // Ensure department has a valid value before sending
      const submissionData = {
        ...userFormData,
        department: userFormData.department && userFormData.department.trim() !== '' ? userFormData.department.trim() : 'Üretim'
      };

      console.log('Submitting user data:', submissionData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        fetchUsers();
        resetUserForm();
        setIsAddUserDialogOpen(false);
        setIsEditUserDialogOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Kullanıcı kaydedilirken hata:', error);
      alert('Kullanıcı kaydedilirken bir hata oluştu');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: userFormData.password })
      });

      if (response.ok) {
        setIsPasswordDialogOpen(false);
        setUserFormData({ ...userFormData, password: '' });
      }
    } catch (error) {
      console.error('Şifre değiştirilirken hata:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
    }
  };

  const toggleUserStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        // Immediately update the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, isActive } : user
          )
        );
        // Also fetch fresh data from server
        fetchUsers();
      } else {
        console.error('Kullanıcı durumu güncellenemedi:', await response.text());
      }
    } catch (error) {
      console.error('Kullanıcı durumu değiştirilirken hata:', error);
    }
  };

  const resetUserForm = () => {
    // Aktif departmanlardan ilkini varsayılan olarak seç, yoksa 'Üretim' kullan
    const activeDepartments = departments.filter(d => d.isActive);
    const defaultDepartment = activeDepartments.length > 0 ? activeDepartments[0].name : 'Üretim';

    setUserFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      department: defaultDepartment,
      name: '',
      isActive: true
    });
    setEditingUser(null);
  };

  const handleUserImport = async (importUsers: any[]) => {
    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const userData of importUsers) {
        try {
          const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            errorCount++;
            errors.push(`${userData.username}: ${errorData.message}`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`${userData.username}: Beklenmeyen hata`);
        }
      }

      // Sonuçları göster
      if (successCount > 0) {
        console.log(`${successCount} kullanıcı başarıyla içe aktarıldı`);
        fetchUsers(); // Listeyi yenile
      }

      if (errorCount > 0) {
        console.error(`${errorCount} kullanıcı içe aktarılamadı:`, errors);
      }

    } catch (error) {
      console.error('Kullanıcı içe aktarma hatası:', error);
    }
  };

  const openEditUserDialog = (user: UserManagement) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      name: user.name || '',
      isActive: user.isActive
    });
    setIsEditUserDialogOpen(true);
  };

  const openPasswordDialog = (user: UserManagement) => {
    setEditingUser(user);
    setUserFormData({ ...userFormData, password: '' });
    setIsPasswordDialogOpen(true);
  };

  // Department management functions
  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDepartment ? `/api/admin/departments/${editingDepartment.id}` : '/api/admin/departments';
      const method = editingDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...departmentFormData,
          managerId: departmentFormData.managerId && departmentFormData.managerId !== 'none' ? parseInt(departmentFormData.managerId) : null
        })
      });

      if (response.ok) {
        fetchDepartments();
        resetDepartmentForm();
        setIsAddDepartmentDialogOpen(false);
        setIsEditDepartmentDialogOpen(false);
      }
    } catch (error) {
      console.error('Bölüm kaydedilirken hata:', error);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/departments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDepartments();
      }
    } catch (error) {
      console.error('Bölüm silinirken hata:', error);
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentFormData({
      name: '',
      description: '',
      managerId: 'none',
      isActive: true
    });
    setEditingDepartment(null);
  };

  const openEditDepartmentDialog = (department: DepartmentManagement) => {
    setEditingDepartment(department);
    setDepartmentFormData({
      name: department.name,
      description: department.description || '',
      managerId: department.managerId?.toString() || 'none',
      isActive: department.isActive
    });
    setIsEditDepartmentDialogOpen(true);
  };

  // Production stations management functions
  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStation ? `/api/admin/production-stations/${editingStation.id}` : '/api/admin/production-stations';
      const method = editingStation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stationFormData,
          responsibleId: stationFormData.responsibleId && stationFormData.responsibleId !== 'none' ? parseInt(stationFormData.responsibleId) : null
        })
      });

      if (response.ok) {
        fetchProductionStations();
        resetStationForm();
        setIsAddStationDialogOpen(false);
        setIsEditStationDialogOpen(false);
      }
    } catch (error) {
      console.error('İstasyon kaydedilirken hata:', error);
    }
  };

  const handleDeleteStation = async (id: number) => {
    if (!confirm('Bu üretim istasyonunu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/production-stations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProductionStations();
      }
    } catch (error) {
      console.error('İstasyon silinirken hata:', error);
    }
  };

  const resetStationForm = () => {
    setStationFormData({
      name: '',
      code: '',
      description: '',
      location: '',
      responsibleId: 'none',
      isActive: true
    });
    setEditingStation(null);
  };

  const openEditStationDialog = (station: ProductionStation) => {
    setEditingStation(station);
    setStationFormData({
      name: station.name,
      code: station.code,
      description: station.description || '',
      location: station.location || '',
      responsibleId: station.responsibleId?.toString() || 'none',
      isActive: station.isActive
    });
    setIsEditStationDialogOpen(true);
  };

  // Dummy setLocation function for demonstration purposes
  const setLocation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, you would use React Router or Next.js router here
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Settings className="text-2xl" />
              <h1 className="text-2xl font-bold">Admin Paneli</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kullanıcı Yönetimi
              </TabsTrigger>
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bölüm Yönetimi
              </TabsTrigger>
              <TabsTrigger value="production-stations" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Üretim İstasyonları
              </TabsTrigger>
            </TabsList>

            {/* User Management Tab */}
            <TabsContent value="users" className="mt-6">
              <Card className="bg-card shadow-sm border border-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Kullanıcı Yönetimi</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setIsUserImportOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel/CSV İçe Aktar
                      </Button>
                      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={resetUserForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Kullanıcı
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="username">Kullanıcı Adı</Label>
                              <Input
                                id="username"
                                value={userFormData.username}
                                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">E-posta</Label>
                              <Input
                                id="email"
                                type="email"
                                value={userFormData.email}
                                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="password">Şifre</Label>
                              <Input
                                id="password"
                                type="password"
                                value={userFormData.password}
                                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="role">Rol</Label>
                              <Select value={userFormData.role} onValueChange={(value: 'admin' | 'user' | 'viewer') => setUserFormData({ ...userFormData, role: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Rol seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">Yönetici</SelectItem>
                                  <SelectItem value="user">Kullanıcı</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="name">Ad Soyad</Label>
                              <Input
                                id="name"
                                value={userFormData.name}
                                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="department">Departman</Label>
                              <Select value={userFormData.department} onValueChange={(value) => setUserFormData({ ...userFormData, department: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Departman seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {departments.filter(d => d.isActive).map((department) => (
                                    <SelectItem key={department.id} value={department.name}>
                                      {department.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={userFormData.isActive}
                                onCheckedChange={(checked) => setUserFormData({ ...userFormData, isActive: checked })}
                              />
                              <Label>Aktif</Label>
                            </div>
                            <Button type="submit" className="w-full">Kaydet</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kullanıcı Adı</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Oluşturma Tarihi</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'user' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'user' ? 'Kullanıcı' : 'Görüntüleyici'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={(checked) => toggleUserStatus(user.id!, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditUserDialog(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPasswordDialog(user)}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Department Management Tab */}
            <TabsContent value="departments" className="mt-6">
              <Card className="bg-card shadow-sm border border-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Bölüm Yönetimi</CardTitle>
                    <Dialog open={isAddDepartmentDialogOpen} onOpenChange={setIsAddDepartmentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetDepartmentForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Yeni Bölüm
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yeni Bölüm Ekle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleDepartmentSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="dept-name">Bölüm Adı</Label>
                            <Input
                              id="dept-name"
                              value={departmentFormData.name}
                              onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="dept-description">Açıklama</Label>
                            <Textarea
                              id="dept-description"
                              value={departmentFormData.description}
                              onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dept-manager">Bölüm Müdürü</Label>
                            <Select 
                              value={departmentFormData.managerId} 
                              onValueChange={(value) => setDepartmentFormData({ ...departmentFormData, managerId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Bölüm müdürü seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Seçiniz</SelectItem>
                                {users.filter(u => u.isActive).map((user) => (
                                  <SelectItem key={user.id} value={user.id!.toString()}>
                                    {user.username} ({user.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={departmentFormData.isActive}
                              onCheckedChange={(checked) => setDepartmentFormData({ ...departmentFormData, isActive: checked })}
                            />
                            <Label>Aktif</Label>
                          </div>
                          <Button type="submit" className="w-full">Kaydet</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bölüm Adı</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Bölüm Müdürü</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Oluşturma Tarihi</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell>{department.description || '-'}</TableCell>
                          <TableCell>{department.managerName || 'Atanmamış'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              department.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {department.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {department.createdAt ? new Date(department.createdAt).toLocaleDateString('tr-TR') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDepartmentDialog(department)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteDepartment(department.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Production Stations Management Tab */}
            <TabsContent value="production-stations" className="mt-6">
              <Card className="bg-card shadow-sm border border-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Üretim İstasyonları Yönetimi</CardTitle>
                    <Dialog open={isAddStationDialogOpen} onOpenChange={setIsAddStationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetStationForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Yeni İstasyon
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yeni Üretim İstasyonu Ekle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleStationSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="station-name">İstasyon Adı</Label>
                            <Input
                              id="station-name"
                              value={stationFormData.name}
                              onChange={(e) => setStationFormData({ ...stationFormData, name: e.target.value })}
                              placeholder="Örn: MSG 115 Hattı"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="station-code">İstasyon Kodu</Label>
                            <Input
                              id="station-code"
                              value={stationFormData.code}
                              onChange={(e) => setStationFormData({ ...stationFormData, code: e.target.value })}
                              placeholder="Örn: MSG115"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="station-description">Açıklama</Label>
                            <Textarea
                              id="station-description"
                              value={stationFormData.description}
                              onChange={(e) => setStationFormData({ ...stationFormData, description: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="station-location">Lokasyon</Label>
                            <Input
                              id="station-location"
                              value={stationFormData.location}
                              onChange={(e) => setStationFormData({ ...stationFormData, location: e.target.value })}
                              placeholder="Örn: A Blok, 1. Kat"
                            />
                          </div>
                          <div>
                            <Label htmlFor="station-responsible">Sorumlusu</Label>
                            <Select 
                              value={stationFormData.responsibleId} 
                              onValueChange={(value) => setStationFormData({ ...stationFormData, responsibleId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sorumlu kişi seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Seçiniz</SelectItem>
                                {users.filter(u => u.isActive).map((user) => (
                                  <SelectItem key={user.id} value={user.id!.toString()}>
                                    {user.username} ({user.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={stationFormData.isActive}
                              onCheckedChange={(checked) => setStationFormData({ ...stationFormData, isActive: checked })}
                            />
                            <Label>Aktif</Label>
                          </div>
                          <Button type="submit" className="w-full">Kaydet</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>İstasyon Adı</TableHead>
                        <TableHead>Kod</TableHead>
                        <TableHead>Lokasyon</TableHead>
                        <TableHead>Sorumlusu</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Oluşturma Tarihi</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productionStations.map((station) => (
                        <TableRow key={station.id}>
                          <TableCell className="font-medium">{station.name}</TableCell>
                          <TableCell>{station.code}</TableCell>
                          <TableCell>{station.location || '-'}</TableCell>
                          <TableCell>{station.responsibleName || 'Atanmamış'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              station.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {station.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {station.createdAt ? new Date(station.createdAt).toLocaleDateString('tr-TR') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditStationDialog(station)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteStation(station.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

      {/* User Edit Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Kullanıcı Adı</Label>
              <Input
                id="edit-username"
                value={userFormData.username}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">E-posta</Label>
              <Input
                id="edit-email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={userFormData.role} onValueChange={(value: 'admin' | 'user' | 'viewer') => setUserFormData({ ...userFormData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Kullanıcı</SelectItem>
                  <SelectItem value="viewer">Görüntüleyici</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-department">Departman</Label>
              <Select value={userFormData.department} onValueChange={(value) => setUserFormData({ ...userFormData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {departments.filter(d => d.isActive).map((department) => (
                    <SelectItem key={department.id} value={department.name}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={userFormData.isActive}
                onCheckedChange={(checked) => setUserFormData({ ...userFormData, isActive: checked })}
              />
              <Label>Aktif</Label>
            </div>
            <Button type="submit" className="w-full">Güncelle</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Department Edit Dialog */}
      <Dialog open={isEditDepartmentDialogOpen} onOpenChange={setIsEditDepartmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bölüm Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDepartmentSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-dept-name">Bölüm Adı</Label>
              <Input
                id="edit-dept-name"
                value={departmentFormData.name}
                onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-dept-description">Açıklama</Label>
              <Textarea
                id="edit-dept-description"
                value={departmentFormData.description}
                onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-dept-manager">Bölüm Müdürü</Label>
              <Select 
                value={departmentFormData.managerId} 
                onValueChange={(value) => setDepartmentFormData({ ...departmentFormData, managerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bölüm müdürü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seçiniz</SelectItem>
                  {users.filter(u => u.isActive).map((user) => (
                    <SelectItem key={user.id} value={user.id!.toString()}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={departmentFormData.isActive}
                onCheckedChange={(checked) => setDepartmentFormData({ ...departmentFormData, isActive: checked })}
              />
              <Label>Aktif</Label>
            </div>
            <Button type="submit" className="w-full">Güncelle</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Şifre Değiştir</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <Input
                id="new-password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">Şifreyi Değiştir</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Import Dialog */}
      <UserImport
        isOpen={isUserImportOpen}
        onClose={() => setIsUserImportOpen(false)}
        onImport={handleUserImport}
      />
      </main>
    </div>
  );
}