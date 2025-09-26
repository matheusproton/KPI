
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, User, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // User info state
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleUserInfoChange = (field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Kullanıcı bilgileri güncellendi.",
        });
      } else {
        throw new Error('Güncelleme başarısız');
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kullanıcı bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Şifre başarıyla değiştirildi.",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Şifre değiştirme başarısız');
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Şifre değiştirilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 5MB'dan küçük olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Sadece resim dosyaları yüklenebilir.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProfilePicture(result.profilePictureUrl);
        toast({
          title: "Başarılı",
          description: "Profil fotoğrafı güncellendi.",
        });
      } else {
        throw new Error('Fotoğraf yükleme başarısız');
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil fotoğrafı yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profil Ayarları</h1>
          <p className="text-gray-600">Hesap bilgilerinizi ve ayarlarınızı yönetin</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profil Bilgileri
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="w-4 h-4 mr-2" />
              Şifre Değiştir
            </TabsTrigger>
            
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil Fotoğrafı</CardTitle>
                <CardDescription>
                  Profil fotoğrafınızı değiştirin. Maksimum dosya boyutu 5MB'dır.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profilePicture || undefined} />
                    <AvatarFallback className="text-2xl">
                      {userInfo.firstName?.[0]}{userInfo.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col items-center space-y-2">
                    <Label htmlFor="profilePictureInput" className="cursor-pointer">
                      <Button variant="outline" disabled={isLoading} asChild>
                        <span>
                          <Camera className="w-4 h-4 mr-2" />
                          {isLoading ? 'Yükleniyor...' : 'Fotoğraf Seç'}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="profilePictureInput"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500">
                      JPG, PNG veya GIF formatında, maksimum 5MB
                    </p>
                  </div>
                </div>

                {profilePicture && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setProfilePicture(null)}
                      disabled={isLoading}
                    >
                      Fotoğrafı Kaldır
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
                <CardDescription>
                  Hesabınızla ilişkilendirilmiş kişisel bilgilerinizi güncelleyin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      value={userInfo.firstName}
                      onChange={(e) => handleUserInfoChange('firstName', e.target.value)}
                      placeholder="Adınızı girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      value={userInfo.lastName}
                      onChange={(e) => handleUserInfoChange('lastName', e.target.value)}
                      placeholder="Soyadınızı girin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleUserInfoChange('email', e.target.value)}
                    placeholder="E-posta adresinizi girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                    placeholder="Telefon numaranızı girin"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Departman</Label>
                    <Input
                      id="department"
                      value={userInfo.department}
                      onChange={(e) => handleUserInfoChange('department', e.target.value)}
                      placeholder="Departmanınızı girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Pozisyon</Label>
                    <Input
                      id="position"
                      value={userInfo.position}
                      onChange={(e) => handleUserInfoChange('position', e.target.value)}
                      placeholder="Pozisyonunuzu girin"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveUserInfo} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>
                  Hesabınızın güvenliği için güçlü bir şifre seçin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Yeni şifrenizi girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p>Şifre gereksinimleri:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>En az 6 karakter uzunluğunda olmalıdır</li>
                    <li>Büyük ve küçük harf içermelidir</li>
                    <li>En az bir rakam içermelidir</li>
                  </ul>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={isLoading}>
                    <Lock className="w-4 h-4 mr-2" />
                    {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
        </Tabs>
      </div>
    </div>
  );
}
