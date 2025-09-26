
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Factory, TrendingUp, Target, CheckCircle, RotateCw } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Geçersiz kullanıcı adı veya şifre');
      }
    } catch (error) {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Sol Taraf - Giriş Formu */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary rounded-full p-4">
                  <Factory className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                Fabrika KPI Dashboard
              </CardTitle>
              <p className="text-gray-600 text-lg">Hesabınıza giriş yapın</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-base font-semibold text-gray-700">
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-2 h-12 text-base border-2 focus:border-primary"
                    placeholder="Kullanıcı adınızı girin"
                    data-testid="input-username"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                    Şifre
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-2 h-12 text-base border-2 focus:border-primary"
                    placeholder="Şifrenizi girin"
                    data-testid="input-password"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Giriş Yap
                </Button>
              </form>
              <div className="mt-8 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Demo Hesaplar:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Admin:</strong> admin / admin123</p>
                    <p><strong>Güvenlik:</strong> safety1 / safety123</p>
                    <p><strong>Kalite:</strong> quality1 / quality123</p>
                    <p><strong>Üretim:</strong> production1 / production123</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sağ Taraf - PDCA Döngüsü Görseli */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-tl from-primary/10 via-emerald-50 to-yellow-50">
        <div className="relative w-96 h-96">
          {/* PDCA Döngüsü SVG */}
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Plan - Sarı */}
            <path
              d="M 200 50 A 150 150 0 0 1 350 200 L 250 200 A 50 50 0 0 0 200 150 Z"
              fill="url(#planGradient)"
              className="drop-shadow-lg"
            />
            {/* Do - Yeşil */}
            <path
              d="M 350 200 A 150 150 0 0 1 200 350 L 200 250 A 50 50 0 0 0 250 200 Z"
              fill="url(#doGradient)"
              className="drop-shadow-lg"
            />
            {/* Check - Mavi */}
            <path
              d="M 200 350 A 150 150 0 0 1 50 200 L 150 200 A 50 50 0 0 0 200 250 Z"
              fill="url(#checkGradient)"
              className="drop-shadow-lg"
            />
            {/* Act - Kırmızı */}
            <path
              d="M 50 200 A 150 150 0 0 1 200 50 L 200 150 A 50 50 0 0 0 150 200 Z"
              fill="url(#actGradient)"
              className="drop-shadow-lg"
            />

            {/* Gradientler */}
            <defs>
              <linearGradient id="planGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="doGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="actGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>

            {/* Metin ve İkonlar */}
            {/* Plan */}
            <g transform="translate(280, 120)">
              <circle cx="0" cy="0" r="25" fill="white" className="drop-shadow-md" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <Target className="w-6 h-6 text-yellow-600" />
              </foreignObject>
              <text x="0" y="45" textAnchor="middle" className="text-lg font-bold fill-yellow-700">PLAN</text>
            </g>

            {/* Do */}
            <g transform="translate(280, 280)">
              <circle cx="0" cy="0" r="25" fill="white" className="drop-shadow-md" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <RotateCw className="w-6 h-6 text-green-600" />
              </foreignObject>
              <text x="0" y="45" textAnchor="middle" className="text-lg font-bold fill-green-700">DO</text>
            </g>

            {/* Check */}
            <g transform="translate(120, 280)">
              <circle cx="0" cy="0" r="25" fill="white" className="drop-shadow-md" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </foreignObject>
              <text x="0" y="45" textAnchor="middle" className="text-lg font-bold fill-blue-700">CHECK</text>
            </g>

            {/* Act */}
            <g transform="translate(120, 120)">
              <circle cx="0" cy="0" r="25" fill="white" className="drop-shadow-md" />
              <foreignObject x="-12" y="-12" width="24" height="24">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </foreignObject>
              <text x="0" y="45" textAnchor="middle" className="text-lg font-bold fill-red-700">ACT</text>
            </g>

            {/* Merkez Başlık */}
            <g transform="translate(200, 190)">
              <text x="0" y="0" textAnchor="middle" className="text-2xl font-bold fill-gray-700">
                Sürekli
              </text>
              <text x="0" y="25" textAnchor="middle" className="text-2xl font-bold fill-gray-700">
                İyileştirme
              </text>
            </g>

            {/* Ok İşaretleri */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
              </marker>
            </defs>
            
            {/* Döngü Okları */}
            <path d="M 320 80 Q 360 40 360 120" fill="none" stroke="#4B5563" strokeWidth="3" markerEnd="url(#arrowhead)" />
            <path d="M 320 320 Q 360 360 280 360" fill="none" stroke="#4B5563" strokeWidth="3" markerEnd="url(#arrowhead)" />
            <path d="M 80 320 Q 40 360 40 280" fill="none" stroke="#4B5563" strokeWidth="3" markerEnd="url(#arrowhead)" />
            <path d="M 80 80 Q 40 40 120 40" fill="none" stroke="#4B5563" strokeWidth="3" markerEnd="url(#arrowhead)" />
          </svg>

          {/* Alt Başlık */}
          <div className="absolute -bottom-16 left-0 right-0 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Kalite Yönetim Sistemi
            </h2>
            <p className="text-gray-600">
              Sürekli iyileştirme döngüsü ile mükemmelliğe ulaşın
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
