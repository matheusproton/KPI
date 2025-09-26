import sql from 'mssql';
import type { User, KpiData, ActionItem, ActivityLog } from '@shared/schema';

class Storage {
  private pool: sql.ConnectionPool | null = null;
  private useMemoryStorage = false;

  // In-memory storage for fallback
  private memoryUsers: User[] = [];
  private memoryKpiData: KpiData[] = [];
  private memoryActionItems: ActionItem[] = [];
  private memoryActivityLogs: ActivityLog[] = [];
  private memoryDepartments: any[] = [];

  // Memory storage for claims
  private memoryClaims: any[] = [];
  private memoryClaimComments: any[] = [];
  private memoryClaimWorkflow: any[] = [];
  private memoryClaimAttachments: any[] = [];

  private useDatabase = true; // Default to using the database

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      const config = {
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_DATABASE || 'factory_kpi_dashboard',
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'YourStrongPassword123!',
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        }
      };

      this.pool = new sql.ConnectionPool(config);
      await this.pool.connect();
      console.log('MSSQL bağlantısı başarılı');

      await this.createTables();
      await this.seedUsers();
    } catch (error) {
      console.error('MSSQL bağlantı hatası:', error);
      console.log('In-memory storage moduna geçiliyor...');
      this.useMemoryStorage = true;
      this.useDatabase = false; // Ensure we use memory if DB fails
      this.seedMemoryUsers();
    }
  }

  private seedMemoryUsers() {
    this.memoryUsers = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        permissions: [],
        isActive: true
      },
      {
        id: '2',
        username: 'safety1',
        password: 'safety123',
        name: 'Safety Manager',
        role: 'manager',
        permissions: ['Safety'],
        isActive: true
      },
      {
        id: '3',
        username: 'quality1',
        password: 'quality123',
        name: 'Quality Manager',
        role: 'manager',
        permissions: ['Quality'],
        isActive: true
      },
      {
        id: '4',
        username: 'production1',
        password: 'production123',
        name: 'Production Manager',
        role: 'manager',
        permissions: ['Production'],
        isActive: true
      },
      {
        id: '5',
        username: 'logistics1',
        password: 'logistics123',
        name: 'Logistics Manager',
        role: 'manager',
        permissions: ['Logistics'],
        isActive: true
      }
    ];

    // Varsayılan KPI verilerini oluştur
    this.memoryKpiData = [
      {
        id: '1',
        department: 'Safety',
        percentage: 95,
        target: 100,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        updatedBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { daysSinceIncident: 45 }
      },
      {
        id: '2',
        department: 'Quality',
        percentage: 88,
        target: 95,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        updatedBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { defectRate: 2.1 }
      },
      {
        id: '3',
        department: 'Production',
        percentage: 92,
        target: 100,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        updatedBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { actualProduction: 920, targetProduction: 1000 }
      },
      {
        id: '4',
        department: 'Logistics',
        percentage: 97,
        target: 100,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        updatedBy: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.memoryDepartments = [
      { id: 1, name: 'Güvenlik', description: 'İşçi sağlığı ve güvenliği departmanı', managerId: null, isActive: true },
      { id: 2, name: 'Kalite', description: 'Ürün kalite kontrol departmanı', managerId: null, isActive: true },
      { id: 3, name: 'Üretim', description: 'Üretim operasyonları departmanı', managerId: null, isActive: true },
      { id: 4, name: 'Lojistik', description: 'Tedarik zinciri ve lojistik departmanı', managerId: null, isActive: true }
    ];

    // Initialize memory storage for claims
    this.memoryClaims = [
      { 
        id: 'claim1', 
        customerName: 'ABC Corporation', 
        defectType: 'Kalite', 
        customerClaimNo: 'C2024001', 
        qualityAlarmNo: 'QA240001', 
        claimDate: new Date('2024-01-15'), 
        actions: 'Araştırma ve analiz', 
        gasClaimSapNo: 'SAP240001', 
        detectionLocation: 'Üretim Hattı A', 
        claimCreator: '1', 
        gasPartName: 'Valf Contası', 
        gasPartRefNo: 'VC-2024-001', 
        nokQuantity: 50, 
        claimType: 'QUALITY', 
        costAmount: 2500, 
        currency: 'EUR', 
        status: 'OPEN', 
        issueDescription: 'Valf contalarında sızıntı problemi tespit edildi', 
        ppmType: 'PPM-Q1', 
        claimRelatedDepartment: 'Quality', 
        customerRefNo: 'CRF240001', 
        gpqNo: 'GPQ240001', 
        gpqResponsiblePerson: 'Mehmet Yılmaz', 
        supplierName: 'Conta Endüstri A.Ş.', 
        hbrNo: 'HBR240001',
        priority: 'HIGH',
        createdAt: new Date('2024-01-15'), 
        updatedAt: new Date('2024-01-15') 
      },
      { 
        id: 'claim2', 
        customerName: 'XYZ Otomotiv Ltd.', 
        defectType: 'Üretim', 
        customerClaimNo: 'C2024002', 
        qualityAlarmNo: 'QA240002', 
        claimDate: new Date('2024-01-18'), 
        actions: 'Rework işlemi', 
        gasClaimSapNo: 'SAP240002', 
        detectionLocation: 'Üretim Hattı B', 
        claimCreator: '2', 
        gasPartName: 'Sensör Modülü', 
        gasPartRefNo: 'SM-2024-002', 
        nokQuantity: 25, 
        claimType: 'WARRANTY', 
        costAmount: 1800, 
        currency: 'TL', 
        status: 'UNDER_REVIEW', 
        issueDescription: 'Sensör modülünde kalibrasyon hatası', 
        ppmType: 'PPM-P1', 
        claimRelatedDepartment: 'Production', 
        customerRefNo: 'CRF240002', 
        gpqNo: 'GPQ240002', 
        gpqResponsiblePerson: 'Ayşe Kara', 
        supplierName: 'Elektronik Sistemler A.Ş.', 
        hbrNo: 'HBR240002',
        priority: 'MEDIUM',
        createdAt: new Date('2024-01-18'), 
        updatedAt: new Date('2024-01-18') 
      },
      { 
        id: 'claim3', 
        customerName: 'DEF Makina San.', 
        defectType: 'Lojistik', 
        customerClaimNo: 'C2024003', 
        qualityAlarmNo: 'QA240003', 
        claimDate: new Date('2024-01-20'), 
        actions: 'Acil teslimat', 
        gasClaimSapNo: 'SAP240003', 
        detectionLocation: 'Depo 1', 
        claimCreator: '4', 
        gasPartName: 'Motor Yatağı', 
        gasPartRefNo: 'MY-2024-003', 
        nokQuantity: 10, 
        claimType: 'DELIVERY', 
        costAmount: 3200, 
        currency: 'USD', 
        status: 'RESOLVED', 
        issueDescription: 'Geç teslimat nedeniyle üretim durması', 
        ppmType: 'PPM-L1', 
        claimRelatedDepartment: 'Logistics', 
        customerRefNo: 'CRF240003', 
        gpqNo: 'GPQ240003', 
        gpqResponsiblePerson: 'Can Demir', 
        supplierName: 'Yatak Sanayi Ltd.', 
        hbrNo: 'HBR240003',
        priority: 'CRITICAL',
        createdAt: new Date('2024-01-20'), 
        updatedAt: new Date('2024-01-22') 
      }
    ];
    this.memoryClaimComments = [
      { id: 'comment1', claimId: 'claim1', userId: 'User1', comment: 'Initial review done, pending further investigation.', createdAt: new Date('2023-10-26T10:00:00Z') },
      { id: 'comment2', claimId: 'claim1', userId: 'User2', comment: 'Escalated to engineering team.', createdAt: new Date('2023-10-26T14:30:00Z') },
    ];
    this.memoryClaimWorkflow = [
      { id: 'wf1', claimId: 'claim1', status: 'Open', changedAt: new Date('2023-10-26T09:00:00Z'), changedBy: 'User1' },
      { id: 'wf2', claimId: 'claim1', status: 'In Progress', changedAt: new Date('2023-10-26T11:00:00Z'), changedBy: 'User2' },
    ];
    this.memoryClaimAttachments = [
      { id: 'attach1', claimId: 'claim1', fileName: 'valve_leak.jpg', url: '/uploads/valve_leak.jpg', createdAt: new Date('2023-10-26') },
    ];

    console.log('In-memory demo kullanıcılar ve KPI verileri oluşturuldu');
  }

  async getAllProductionStations() {
    if (this.useMemoryStorage) {
      return [];
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .query(`
          SELECT ps.*, u.name as responsibleName
          FROM production_stations ps
          LEFT JOIN users u ON ps.responsible_id = u.id
          ORDER BY ps.name
        `);
      return result.recordset;
    } catch (error) {
      console.error('Get all production stations error:', error);
      return [];
    }
  }

  async createProductionStation(stationData: any) {
    if (this.useMemoryStorage) {
      const newStation = {
        id: (Math.random() * 1000).toString(),
        name: stationData.name,
        code: stationData.code,
        description: stationData.description,
        location: stationData.location,
        responsibleId: stationData.responsibleId,
        isActive: stationData.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return newStation;
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('name', sql.NVarChar, stationData.name)
        .input('code', sql.NVarChar, stationData.code)
        .input('description', sql.NVarChar, stationData.description || null)
        .input('location', sql.NVarChar, stationData.location || null)
        .input('responsible_id', sql.Int, stationData.responsibleId || null)
        .input('isActive', sql.Bit, stationData.isActive !== false)
        .query(`
          INSERT INTO production_stations (name, code, description, location, responsible_id, isActive)
          OUTPUT INSERTED.*
          VALUES (@name, @code, @description, @location, @responsible_id, @isActive)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Create production station error:', error);
      throw error;
    }
  }

  async updateProductionStation(id: string, updates: any) {
    if (this.useMemoryStorage) {
      return { ...updates, id, updatedAt: new Date() };
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('id', sql.Int, parseInt(id))
        .input('name', sql.NVarChar, updates.name)
        .input('code', sql.NVarChar, updates.code)
        .input('description', sql.NVarChar, updates.description || null)
        .input('location', sql.NVarChar, updates.location || null)
        .input('responsible_id', sql.Int, updates.responsibleId || null)
        .input('isActive', sql.Bit, updates.isActive)
        .query(`
          UPDATE production_stations 
          SET name = @name, code = @code, description = @description, 
              location = @location, responsible_id = @responsible_id, 
              isActive = @isActive, updated_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE id = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Update production station error:', error);
      throw error;
    }
  }

  async deleteProductionStation(id: string) {
    if (this.useMemoryStorage) {
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      // First delete related station KPIs
      await this.pool.request()
        .input('stationId', sql.Int, parseInt(id))
        .query('DELETE FROM station_kpis WHERE station_id = @stationId');

      // Then delete related station data entries
      await this.pool.request()
        .input('stationId', sql.Int, parseInt(id))
        .query('DELETE FROM station_data_entries WHERE station_id = @stationId');

      // Finally delete the production station
      const result = await this.pool.request()
        .input('id', sql.Int, parseInt(id))
        .query('DELETE FROM production_stations WHERE id = @id');
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Delete production station error:', error);
      return false;
    }
  }

  // Station Data Entries Management
  async getStationDataEntries(filters: {
    stationId?: string;
    dataType?: string;
    date?: Date;
    month?: number;
    year?: number;
  }) {
    if (this.useMemoryStorage) {
      return [];
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      let query = `
        SELECT sde.*, ps.name as station_name, ps.code as station_code,
               u1.username as reported_by_name, u2.username as assigned_to_name
        FROM station_data_entries sde
        JOIN production_stations ps ON sde.station_id = ps.id
        JOIN users u1 ON sde.reported_by = u1.id
        LEFT JOIN users u2 ON sde.assigned_to = u2.id
        WHERE 1=1
      `;

      const request = this.pool.request();

      if (filters.stationId) {
        query += ' AND sde.station_id = @stationId';
        request.input('stationId', sql.NVarChar, filters.stationId);
      }
      if (filters.dataType) {
        query += ' AND sde.data_type = @dataType';
        request.input('dataType', sql.NVarChar, filters.dataType);
      }
      if (filters.date) {
        query += ' AND CAST(sde.date AS DATE) = CAST(@date AS DATE)';
        request.input('date', sql.DateTime, filters.date);
      }
      if (filters.month && filters.year) {
        query += ' AND MONTH(sde.date) = @month AND YEAR(sde.date) = @year';
        request.input('month', sql.Int, filters.month);
        request.input('year', sql.Int, filters.year);
      }

      query += ' ORDER BY sde.created_at DESC';

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Get station data entries error:', error);
      return [];
    }
  }

  async createStationDataEntry(entryData: any) {
    if (this.useMemoryStorage) {
      return { id: Date.now().toString(), ...entryData };
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('station_id', sql.NVarChar, entryData.stationId)
        .input('date', sql.DateTime, entryData.date)
        .input('day', sql.Int, entryData.day)
        .input('data_type', sql.NVarChar, entryData.dataType)
        .input('event_type', sql.NVarChar, entryData.eventType)
        .input('description', sql.NVarChar, entryData.description)
        .input('severity', sql.NVarChar, entryData.severity)
        .input('status', sql.NVarChar, entryData.status)
        .input('reported_by', sql.NVarChar, entryData.reportedBy)
        .input('assigned_to', sql.NVarChar, entryData.assignedTo || null)
        .input('metadata', sql.NVarChar, JSON.stringify(entryData.metadata || {}))
        .query(`
          INSERT INTO station_data_entries 
          (station_id, date, day, data_type, event_type, description, severity, status, reported_by, assigned_to, metadata)
          OUTPUT INSERTED.*
          VALUES (@station_id, @date, @date, @data_type, @event_type, @description, @severity, @status, @reported_by, @assigned_to, @metadata)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Create station data entry error:', error);
      throw error;
    }
  }

  async updateStationDataEntry(id: string, updates: any) {
    if (this.useMemoryStorage) {
      return { id, ...updates };
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, id)
        .input('description', sql.NVarChar, updates.description || null)
        .input('severity', sql.NVarChar, updates.severity || null)
        .input('status', sql.NVarChar, updates.status || null)
        .input('assigned_to', sql.NVarChar, updates.assignedTo || null)
        .input('metadata', sql.NVarChar, JSON.stringify(updates.metadata || {}))
        .input('resolved_at', sql.DateTime, updates.resolvedAt || null)
        .query(`
          UPDATE station_data_entries 
          SET description = @description, severity = @severity, status = @status, 
              assigned_to = @assigned_to, metadata = @metadata, resolved_at = @resolved_at, 
              updated_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE id = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Update station data entry error:', error);
      throw error;
    }
  }

  async deleteStationDataEntry(id: string) {
    if (this.useMemoryStorage) {
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, id)
        .query('DELETE FROM station_data_entries WHERE id = @id');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Delete station data entry error:', error);
      throw error;
    }
  }

  // Station KPIs Management
  async getStationKPIs(stationId?: string) {
    if (this.useMemoryStorage) {
      return [];
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      let query = `
        SELECT skpi.*, ps.name as station_name, ps.code as station_code,
               u.username as updated_by_name
        FROM station_kpis skpi
        JOIN production_stations ps ON skpi.station_id = ps.id
        LEFT JOIN users u ON skpi.updated_by = u.id
      `;

      const request = this.pool.request();

      if (stationId) {
        query += ' WHERE skpi.station_id = @stationId';
        request.input('stationId', sql.Int, parseInt(stationId));
      }

      query += ' ORDER BY ps.name, skpi.category';

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Get station KPIs error:', error);
      return [];
    }
  }

  async createStationKPI(kpiData: any) {
    if (this.useMemoryStorage) {
      return {
        id: (Math.random() * 1000).toString(),
        ...kpiData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      // First check if KPI already exists
      const existingResult = await this.pool.request()
        .input('stationId', sql.Int, parseInt(kpiData.stationId))
        .input('category', sql.NVarChar, kpiData.category)
        .query(`
          SELECT * FROM station_kpis 
          WHERE station_id = @stationId AND category = @category
        `);

      if (existingResult.recordset.length > 0) {
        // KPI already exists, return the existing one
        console.log(`KPI already exists for station ${kpiData.stationId}, category ${kpiData.category}`);
        return existingResult.recordset[0];
      }

      // KPI doesn't exist, create new one
      const result = await this.pool.request()
        .input('stationId', sql.Int, parseInt(kpiData.stationId))
        .input('category', sql.NVarChar, kpiData.category)
        .input('title', sql.NVarChar, kpiData.title)
        .input('value', sql.Decimal(10, 2), kpiData.value)
        .input('target', sql.Decimal(10, 2), kpiData.target)
        .input('unit', sql.NVarChar, kpiData.unit || '%')
        .input('updatedBy', sql.Int, parseInt(kpiData.updatedBy))
        .query(`
          INSERT INTO station_kpis (station_id, category, title, value, target, unit, updated_by)
          OUTPUT INSERTED.*
          VALUES (@stationId, @category, @title, @value, @target, @unit, @updatedBy)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Create station KPI error:', error);
      throw error;
    }
  }

  async updateStationKPI(id: string, updates: any) {
    if (this.useMemoryStorage) {
      return { ...updates, id, updatedAt: new Date() };
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('id', sql.Int, parseInt(id))
        .input('title', sql.NVarChar, updates.title)
        .input('value', sql.Decimal(10, 2), updates.value)
        .input('target', sql.Decimal(10, 2), updates.target)
        .input('unit', sql.NVarChar, updates.unit || '%')
        .input('updatedBy', sql.Int, updates.updatedBy)
        .query(`
          UPDATE station_kpis 
          SET title = @title, value = @value, target = @target, 
              unit = @unit, updated_by = @updatedBy, updated_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE id = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Update station KPI error:', error);
      throw error;
    }
  }

  async deleteStationKPI(id: string) {
    if (this.useMemoryStorage) {
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('id', sql.Int, parseInt(id))
        .query('DELETE FROM station_kpis WHERE id = @id');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Delete station KPI error:', error);
      throw error;
    }
  }

  // Station Data Entries Management
  async getStationDataEntries(filters: {
    stationId?: string;
    dataType?: string;
    date?: Date;
    month?: number;
    year?: number;
  }) {
    if (this.useMemoryStorage) {
      return [];
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      let query = `
        SELECT sde.*, ps.name as station_name, ps.code as station_code,
               u1.username as reported_by_name, u2.username as assigned_to_name
        FROM station_data_entries sde
        JOIN production_stations ps ON sde.station_id = ps.id
        JOIN users u1 ON sde.reported_by = u1.id
        LEFT JOIN users u2 ON sde.assigned_to = u2.id
        WHERE 1=1
      `;

      const request = this.pool.request();

      if (filters.stationId) {
        query += ' AND sde.station_id = @stationId';
        request.input('stationId', sql.NVarChar, filters.stationId);
      }
      if (filters.dataType) {
        query += ' AND sde.data_type = @dataType';
        request.input('dataType', sql.NVarChar, filters.dataType);
      }
      if (filters.date) {
        query += ' AND CAST(sde.date AS DATE) = CAST(@date AS DATE)';
        request.input('date', sql.DateTime, filters.date);
      }
      if (filters.month && filters.year) {
        query += ' AND MONTH(sde.date) = @month AND YEAR(sde.date) = @year';
        request.input('month', sql.Int, filters.month);
        request.input('year', sql.Int, filters.year);
      }

      query += ' ORDER BY sde.created_at DESC';

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Get station data entries error:', error);
      return [];
    }
  }

  async createStationDataEntry(entryData: any) {
    if (this.useMemoryStorage) {
      return { id: Date.now().toString(), ...entryData };
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('station_id', sql.NVarChar, entryData.stationId)
        .input('date', sql.DateTime, entryData.date)
        .input('day', sql.Int, entryData.day)
        .input('data_type', sql.NVarChar, entryData.dataType)
        .input('event_type', sql.NVarChar, entryData.eventType)
        .input('description', sql.NVarChar, entryData.description)
        .input('severity', sql.NVarChar, entryData.severity)
        .input('status', sql.NVarChar, entryData.status)
        .input('reported_by', sql.NVarChar, entryData.reportedBy)
        .input('assigned_to', sql.NVarChar, entryData.assignedTo || null)
        .input('metadata', sql.NVarChar, JSON.stringify(entryData.metadata || {}))
        .query(`
          INSERT INTO station_data_entries 
          (station_id, date, day, data_type, event_type, description, severity, status, reported_by, assigned_to, metadata)
          OUTPUT INSERTED.*
          VALUES (@station_id, @date, @day, @data_type, @event_type, @description, @severity, @status, @reported_by, @assigned_to, @metadata)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Create station data entry error:', error);
      throw error;
    }
  }

  async updateStationDataEntry(id: string, updates: any) {
    if (this.useMemoryStorage) {
      return { id, ...updates };
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, id)
        .input('description', sql.NVarChar, updates.description || null)
        .input('severity', sql.NVarChar, updates.severity || null)
        .input('status', sql.NVarChar, updates.status || null)
        .input('assigned_to', sql.NVarChar, updates.assignedTo || null)
        .input('metadata', sql.NVarChar, JSON.stringify(updates.metadata || {}))
        .input('resolved_at', sql.DateTime, updates.resolvedAt || null)
        .query(`
          UPDATE station_data_entries 
          SET description = @description, severity = @severity, status = @status, 
              assigned_to = @assigned_to, metadata = @metadata, resolved_at = @resolved_at, 
              updated_at = GETDATE()
          OUTPUT INSERTED.*
          WHERE id = @id
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Update station data entry error:', error);
      throw error;
    }
  }

  async deleteStationDataEntry(id: string) {
    if (this.useMemoryStorage) {
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('id', sql.NVarChar, id)
        .query('DELETE FROM station_data_entries WHERE id = @id');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Delete station data entry error:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.pool) throw new Error('Database not connected');

    try {
      // Users table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
        CREATE TABLE users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(100) UNIQUE NOT NULL,
          password NVARCHAR(255) NOT NULL,
          department NVARCHAR(50) NOT NULL,
          role NVARCHAR(50) DEFAULT 'user',
          permissions NVARCHAR(MAX) DEFAULT '[]',
          created_at DATETIME2(7) DEFAULT GETDATE(),
          name NVARCHAR(255) DEFAULT '',
          isActive BIT DEFAULT 1
        )
      `);

      // KPI Data table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='kpi_data' AND xtype='U')
        CREATE TABLE kpi_data (
          id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
          department NVARCHAR(100) NOT NULL,
          percentage FLOAT NOT NULL,
          target FLOAT,
          month INT NOT NULL,
          year INT NOT NULL,
          updated_by NVARCHAR(50),
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (updated_by) REFERENCES users(id)
        )
      `);

      // Action Items table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='action_items' AND xtype='U')
        CREATE TABLE action_items (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          assignee NVARCHAR(100),
          department NVARCHAR(50) NOT NULL,
          priority NVARCHAR(20) DEFAULT 'medium',
          status NVARCHAR(20) DEFAULT 'open',
          due_date DATETIME2(7),
          created_at DATETIME2(7) DEFAULT GETDATE(),
          updated_at DATETIME2(7) DEFAULT GETDATE(),
          created_by INT,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Activity Logs table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='activity_logs' AND xtype='U')
        CREATE TABLE activity_logs (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT,
          action NVARCHAR(100) NOT NULL,
          details NVARCHAR(MAX),
          timestamp DATETIME2(7) DEFAULT GETDATE(),
          description NVARCHAR(500),
          created_at DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Check if description column exists in activity_logs table, if not add it
      const descriptionColumnExists = await this.pool.request().query(`
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'activity_logs' AND COLUMN_NAME = 'description'
      `);

      if (descriptionColumnExists.recordset[0].count === 0) {
        await this.pool.request().query(`
          ALTER TABLE activity_logs ADD description NVARCHAR(500)
        `);
        console.log('Description column added to activity_logs table');
      }

      // Ensure created_at column exists and has proper default values
      const createdAtColumnExists = await this.pool.request().query(`
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'activity_logs' AND COLUMN_NAME = 'created_at'
      `);

      if (createdAtColumnExists.recordset[0].count === 0) {
        await this.pool.request().query(`
          ALTER TABLE activity_logs ADD created_at DATETIME DEFAULT GETDATE()
        `);
        console.log('Created_at column added to activity_logs table');
      }

      // Update NULL created_at values with current timestamp
      await this.pool.request().query(`
        UPDATE activity_logs 
        SET created_at = GETDATE() 
        WHERE created_at IS NULL
      `);

      // Ensure the created_at column has a default constraint
      await this.pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM sys.default_constraints 
          WHERE parent_object_id = OBJECT_ID('activity_logs') 
          AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('activity_logs'), 'created_at', 'ColumnId')
        )
        BEGIN
          ALTER TABLE activity_logs ADD CONSTRAINT DF_activity_logs_created_at DEFAULT GETDATE() FOR created_at
        END
      `);

      // Departments table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='departments' AND xtype='U')
        CREATE TABLE departments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL UNIQUE,
          description NVARCHAR(500),
          manager_id INT,
          isActive BIT DEFAULT 1,
          created_at DATETIME2(7) DEFAULT GETDATE(),
          updated_at DATETIME2(7) DEFAULT GETDATE(),
          FOREIGN KEY (manager_id) REFERENCES users(id)
        )
      `);

      // Claims table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='claims' AND xtype='U')
        CREATE TABLE claims (
          id INT IDENTITY(1,1) PRIMARY KEY,
          customer_name NVARCHAR(255) NOT NULL,
          defect_type NVARCHAR(100),
          customer_claim_no NVARCHAR(100) UNIQUE,
          quality_alarm_no NVARCHAR(100),
          claim_date DATETIME2(7),
          actions NVARCHAR(MAX),
          gas_claim_sap_no NVARCHAR(100),
          detection_location NVARCHAR(255),
          claim_creator NVARCHAR(100),
          gas_part_name NVARCHAR(255),
          gas_part_ref_no NVARCHAR(100),
          nok_quantity INT,
          claim_type NVARCHAR(100),
          cost_amount FLOAT,
          currency NVARCHAR(10) DEFAULT 'USD',
          status NVARCHAR(50) NOT NULL DEFAULT 'Open',
          issue_description NVARCHAR(MAX),
          ppm_type NVARCHAR(100),
          claim_related_department NVARCHAR(100),
          customer_ref_no NVARCHAR(100),
          gpq_no NVARCHAR(100),
          gpq_responsible_person NVARCHAR(100),
          supplier_name NVARCHAR(255),
          hbr_no NVARCHAR(100),
          priority NVARCHAR(50) DEFAULT 'MEDIUM',
          created_at DATETIME2(7) DEFAULT GETDATE(),
          updated_at DATETIME2(7) DEFAULT GETDATE()
        )
      `);

      // Claim Comments table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='claim_comments' AND xtype='U')
        CREATE TABLE claim_comments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          claim_id INT NOT NULL,
          user_id INT,
          comment NVARCHAR(MAX) NOT NULL,
          created_at DATETIME2(7) DEFAULT GETDATE(),
          FOREIGN KEY (claim_id) REFERENCES claims(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Claim Workflow table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='claim_workflow' AND xtype='U')
        CREATE TABLE claim_workflow (
          id INT IDENTITY(1,1) PRIMARY KEY,
          claim_id INT NOT NULL,
          status NVARCHAR(50) NOT NULL,
          changed_at DATETIME2(7) DEFAULT GETDATE(),
          changed_by INT,
          FOREIGN KEY (claim_id) REFERENCES claims(id),
          FOREIGN       KEY (changed_by) REFERENCES users(id)
        )
      `);

      // Claim Attachments table
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='claim_attachments' AND xtype='U')
        CREATE TABLE claim_attachments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          claim_id INT NOT NULL,
          file_name NVARCHAR(255) NOT NULL,
          file_path NVARCHAR(500) NOT NULL,
          uploaded_by INT,
          uploaded_at DATETIME2(7) DEFAULT GETDATE(),
          FOREIGN KEY (claim_id) REFERENCES claims(id),
          FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
      `);

      // Production Stations table (added to ensure it exists)
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='production_stations' AND xtype='U')
        CREATE TABLE production_stations (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          code NVARCHAR(100) UNIQUE NOT NULL,
          description NVARCHAR(MAX),
          location NVARCHAR(255),
          responsible_id INT,
          isActive BIT DEFAULT 1,
          created_at DATETIME2(7) DEFAULT GETDATE(),
          updated_at DATETIME2(7) DEFAULT GETDATE(),
          FOREIGN KEY (responsible_id) REFERENCES users(id)
        )
      `);

      // Station Data Entries table (added to ensure it exists)
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='station_data_entries' AND xtype='U')
        CREATE TABLE station_data_entries (
          id INT IDENTITY(1,1) PRIMARY KEY,
          station_id INT NOT NULL,
          date DATETIME2(7) NOT NULL,
          day INT,
          data_type NVARCHAR(100),
          event_type NVARCHAR(100),
          description NVARCHAR(MAX),
          severity NVARCHAR(50),
          status NVARCHAR(50),
          reported_by INT,
          assigned_to INT,
          metadata NVARCHAR(MAX),
          resolved_at DATETIME2(7),
          created_at DATETIME2(7) DEFAULT GETDATE(),
          updated_at DATETIME2(7) DEFAULT GETDATE(),
          FOREIGN KEY (station_id) REFERENCES production_stations(id),
          FOREIGN KEY (reported_by) REFERENCES users(id),
          FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
      `);
      
      // Station KPIs table (added to ensure it exists)
      await this.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='station_kpis' AND xtype='U')
        CREATE TABLE station_kpis (
          id INT IDENTITY(1,1) PRIMARY KEY,
          station_id INT NOT NULL,
          category NVARCHAR(100) NOT NULL,
          title NVARCHAR(255) NOT NULL,
          value DECIMAL(10, 2),
          target DECIMAL(10, 2),
          unit NVARCHAR(20) DEFAULT '%',
          updated_by INT,
          created_at DATETIME2(7) DEFAULT GETDATE(),
          updated_at DATETIME2(7) DEFAULT GETDATE(),
          FOREIGN KEY (station_id) REFERENCES production_stations(id),
          FOREIGN KEY (updated_by) REFERENCES users(id)
        )
      `);


      console.log('Tablolar başarıyla oluşturuldu');
    } catch (error) {
      console.error('Tablo oluşturma hatası:', error);
    }
  }

  private async seedUsers() {
    if (!this.pool) throw new Error('Database not connected');

    try {
      const existingUsers = await this.pool.request()
        .query('SELECT COUNT(*) as count FROM users');

      if (existingUsers.recordset[0].count === 0) {
        const users = [
          { username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin', department: 'Management' },
          { username: 'safety1', password: 'safety123', name: 'Safety Manager', role: 'manager', department: 'Safety' },
          { username: 'quality1', password: 'quality123', name: 'Quality Manager', role: 'manager', department: 'Quality' },
          { username: 'production1', password: 'production123', name: 'Production Manager', role: 'manager', department: 'Production' },
          { username: 'logistics1', password: 'logistics123', name: 'Logistics Manager', role: 'manager', department: 'Logistics' }
        ];

        for (const user of users) {
          await this.pool.request()
            .input('username', sql.NVarChar, user.username)
            .input('password', sql.NVarChar, user.password)
            .input('name', sql.NVarChar, user.name)
            .input('role', sql.NVarChar, user.role)
            .input('department', sql.NVarChar, user.department)
            .query(`
              INSERT INTO users (username, password, name, role, department)
              VALUES (@username, @password, @name, @role, @department)
            `);
        }
        console.log('Demo kullanıcılar oluşturuldu');
      }

      // Seed departments
      const existingDepartments = await this.pool.request()
        .query('SELECT COUNT(*) as count FROM departments');

      if (existingDepartments.recordset[0].count === 0) {
        const departments = [
          { name: 'Güvenlik', description: 'İşçi sağlığı ve güvenliği departmanı' },
          { name: 'Kalite', description: 'Ürün kalite kontrol departmanı' },
          { name: 'Üretim', description: 'Üretim operasyonları departmanı' },
          { name: 'Lojistik', description: 'Tedarik zinciri ve lojistik departmanı' }
        ];

        for (const dept of departments) {
          await this.pool.request()
            .input('name', sql.NVarChar, dept.name)
            .input('description', sql.NVarChar, dept.description)
            .query(`
              INSERT INTO departments (name, description)
              VALUES (@name, @description)
            `);
        }
        console.log('Demo bölümler oluşturuldu');
      }
    } catch (error) {
      console.error('Kullanıcı seed hatası:', error);
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (this.useMemoryStorage) {
      return this.memoryUsers.find(u => u.username === username) || null;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username');

    const user = result.recordset[0];
    if (user) {
      // Convert id to string for consistency
      user.id = user.id.toString();
    }

    return user || null;
  }

  async getUser(id: string): Promise<User | null> {
    if (this.useMemoryStorage) {
      return this.memoryUsers.find(u => u.id === id) || null;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('SELECT id, username, password, name, role, permissions, isActive FROM users WHERE id = @id');

    const user = result.recordset[0];
    if (user) {
      // Convert id to string for consistency
      user.id = user.id.toString();
    }

    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    if (this.useMemoryStorage) {
      return [...this.memoryUsers]; // Return all users, including inactive ones for admin
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .query('SELECT id, username, password, name, role, permissions, isActive FROM users ORDER BY name');

    // Convert MSSQL field names to TypeScript interface format
    return result.recordset.map(user => ({
      id: user.id.toString(),
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      isActive: Boolean(user.isActive) // Convert BIT (1/0) to boolean
    }));
  }

  async createUser(userData: any): Promise<User> {
    if (this.useMemoryStorage) {
      const newUser = {
        id: (this.memoryUsers.length + 1).toString(),
        username: userData.username,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions || [],
        isActive: userData.isActive !== false
      };
      this.memoryUsers.push(newUser);
      return newUser;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('username', sql.NVarChar, userData.username)
      .input('password', sql.NVarChar, userData.password)
      .input('name', sql.NVarChar, userData.name)
      .input('role', sql.NVarChar, userData.role)
      .input('permissions', sql.NVarChar, JSON.stringify(userData.permissions || []))
      .input('isActive', sql.Bit, userData.isActive !== false)
      .query(`
        INSERT INTO users (username, password, name, role, permissions, isActive)
        OUTPUT INSERTED.*
        VALUES (@username, @password, @name, @role, @permissions, @isActive)
      `);

    const user = result.recordset[0];
    return {
      id: user.id.toString(),
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
      isActive: Boolean(user.isActive)
    };
  }

  async updateUser(id: string, updates: any): Promise<User | null> {
    if (this.useMemoryStorage) {
      const userIndex = this.memoryUsers.findIndex(u => u.id === id);
      if (userIndex === -1) return null;

      const updatedUser = {
        ...this.memoryUsers[userIndex],
        ...updates
      };

      // Don't update password if it's empty
      if (!updates.password) {
        updatedUser.password = this.memoryUsers[userIndex].password;
      }

      this.memoryUsers[userIndex] = updatedUser;
      return updatedUser;
    }

    if (!this.pool) throw new Error('Database not connected');

    let query = 'UPDATE users SET ';
    const request = this.pool.request().input('id', sql.Int, parseInt(id));
    const setParts = [];

    if (updates.name !== undefined) {
      setParts.push('name = @name');
      request.input('name', sql.NVarChar, updates.name);
    }
    if (updates.role !== undefined) {
      setParts.push('role = @role');
      request.input('role', sql.NVarChar, updates.role);
    }
    if (updates.permissions !== undefined) {
      setParts.push('permissions = @permissions');
      request.input('permissions', sql.NVarChar, JSON.stringify(updates.permissions));
    }
    if (updates.isActive !== undefined) {
      setParts.push('isActive = @isActive');
      request.input('isActive', sql.Bit, updates.isActive);
    }
    if (updates.password && updates.password.trim() !== '') {
      setParts.push('password = @password');
      request.input('password', sql.NVarChar, updates.password);
    }

    if (setParts.length === 0) {
      return this.getUser(id);
    }

    query += setParts.join(', ') + ' OUTPUT INSERTED.* WHERE id = @id';

    const result = await request.query(query);

    if (result.recordset.length === 0) return null;

    const user = result.recordset[0];
    return {
      id: user.id.toString(),
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
      isActive: Boolean(user.isActive)
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.useMemoryStorage) {
      const userIndex = this.memoryUsers.findIndex(u => u.id === id);
      if (userIndex === -1) return false;

      this.memoryUsers.splice(userIndex, 1);
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM users WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<boolean> {
    if (this.useMemoryStorage) {
      const userIndex = this.memoryUsers.findIndex(u => u.id === id);
      if (userIndex === -1) return false;

      this.memoryUsers[userIndex].password = hashedPassword;
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('password', sql.NVarChar, hashedPassword)
      .query('UPDATE users SET password = @password WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }



  async createKpiData(data: any): Promise<KpiData> {
    if (this.useMemoryStorage) {
      const newKpi: KpiData = {
        id: Date.now().toString(),
        department: data.department,
        percentage: data.percentage,
        target: data.target,
        month: data.month,
        year: data.year,
        updatedBy: data.updatedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: data.metadata || {}
      };
      this.memoryKpiData.unshift(newKpi);
      return newKpi;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('department', sql.NVarChar, data.department)
      .input('percentage', sql.Float, data.percentage)
      .input('target', sql.Float, data.target)
      .input('month', sql.Int, data.month)
      .input('year', sql.Int, data.year)
      .input('updated_by', sql.NVarChar, data.updatedBy)
      .query(`
        INSERT INTO kpi_data (department, percentage, target, month, year, updated_by)
        OUTPUT INSERTED.*
        VALUES (@department, @percentage, @target, @month, @year, @updated_by)
      `);

    return result.recordset[0];
  }

  async getKpiData(department?: string, startDate?: Date, endDate?: Date): Promise<KpiData[]> {
    if (this.useMemoryStorage) {
      let filteredKpiData = this.memoryKpiData;

      if (department) {
        filteredKpiData = filteredKpiData.filter(kpi => kpi.department === department);
      }

      if (startDate && endDate) {
        filteredKpiData = filteredKpiData.filter(kpi =>
          kpi.createdAt >= startDate && kpi.createdAt <= endDate
        );
      }

      return filteredKpiData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    if (!this.pool) throw new Error('Database not connected');

    let query = 'SELECT * FROM kpi_data WHERE 1=1';
    const request = this.pool.request();

    if (department) {
      query += ' AND department = @department';
      request.input('department', sql.NVarChar, department);
    }

    if (startDate && endDate) {
      query += ' AND created_at BETWEEN @startDate AND @endDate';
      request.input('startDate', sql.DateTime, startDate);
      request.input('endDate', sql.DateTime, endDate);
    }

    query += ' ORDER BY created_at DESC';

    const result = await request.query(query);
    return result.recordset;
  }

  async getLatestKpiData(department: string): Promise<any> {
    if (this.useMemoryStorage) {
      const latestData = this.memoryKpiData
        .filter(kpi => kpi.department === department)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      return latestData || {
        department: department,
        percentage: department === 'Safety' ? 95 : department === 'Quality' ? 88 : department === 'Production' ? 92 : 97,
        target: 100,
        metadata: department === 'Safety' ? { daysSinceIncident: 45 } :
                 department === 'Quality' ? { defectRate: 2.1 } :
                 department === 'Production' ? { actualProduction: 920, targetProduction: 1000 } : {}
      };
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('department', sql.NVarChar, department)
      .query(`
        SELECT TOP 1 * FROM kpi_data
        WHERE department = @department
        ORDER BY updated_at DESC
      `);

    return result.recordset[0] || { percentage: 0 };
  }

  async createActionItem(data: any): Promise<ActionItem> {
    if (this.useMemoryStorage) {
      const actionItem: ActionItem = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        department: data.department,
        assigneeId: data.assigneeId,
        status: data.status || 'open',
        priority: data.priority || 'medium',
        dueDate: data.dueDate,
        createdBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.memoryActionItems.unshift(actionItem);
      return actionItem;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('title', sql.NVarChar, data.title)
      .input('description', sql.NVarChar, data.description)
      .input('department', sql.NVarChar, data.department)
      .input('assignee', sql.NVarChar, data.assigneeId)
      .input('status', sql.NVarChar, data.status || 'open')
      .input('priority', sql.NVarChar, data.priority || 'medium')
      .input('due_date', sql.DateTime, data.dueDate)
      .input('created_by', sql.Int, parseInt(data.createdBy))
      .query(`
        INSERT INTO action_items (title, description, department, assignee, status, priority, due_date, created_by)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @department, @assignee, @status, @priority, @due_date, @created_by)
      `);

    return result.recordset[0];
  }

  async getActionItems(filters: any = {}): Promise<ActionItem[]> {
    if (this.useMemoryStorage) {
      let filteredActions = this.memoryActionItems;

      if (filters.department) {
        filteredActions = filteredActions.filter(action => action.department === filters.department);
      }

      if (filters.status) {
        filteredActions = filteredActions.filter(action => action.status === filters.status);
      }

      if (filters.assigneeId) {
        filteredActions = filteredActions.filter(action => action.assigneeId === filters.assigneeId);
      }

      return filteredActions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      let query = `SELECT
        id,
        title,
        description,
        department,
        assignee as assigneeId,
        status,
        priority,
        due_date as dueDate,
        created_by as createdBy,
        created_at as createdAt,
        updated_at as updatedAt
      FROM action_items WHERE 1=1`;
      const request = this.pool.request();

      if (filters.department) {
        query += ' AND department = @department';
        request.input('department', sql.NVarChar, filters.department);
      }

      if (filters.status) {
        query += ' AND status = @status';
        request.input('status', sql.NVarChar, filters.status);
      }

      if (filters.assigneeId) {
        query += ' AND assignee = @assigneeId';
        request.input('assigneeId', sql.NVarChar, filters.assigneeId);
      }

      query += ' ORDER BY created_at DESC';

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Action items fetch error:', error);
      // Return empty array to prevent application failure
      return [];
    }
  }

  async getActionItem(id: string): Promise<ActionItem | null> {
    if (this.useMemoryStorage) {
      return this.memoryActionItems.find(action => action.id === id) || null;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`SELECT
        id,
        title,
        description,
        department,
        assignee as assigneeId,
        status,
        priority,
        due_date as dueDate,
        created_by as createdBy,
        created_at as createdAt,
        updated_at as updatedAt
      FROM action_items WHERE id = @id`);

    return result.recordset[0] || null;
  }

  async updateActionItem(id: string, updates: any): Promise<ActionItem | null> {
    if (this.useMemoryStorage) {
      const actionIndex = this.memoryActionItems.findIndex(action => action.id === id);
      if (actionIndex === -1) return null;

      this.memoryActionItems[actionIndex] = {
        ...this.memoryActionItems[actionIndex],
        ...updates,
        updatedAt: new Date()
      };
      return this.memoryActionItems[actionIndex];
    }

    if (!this.pool) throw new Error('Database not connected');

    // Dynamically build the SET clause and parameters
    const request = this.pool.request().input('id', sql.NVarChar, id);
    const setClauses: string[] = [];
    let updateQuery = 'UPDATE action_items SET ';

    if (updates.title !== undefined) {
      setClauses.push('title = @title');
      request.input('title', sql.NVarChar, updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = @description');
      request.input('description', sql.NVarChar, updates.description);
    }
    if (updates.department !== undefined) {
      setClauses.push('department = @department');
      request.input('department', sql.NVarChar, updates.department);
    }
    if (updates.assigneeId !== undefined) {
      setClauses.push('assignee = @assignee');
      request.input('assignee', sql.NVarChar, updates.assigneeId);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar, updates.status);
    }
    if (updates.priority !== undefined) {
      setClauses.push('priority = @priority');
      request.input('priority', sql.NVarChar, updates.priority);
    }
    if (updates.dueDate !== undefined) {
      setClauses.push('due_date = @due_date');
      request.input('due_date', sql.DateTime, updates.dueDate);
    }

    if (setClauses.length === 0) {
      return this.getActionItem(id); // No updates, return current item
    }

    updateQuery += setClauses.join(', ') + ', updated_at = GETDATE() WHERE id = @id';
    updateQuery += ' OUTPUT INSERTED.*';

    const result = await request.query(updateQuery);

    return result.recordset[0] || null;
  }

  async deleteActionItem(id: string): Promise<boolean> {
    if (this.useMemoryStorage) {
      const actionIndex = this.memoryActionItems.findIndex(action => action.id === id);
      if (actionIndex === -1) return false;

      this.memoryActionItems.splice(actionIndex, 1);
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('id', sql.NVarChar, id)
      .query('DELETE FROM action_items WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }

  async createActivityLog(data: any): Promise<ActivityLog> {
    if (this.useMemoryStorage) {
      const log: ActivityLog = {
        id: Date.now().toString(),
        userId: data.userId,
        action: data.action,
        description: data.description,
        timestamp: new Date()
      };
      this.memoryActivityLogs.unshift(log);
      return log;
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      const result = await this.pool.request()
        .input('user_id', sql.Int, parseInt(data.userId))
        .input('action', sql.NVarChar, data.action)
        .input('description', sql.NVarChar, data.description || '')
        .input('details', sql.NVarChar, data.description || '') // Assuming details can be same as description
        .query(`
          INSERT INTO activity_logs (user_id, action, description, details)
          OUTPUT INSERTED.id, INSERTED.user_id as userId, INSERTED.action, INSERTED.description, INSERTED.timestamp
          VALUES (@user_id, @action, @description, @details)
        `);

      const inserted = result.recordset[0];
      return {
        id: inserted.id.toString(),
        userId: inserted.userId.toString(),
        action: inserted.action,
        description: inserted.description,
        timestamp: inserted.timestamp
      };
    } catch (error) {
      console.error('Activity log creation error:', error);
      // Return a mock object to prevent application failure
      return {
        id: Date.now().toString(),
        userId: data.userId,
        action: data.action,
        description: data.description || '',
        timestamp: new Date()
      };
    }
  }

  async getActivityLogs(userId?: string, limit: number = 50): Promise<ActivityLog[]> {
    if (this.useMemoryStorage) {
      let filteredLogs = this.memoryActivityLogs;

      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      return filteredLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    if (!this.pool) throw new Error('Database not connected');

    try {
      let query = `SELECT TOP ${limit}
        id,
        user_id as userId,
        action,
        ISNULL(description, '') as description,
        ISNULL(timestamp, GETDATE()) as timestamp
        FROM activity_logs
        WHERE timestamp IS NOT NULL`;

      const request = this.pool.request();

      if (userId) {
        query += ' AND user_id = @userId';
        request.input('userId', sql.Int, parseInt(userId));
      }

      query += ' ORDER BY timestamp DESC';

      const result = await request.query(query);
      return result.recordset.map(row => ({
        id: row.id.toString(),
        userId: row.userId.toString(),
        action: row.action,
        description: row.description || '',
        timestamp: row.timestamp || new Date()
      }));
    } catch (error) {
      console.error('Activity logs fetch error:', error);
      // Return sample data to prevent application failure
      return [
        {
          id: '1',
          userId: '1',
          action: 'login',
          description: 'Admin User logged in',
          timestamp: new Date()
        }
      ];
    }
  }

  // Department management methods
  async getAllDepartments(): Promise<any[]> {
    if (this.useMemoryStorage) {
      return this.memoryDepartments.map(dept => {
        const manager = this.memoryUsers.find(u => u.id === dept.managerId?.toString());
        return {
          ...dept,
          managerName: manager?.name || null
        };
      });
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .query(`
        SELECT
          d.id,
          d.name,
          d.description,
          d.manager_id as managerId,
          u.name as managerName,
          d.isActive,
          d.created_at as createdAt,
          d.updated_at as updatedAt
        FROM departments d
        LEFT JOIN users u ON d.manager_id = u.id
        ORDER BY d.name
      `);

    return result.recordset.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      managerId: dept.managerId,
      managerName: dept.managerName,
      isActive: Boolean(dept.isActive),
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt
    }));
  }

  async createDepartment(departmentData: any): Promise<any> {
    if (this.useMemoryStorage) {
      const newDepartment = {
        id: this.memoryDepartments.length + 1,
        name: departmentData.name,
        description: departmentData.description,
        managerId: departmentData.managerId,
        isActive: departmentData.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.memoryDepartments.push(newDepartment);

      const manager = this.memoryUsers.find(u => u.id === newDepartment.managerId?.toString());
      return {
        ...newDepartment,
        managerName: manager?.name || null
      };
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('name', sql.NVarChar, departmentData.name)
      .input('description', sql.NVarChar, departmentData.description || null)
      .input('managerId', sql.Int, departmentData.managerId || null)
      .input('isActive', sql.Bit, departmentData.isActive !== false)
      .query(`
        INSERT INTO departments (name, description, manager_id, isActive)
        OUTPUT INSERTED.*, (SELECT name FROM users WHERE id = INSERTED.manager_id) as managerName
        VALUES (@name, @description, @managerId, @isActive)
      `);

    const dept = result.recordset[0];
    return {
      id: dept.id,
      name: dept.name,
      description: dept.description,
      managerId: dept.manager_id,
      managerName: dept.managerName,
      isActive: Boolean(dept.isActive),
      createdAt: dept.created_at,
      updatedAt: dept.updated_at
    };
  }

  async updateDepartment(id: string, updates: any): Promise<any | null> {
    if (this.useMemoryStorage) {
      const deptIndex = this.memoryDepartments.findIndex(d => d.id === parseInt(id));
      if (deptIndex === -1) return null;

      this.memoryDepartments[deptIndex] = {
        ...this.memoryDepartments[deptIndex],
        ...updates,
        updatedAt: new Date()
      };

      const manager = this.memoryUsers.find(u => u.id === this.memoryDepartments[deptIndex].managerId?.toString());
      return {
        ...this.memoryDepartments[deptIndex],
        managerName: manager?.name || null
      };
    }

    if (!this.pool) throw new Error('Database not connected');

    let query = 'UPDATE departments SET ';
    const request = this.pool.request().input('id', sql.Int, parseInt(id));
    const setParts = [];

    if (updates.name !== undefined) {
      setParts.push('name = @name');
      request.input('name', sql.NVarChar, updates.name);
    }
    if (updates.description !== undefined) {
      setParts.push('description = @description');
      request.input('description', sql.NVarChar, updates.description);
    }
    if (updates.managerId !== undefined) {
      setParts.push('manager_id = @managerId');
      request.input('managerId', sql.Int, updates.managerId);
    }
    if (updates.isActive !== undefined) {
      setParts.push('isActive = @isActive');
      request.input('isActive', sql.Bit, updates.isActive);
    }

    if (setParts.length === 0) {
      return null;
    }

    setParts.push('updated_at = GETDATE()');
    query += setParts.join(', ') + ' WHERE id = @id';

    await request.query(query);

    // Get updated department with manager name
    const result = await this.pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT
          d.id,
          d.name,
          d.description,
          d.manager_id as managerId,
          u.name as managerName,
          d.isActive,
          d.created_at as createdAt,
          d.updated_at as updatedAt
        FROM departments d
        LEFT JOIN users u ON d.manager_id = u.id
        WHERE d.id = @id
      `);

    if (result.recordset.length === 0) return null;

    const dept = result.recordset[0];
    return {
      id: dept.id,
      name: dept.name,
      description: dept.description,
      managerId: dept.managerId,
      managerName: dept.managerName,
      isActive: Boolean(dept.isActive),
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt
    };
  }

  async deleteDepartment(id: string): Promise<boolean> {
    if (this.useMemoryStorage) {
      const deptIndex = this.memoryDepartments.findIndex(d => d.id === parseInt(id));
      if (deptIndex === -1) return false;

      this.memoryDepartments.splice(deptIndex, 1);
      return true;
    }

    if (!this.pool) throw new Error('Database not connected');

    const result = await this.pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM departments WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }

  // Claims Management
  async getAllClaims() {
    if (!this.useDatabase) {
      return this.memoryClaims || [];
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request().query(`
        SELECT 
          id,
          customer_name as customerName,
          defect_type as defectType,
          customer_claim_no as customerClaimNo,
          quality_alarm_no as qualityAlarmNo,
          claim_date as claimDate,
          actions,
          gas_claim_sap_no as gasClaimSapNo,
          detection_location as detectionLocation,
          claim_creator as claimCreator,
          gas_part_name as gasPartName,
          gas_part_ref_no as gasPartRefNo,
          nok_quantity as nokQuantity,
          claim_type as claimType,
          cost_amount as costAmount,
          currency,
          status,
          issue_description as issueDescription,
          ppm_type as ppmType,
          claim_related_department as claimRelatedDepartment,
          customer_ref_no as customerRefNo,
          gpq_no as gpqNo,
          gpq_responsible_person as gpqResponsiblePerson,
          supplier_name as supplierName,
          hbr_no as hbrNo,
          priority,
          created_at as createdAt,
          updated_at as updatedAt
        FROM claims 
        ORDER BY claim_date DESC
      `);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching all claims:', error);
      return [];
    }
  }

  async createClaim(claimData: any) {
    if (!this.useDatabase) {
      const claim = {
        id: Math.random().toString(36).substr(2, 9),
        ...claimData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!this.memoryClaims) {
        this.memoryClaims = [];
      }

      this.memoryClaims.push(claim);
      return claim;
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('customer_name', sql.NVarChar, claimData.customerName)
        .input('defect_type', sql.NVarChar, claimData.defectType)
        .input('customer_claim_no', sql.NVarChar, claimData.customerClaimNo)
        .input('quality_alarm_no', sql.NVarChar, claimData.qualityAlarmNo)
        .input('claim_date', sql.DateTime, claimData.claimDate)
        .input('actions', sql.NVarChar, claimData.actions)
        .input('gas_claim_sap_no', sql.NVarChar, claimData.gasClaimSapNo)
        .input('detection_location', sql.NVarChar, claimData.detectionLocation)
        .input('claim_creator', sql.NVarChar, claimData.claimCreator)
        .input('gas_part_name', sql.NVarChar, claimData.gasPartName)
        .input('gas_part_ref_no', sql.NVarChar, claimData.gasPartRefNo)
        .input('nok_quantity', sql.Int, claimData.nokQuantity)
        .input('claim_type', sql.NVarChar, claimData.claimType)
        .input('cost_amount', sql.Float, claimData.costAmount)
        .input('currency', sql.NVarChar, claimData.currency || 'USD')
        .input('status', sql.NVarChar, claimData.status || 'Open')
        .input('issue_description', sql.NVarChar, claimData.issueDescription)
        .input('ppm_type', sql.NVarChar, claimData.ppmType)
        .input('claim_related_department', sql.NVarChar, claimData.claimRelatedDepartment)
        .input('customer_ref_no', sql.NVarChar, claimData.customerRefNo)
        .input('gpq_no', sql.NVarChar, claimData.gpqNo)
        .input('gpq_responsible_person', sql.NVarChar, claimData.gpqResponsiblePerson)
        .input('supplier_name', sql.NVarChar, claimData.supplierName)
        .input('hbr_no', sql.NVarChar, claimData.hbrNo)
        .input('priority', sql.NVarChar, claimData.priority || 'MEDIUM')
        .query(`
          INSERT INTO claims (
            customer_name, defect_type, customer_claim_no, quality_alarm_no, claim_date, actions,
            gas_claim_sap_no, detection_location, claim_creator, gas_part_name, gas_part_ref_no,
            nok_quantity, claim_type, cost_amount, currency, status, issue_description, ppm_type,
            claim_related_department, customer_ref_no, gpq_no, gpq_responsible_person, supplier_name, hbr_no, priority
          )
          OUTPUT INSERTED.*
          VALUES (
            @customer_name, @defect_type, @customer_claim_no, @quality_alarm_no, @claim_date, @actions,
            @gas_claim_sap_no, @detection_location, @claim_creator, @gas_part_name, @gas_part_ref_no,
            @nok_quantity, @claim_type, @cost_amount, @currency, @status, @issue_description, @ppm_type,
            @claim_related_department, @customer_ref_no, @gpq_no, @gpq_responsible_person, @supplier_name, @hbr_no, @priority
          )
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  }

  async updateClaim(claimId: string, updateData: any) {
    if (!this.useDatabase) {
      const claimIndex = this.memoryClaims?.findIndex(c => c.id === claimId);
      if (claimIndex && claimIndex !== -1 && this.memoryClaims) {
        this.memoryClaims[claimIndex] = { ...this.memoryClaims[claimIndex], ...updateData, updatedAt: new Date().toISOString() };
        return this.memoryClaims[claimIndex];
      }
      throw new Error('Claim not found');
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      // First update the record
      await this.pool.request()
        .input('id', sql.Int, parseInt(claimId))
        .input('customer_name', sql.NVarChar, updateData.customerName)
        .input('defect_type', sql.NVarChar, updateData.defectType)
        .input('customer_claim_no', sql.NVarChar, updateData.customerClaimNo)
        .input('quality_alarm_no', sql.NVarChar, updateData.qualityAlarmNo)
        .input('claim_date', sql.DateTime, updateData.claimDate)
        .input('actions', sql.NVarChar, updateData.actions)
        .input('gas_claim_sap_no', sql.NVarChar, updateData.gasClaimSapNo)
        .input('detection_location', sql.NVarChar, updateData.detectionLocation)
        .input('gas_part_name', sql.NVarChar, updateData.gasPartName)
        .input('gas_part_ref_no', sql.NVarChar, updateData.gasPartRefNo)
        .input('nok_quantity', sql.Int, updateData.nokQuantity)
        .input('claim_type', sql.NVarChar, updateData.claimType)
        .input('cost_amount', sql.Float, updateData.costAmount)
        .input('currency', sql.NVarChar, updateData.currency)
        .input('status', sql.NVarChar, updateData.status)
        .input('issue_description', sql.NVarChar, updateData.issueDescription)
        .input('ppm_type', sql.NVarChar, updateData.ppmType)
        .input('claim_related_department', sql.NVarChar, updateData.claimRelatedDepartment)
        .input('customer_ref_no', sql.NVarChar, updateData.customerRefNo)
        .input('gpq_no', sql.NVarChar, updateData.gpqNo)
        .input('gpq_responsible_person', sql.NVarChar, updateData.gpqResponsiblePerson)
        .input('supplier_name', sql.NVarChar, updateData.supplierName)
        .input('hbr_no', sql.NVarChar, updateData.hbrNo)
        .input('priority', sql.NVarChar, updateData.priority)
        .query(`
          UPDATE claims SET
            customer_name = @customer_name,
            defect_type = @defect_type,
            customer_claim_no = @customer_claim_no,
            quality_alarm_no = @quality_alarm_no,
            claim_date = @claim_date,
            actions = @actions,
            gas_claim_sap_no = @gas_claim_sap_no,
            detection_location = @detection_location,
            gas_part_name = @gas_part_name,
            gas_part_ref_no = @gas_part_ref_no,
            nok_quantity = @nok_quantity,
            claim_type = @claim_type,
            cost_amount = @cost_amount,
            currency = @currency,
            status = @status,
            issue_description = @issue_description,
            ppm_type = @ppm_type,
            claim_related_department = @claim_related_department,
            customer_ref_no = @customer_ref_no,
            gpq_no = @gpq_no,
            gpq_responsible_person = @gpq_responsible_person,
            supplier_name = @supplier_name,
            hbr_no = @hbr_no,
            priority = @priority,
            updated_at = GETDATE()
          WHERE id = @id
        `);

      // Then fetch the updated record
      const result = await this.pool.request()
        .input('id', sql.Int, parseInt(claimId))
        .query(`
          SELECT 
            id,
            customer_name as customerName,
            defect_type as defectType,
            customer_claim_no as customerClaimNo,
            quality_alarm_no as qualityAlarmNo,
            claim_date as claimDate,
            actions,
            gas_claim_sap_no as gasClaimSapNo,
            detection_location as detectionLocation,
            claim_creator as claimCreator,
            gas_part_name as gasPartName,
            gas_part_ref_no as gasPartRefNo,
            nok_quantity as nokQuantity,
            claim_type as claimType,
            cost_amount as costAmount,
            currency,
            status,
            issue_description as issueDescription,
            ppm_type as ppmType,
            claim_related_department as claimRelatedDepartment,
            customer_ref_no as customerRefNo,
            gpq_no as gpqNo,
            gpq_responsible_person as gpqResponsiblePerson,
            supplier_name as supplierName,
            hbr_no as hbrNo,
            priority,
            created_at as createdAt,
            updated_at as updatedAt
          FROM claims 
          WHERE id = @id
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error updating claim:', error);
      throw error;
    }
  }

  async getClaim(id: string) {
    if (!this.useDatabase) {
      return this.memoryClaims?.find(c => c.id === id) || null;
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('id', sql.Int, parseInt(id))
        .query(`
          SELECT 
            id,
            customer_name as customerName,
            defect_type as defectType,
            customer_claim_no as customerClaimNo,
            quality_alarm_no as qualityAlarmNo,
            claim_date as claimDate,
            actions,
            gas_claim_sap_no as gasClaimSapNo,
            detection_location as detectionLocation,
            claim_creator as claimCreator,
            gas_part_name as gasPartName,
            gas_part_ref_no as gasPartRefNo,
            nok_quantity as nokQuantity,
            claim_type as claimType,
            cost_amount as costAmount,
            currency,
            status,
            issue_description as issueDescription,
            ppm_type as ppmType,
            claim_related_department as claimRelatedDepartment,
            customer_ref_no as customerRefNo,
            gpq_no as gpqNo,
            gpq_responsible_person as gpqResponsiblePerson,
            supplier_name as supplierName,
            hbr_no as hbrNo,
            priority,
            created_at as createdAt,
            updated_at as updatedAt
          FROM claims 
          WHERE id = @id
        `);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching claim by ID:', error);
      return null;
    }
  }

  async getClaimComments(claimId: string) {
    if (!this.useDatabase) {
      return this.memoryClaimComments?.filter(c => c.claimId === claimId) || [];
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('claim_id', sql.Int, parseInt(claimId))
        .query('SELECT cc.*, u.name as userName FROM claim_comments cc LEFT JOIN users u ON cc.user_id = u.id WHERE cc.claim_id = @claim_id ORDER BY cc.created_at DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching claim comments:', error);
      return [];
    }
  }

  async createClaimComment(commentData: any) {
    if (!this.useDatabase) {
      const comment = {
        id: Math.random().toString(36).substr(2, 9),
        ...commentData,
        createdAt: new Date().toISOString(),
      };

      if (!this.memoryClaimComments) {
        this.memoryClaimComments = [];
      }

      this.memoryClaimComments.push(comment);
      return comment;
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('claim_id', sql.Int, parseInt(commentData.claimId))
        .input('user_id', sql.Int, parseInt(commentData.userId))
        .input('comment', sql.NVarChar, commentData.comment)
        .query(`
          INSERT INTO claim_comments (claim_id, user_id, comment)
          OUTPUT INSERTED.*, (SELECT name FROM users WHERE id = INSERTED.user_id) as userName
          VALUES (@claim_id, @user_id, @comment)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating claim comment:', error);
      throw error;
    }
  }

  async getClaimWorkflow(claimId: string) {
    if (!this.useDatabase) {
      return this.memoryClaimWorkflow?.filter(w => w.claimId === claimId) || [];
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('claim_id', sql.Int, parseInt(claimId))
        .query('SELECT cw.*, u.name as changedByName FROM claim_workflow cw LEFT JOIN users u ON cw.changed_by = u.id WHERE cw.claim_id = @claim_id ORDER BY cw.changed_at DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching claim workflow:', error);
      return [];
    }
  }

  async createClaimWorkflow(workflowData: any) {
    if (!this.useDatabase) {
      const workflow = {
        id: Math.random().toString(36).substr(2, 9),
        ...workflowData,
        changedAt: new Date().toISOString(),
      };

      if (!this.memoryClaimWorkflow) {
        this.memoryClaimWorkflow = [];
      }

      this.memoryClaimWorkflow.push(workflow);
      return workflow;
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('claim_id', sql.Int, parseInt(workflowData.claimId))
        .input('status', sql.NVarChar, workflowData.status)
        .input('changed_by', sql.Int, parseInt(workflowData.changedBy))
        .query(`
          INSERT INTO claim_workflow (claim_id, status, changed_by)
          OUTPUT INSERTED.*, (SELECT name FROM users WHERE id = INSERTED.changed_by) as changedByName
          VALUES (@claim_id, @status, @changed_by)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error creating claim workflow:', error);
      throw error;
    }
  }

  async getClaimAttachments(claimId: string) {
    if (!this.useDatabase) {
      return this.memoryClaimAttachments?.filter(a => a.claimId === claimId) || [];
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('claim_id', sql.Int, parseInt(claimId))
        .query('SELECT ca.*, u.name as uploadedByName FROM claim_attachments ca LEFT JOIN users u ON ca.uploaded_by = u.id WHERE ca.claim_id = @claim_id ORDER BY ca.uploaded_at DESC');
      return result.recordset;
    } catch (error) {
      console.error('Error fetching claim attachments:', error);
      return [];
    }
  }

  async uploadClaimAttachment(attachmentData: any) {
    if (!this.useDatabase) {
      const attachment = {
        id: Math.random().toString(36).substr(2, 9),
        ...attachmentData,
        uploadedAt: new Date().toISOString(),
      };

      if (!this.memoryClaimAttachments) {
        this.memoryClaimAttachments = [];
      }
      this.memoryClaimAttachments.push(attachment);
      return attachment;
    }

    if (!this.pool) throw new Error('Database not connected');
    try {
      const result = await this.pool.request()
        .input('claim_id', sql.Int, parseInt(attachmentData.claimId))
        .input('file_name', sql.NVarChar, attachmentData.fileName)
        .input('file_path', sql.NVarChar, attachmentData.filePath)
        .input('uploaded_by', sql.Int, parseInt(attachmentData.uploadedBy))
        .query(`
          INSERT INTO claim_attachments (claim_id, file_name, file_path, uploaded_by)
          OUTPUT INSERTED.*, (SELECT name FROM users WHERE id = INSERTED.uploaded_by) as uploadedByName
          VALUES (@claim_id, @file_name, @file_path, @uploaded_by)
        `);
      return result.recordset[0];
    } catch (error) {
      console.error('Error uploading claim attachment:', error);
      throw error;
    }
  }
};

export const storage = new Storage();