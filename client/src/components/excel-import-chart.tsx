
import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Upload, FileSpreadsheet, BarChart3, LineChart as LineChartIcon, TrendingUp, Loader2 } from 'lucide-react';

interface ExcelData {
  [key: string]: any;
}

interface ExcelImportChartProps {
  className?: string;
}

export function ExcelImportChart({ className }: ExcelImportChartProps) {
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [selectedXAxis, setSelectedXAxis] = useState<string>('');
  const [selectedYAxis, setSelectedYAxis] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dosya formatını otomatik olarak algıla
  const detectDelimiter = (text: string): string => {
    const firstLine = text.split('\n')[0] || '';
    const secondLine = text.split('\n')[1] || '';
    
    // İlk iki satıra bakarak en yaygın ayırıcıyı bul
    const delimiters = ['\t', ';', ',', '|'];
    let bestDelimiter = '\t';
    let maxColumns = 0;
    
    for (const delimiter of delimiters) {
      const firstLineCols = firstLine.split(delimiter).length;
      const secondLineCols = secondLine.split(delimiter).length;
      
      // Her iki satırda da aynı sayıda sütun varsa ve en fazla sütuna sahipse
      if (firstLineCols === secondLineCols && firstLineCols > maxColumns) {
        maxColumns = firstLineCols;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  };

  // Optimized Excel data parser
  const parseExcelData = useMemo(() => (text: string): ExcelData[] => {
    try {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) return [];

      const delimiter = detectDelimiter(text);
      const headers = lines[0].split(delimiter)
        .map(header => {
          // Başlık temizleme - tırnak işaretleri ve gereksiz karakterleri kaldır
          let cleanHeader = header.trim()
            .replace(/^["']+|["']+$/g, '') // Başta ve sonda tırnak işaretleri
            .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
            .trim();
          
          // Bozuk karakterleri daha agresif şekilde temizle
          cleanHeader = cleanHeader
            .replace(/�/g, '') // Replacement karakterini kaldır
            .replace(/[^\w\sçÇğĞıİöÖşŞüÜ\-_]/g, '') // Sadece alfanumerik, Türkçe karakterler ve bazı özel karakterleri bırak
            .trim();
          
          // Eğer başlık boş kaldıysa varsayılan isim ver
          if (!cleanHeader) {
            cleanHeader = `Sütun_${Math.random().toString(36).substr(2, 5)}`;
          }
          
          return cleanHeader;
        })
        .filter(header => header.length > 0);
      
      if (headers.length === 0) {
        throw new Error('Geçerli sütun başlıkları bulunamadı');
      }

      setColumns(headers);

      const data = lines.slice(1).map((line, index) => {
        const values = line.split(delimiter)
          .map(val => {
            let cleanVal = val.trim().replace(/^["']+|["']+$/g, '');
            
            // Bozuk karakterleri temizle
            if (cleanVal.includes('�')) {
              cleanVal = cleanVal.replace(/�/g, '');
            }
            
            return cleanVal;
          });
        const row: ExcelData = {};

        headers.forEach((header, i) => {
          const value = values[i] || '';
          
          // Önce bozuk karakterleri temizle
          let cleanedValue = value
            .replace(/�/g, '') // Replacement karakterini kaldır
            .trim();
          
          // Türkçe sayı formatını destekle (virgül yerine nokta)
          const numericValue = cleanedValue.replace(/[^\d,.-]/g, '').replace(/,/g, '.');
          const numValue = parseFloat(numericValue);
          
          // Eğer sayısal bir değerse sayı olarak, değilse temizlenmiş metin olarak sakla
          row[header] = !isNaN(numValue) && numericValue !== '' ? numValue : cleanedValue;
        });

        return row;
      }).filter(row => Object.values(row).some(val => val !== '' && val !== undefined));

      return data;
    } catch (error) {
      throw new Error(`Dosya işlenirken hata: ${error.message}`);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setParseError('');
    setFileName(file.name);

    try {
      let text: string;
      
      // Dosya boyutu kontrolü
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Dosya boyutu çok büyük (maksimum 5MB)');
      }

      // Dosya okuma - Gelişmiş Türkçe karakter desteği ile
      try {
        const arrayBuffer = await file.arrayBuffer();
        let text = '';
        
        // Farklı encoding'leri dene (Türkçe için optimize edilmiş sıralama)
        const encodings = ['windows-1254', 'iso-8859-9', 'utf-8', 'utf-16le', 'utf-16be'];
        let bestEncoding = 'utf-8';
        let bestScore = -1;
        let bestText = '';
        
        for (const encoding of encodings) {
          try {
            const decoder = new TextDecoder(encoding, { fatal: false });
            const decoded = decoder.decode(arrayBuffer);
            
            // Türkçe karakterlerin doğru okunup orunmadığını kontrol et
            const turkishChars = 'çÇğĞıİöÖşŞüÜ';
            let turkishScore = 0;
            
            // Türkçe karakter sayısını hesapla
            for (const char of turkishChars) {
              const matches = (decoded.match(new RegExp(char, 'g')) || []).length;
              turkishScore += matches;
            }
            
            // Bozuk karakter kontrolü
            const brokenCharCount = (decoded.match(/�/g) || []).length;
            const hasInvalidSequences = /[\uFFFD]/.test(decoded);
            
            // Genel metin kalitesi skorlaması
            const totalScore = turkishScore - (brokenCharCount * 10);
            
            // En iyi skoru bul
            if (totalScore > bestScore && !hasInvalidSequences) {
              bestScore = totalScore;
              bestEncoding = encoding;
              bestText = decoded;
            }
          } catch (e) {
            continue;
          }
        }
        
        // En iyi sonucu kullan
        if (bestText) {
          text = bestText;
        } else {
          // Son çare: UTF-8 ile zorla decode et ve bozuk karakterleri temizle
          const decoder = new TextDecoder('utf-8', { fatal: false });
          text = decoder.decode(arrayBuffer).replace(/�/g, '?');
        }
        
      } catch (error) {
        // Son çare olarak basit text okuma
        text = await file.text();
      }

      const data = parseExcelData(text);
      
      if (data.length === 0) {
        throw new Error('Dosyada veri bulunamadı');
      }

      setExcelData(data);

      // İlk iki sütunu otomatik seç
      if (columns.length >= 2) {
        setSelectedXAxis(columns[0]);
        setSelectedYAxis(columns[1]);
      }

    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setParseError(error.message || 'Dosya işlenirken hata oluştu');
      setExcelData([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Grafik verilerini optimize et
  const getChartData = useMemo(() => {
    if (!selectedXAxis || !selectedYAxis || excelData.length === 0) {
      return [];
    }

    return excelData
      .map(row => ({
        x: row[selectedXAxis],
        y: typeof row[selectedYAxis] === 'number' ? row[selectedYAxis] : parseFloat(String(row[selectedYAxis])) || 0,
        originalData: row
      }))
      .filter(item => item.x !== undefined && !isNaN(item.y))
      .slice(0, 1000); // Maksimum 1000 veri noktası
  }, [excelData, selectedXAxis, selectedYAxis]);

  const chartData = getChartData;
  const hasValidData = chartData.length > 0 && selectedXAxis && selectedYAxis;

  // İstatistikler
  const statistics = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const values = chartData.map(d => d.y);
    return {
      count: chartData.length,
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length
    };
  }, [chartData]);

  const renderChart = () => {
    if (chartData.length === 0) return null;

    const chartProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    const commonElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="x" 
          stroke="#6b7280"
          fontSize={11}
          angle={-45}
          textAnchor="end"
          height={80}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={11}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '12px'
          }}
          formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, selectedYAxis]}
          labelFormatter={(label) => `${selectedXAxis}: ${label}`}
        />
      </>
    );

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            {commonElements}
            <Bar dataKey="y" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...chartProps}>
            {commonElements}
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="y" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorArea)"
              strokeWidth={2}
            />
          </AreaChart>
        );
      default:
        return (
          <LineChart {...chartProps}>
            {commonElements}
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Upload Section */}
      <Card className="bg-card shadow-sm border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel Veri İçe Aktarma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isLoading ? 'İşleniyor...' : 'Excel Dosyası Seç'}
              </Button>
              {fileName && !isLoading && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  📁 {fileName}
                  {excelData.length > 0 && (
                    <span className="text-green-600 ml-2">
                      ✓ {excelData.length} satır yüklendi
                    </span>
                  )}
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />

            {parseError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                ⚠️ {parseError}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <strong>Desteklenen formatlar:</strong> CSV, TSV, TXT (Virgül, noktalı virgül veya tab ile ayrılmış)
              <br />
              <strong>Maksimum dosya boyutu:</strong> 5MB
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Configuration */}
      {excelData.length > 0 && (
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Grafik Yapılandırması
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">X Ekseni (Kategori)</label>
                <Select value={selectedXAxis} onValueChange={setSelectedXAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sütun seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Y Ekseni (Değer)</label>
                <Select value={selectedYAxis} onValueChange={setSelectedYAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sütun seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Grafik Tipi</label>
                <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'area') => setChartType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4" />
                        Çizgi Grafik
                      </div>
                    </SelectItem>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Sütun Grafik
                      </div>
                    </SelectItem>
                    <SelectItem value="area">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Alan Grafik
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Display */}
      {hasValidData && (
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              {selectedYAxis} - {selectedXAxis} Trend Analizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>

            {/* Data Summary */}
            {statistics && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {statistics.count}
                    </div>
                    <div className="text-sm text-muted-foreground">Toplam Veri</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {statistics.max.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Maksimum</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">
                      {statistics.min.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Minimum</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning">
                      {statistics.avg.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Ortalama</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {excelData.length === 0 && !isLoading && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">📊</div>
              <div>
                <h3 className="font-semibold mb-2">Excel Verilerinizi İçe Aktarın</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Excel dosyanızı yükleyin ve verimlilik, üretim veya kalite verilerinizi görselleştirin.
                  CSV, TSV veya tab/virgül ile ayrılmış dosyalar desteklenmektedir.
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  💡 İpucu: Dosyalarda Türkçe karakter sorunları yaşıyorsanız, dosyayı UTF-8 formatında kaydedin.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
