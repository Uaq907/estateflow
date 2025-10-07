// Demo data for all sections of the project
export const DEMO_DATA = {
  employees: [
    {
      id: '1',
      name: 'أحمد محمد علي',
      email: 'ahmed@company.com',
      position: 'مدير عام',
      department: 'الإدارة',
      startDate: new Date('2020-01-15'),
      allowLogin: true,
      permissions: ['dashboard:view-overview', 'employees:read', 'employees:write', 'properties:read', 'properties:write'],
      phone: '+971501234567',
      emergencyContact: '+971501234568',
      emiratesId: '784-1980-1234567-8',
      passportNumber: 'A1234567',
      dateOfBirth: new Date('1985-03-15'),
      status: 'Active',
      nationality: 'Emirati',
      managerId: null,
      salary: 25000,
      visaNumber: 'V1234567',
      visaExpiryDate: new Date('2025-12-31'),
      insuranceNumber: 'INS123456',
      insuranceExpiryDate: new Date('2025-12-31'),
      telegramBotToken: null,
      telegramChannelId: null,
      enableEmailAlerts: true,
      profilePictureUrl: null,
      assignedPropertyIds: []
    },
    {
      id: '2',
      name: 'فاطمة السالم',
      email: 'fatima@company.com',
      position: 'محاسبة',
      department: 'المحاسبة',
      startDate: new Date('2021-06-01'),
      allowLogin: true,
      permissions: ['dashboard:view-overview', 'employees:read', 'expenses:read-all', 'expenses:write'],
      phone: '+971509876543',
      emergencyContact: '+971509876544',
      emiratesId: '784-1990-9876543-2',
      passportNumber: 'B9876543',
      dateOfBirth: new Date('1990-08-22'),
      status: 'Active',
      nationality: 'Emirati',
      managerId: '1',
      salary: 18000,
      visaNumber: 'V9876543',
      visaExpiryDate: new Date('2025-11-30'),
      insuranceNumber: 'INS987654',
      insuranceExpiryDate: new Date('2025-11-30'),
      telegramBotToken: null,
      telegramChannelId: null,
      enableEmailAlerts: true,
      profilePictureUrl: null,
      assignedPropertyIds: []
    },
    {
      id: '3',
      name: 'خالد أحمد النور',
      email: 'khalid@company.com',
      position: 'موظف صيانة',
      department: 'الصيانة',
      startDate: new Date('2022-03-10'),
      allowLogin: true,
      permissions: ['dashboard:view-overview', 'maintenance:read', 'maintenance:write', 'assets:read'],
      phone: '+971507654321',
      emergencyContact: '+971507654322',
      emiratesId: '784-1988-7654321-0',
      passportNumber: 'C7654321',
      dateOfBirth: new Date('1988-12-05'),
      status: 'Active',
      nationality: 'Emirati',
      managerId: '1',
      salary: 15000,
      visaNumber: 'V7654321',
      visaExpiryDate: new Date('2025-10-15'),
      insuranceNumber: 'INS765432',
      insuranceExpiryDate: new Date('2025-10-15'),
      telegramBotToken: null,
      telegramChannelId: null,
      enableEmailAlerts: false,
      profilePictureUrl: null,
      assignedPropertyIds: []
    }
  ],

  properties: [
    {
      id: '1',
      name: 'فيلا الشاطئ',
      type: 'Villa',
      status: 'Active',
      address: 'شارع الشاطئ، دبي',
      totalUnits: 5,
      occupiedUnits: 4,
      managerId: '1',
      ownerId: '1',
      description: 'فيلا فاخرة على الشاطئ مع إطلالة بحرية',
      amenities: ['مسبح', 'حديقة', 'موقف سيارات'],
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'مجمع الشروق',
      type: 'Apartment',
      status: 'Active',
      address: 'شارع الشروق، أبوظبي',
      totalUnits: 20,
      occupiedUnits: 18,
      managerId: '1',
      ownerId: '2',
      description: 'مجمع سكني حديث مع جميع المرافق',
      amenities: ['صالة ألعاب', 'حديقة أطفال', 'أمن 24/7'],
      createdAt: new Date('2021-03-15'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'برج النخيل',
      type: 'Tower',
      status: 'Active',
      address: 'شارع النخيل، دبي',
      totalUnits: 50,
      occupiedUnits: 35,
      managerId: '1',
      ownerId: '3',
      description: 'برج سكني حديث في قلب دبي',
      amenities: ['مسبح', 'نادي صحي', 'حديقة', 'موقف سيارات', 'أمن 24/7'],
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],

  owners: [
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@owner.com',
      phone: '+971501234567'
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@owner.com',
      phone: '+971509876543'
    },
    {
      id: '3',
      name: 'خالد أحمد',
      email: 'khalid@owner.com',
      phone: '+971507654321'
    }
  ],

  tenants: [
    {
      id: '1',
      name: 'محمد السالم',
      email: 'mohammed@example.com',
      phone: '+971501234567',
      status: 'Active',
      emiratesId: '784-1985-1234567-1',
      passportNumber: 'P1234567',
      nationality: 'Emirati',
      dateOfBirth: new Date('1985-05-20'),
      address: 'دبي، الإمارات العربية المتحدة',
      emergencyContact: '+971501234568',
      allowLogin: true,
      idDocumentUrl: null,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'عائشة النور',
      email: 'aisha@example.com',
      phone: '+971509876543',
      status: 'Active',
      emiratesId: '784-1990-9876543-2',
      passportNumber: 'P9876543',
      nationality: 'Emirati',
      dateOfBirth: new Date('1990-08-15'),
      address: 'أبوظبي، الإمارات العربية المتحدة',
      emergencyContact: '+971509876544',
      allowLogin: true,
      idDocumentUrl: null,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'عبدالله الزهراني',
      email: 'abdullah@example.com',
      phone: '+971507654321',
      status: 'Active',
      emiratesId: '784-1988-7654321-3',
      passportNumber: 'P7654321',
      nationality: 'Saudi',
      dateOfBirth: new Date('1988-12-10'),
      address: 'الشارقة، الإمارات العربية المتحدة',
      emergencyContact: '+971507654322',
      allowLogin: false,
      idDocumentUrl: null,
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],

  expenses: [
    {
      id: '1',
      description: 'صيانة المصعد',
      amount: 2500,
      category: 'Maintenance',
      status: 'Paid',
      propertyId: '1',
      employeeId: '3',
      date: new Date('2024-01-15'),
      receiptUrl: null,
      notes: 'صيانة دورية للمصعد',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      description: 'فاتورة الكهرباء',
      amount: 800,
      category: 'Utilities',
      status: 'Pending',
      propertyId: '2',
      employeeId: '2',
      date: new Date('2024-01-20'),
      receiptUrl: null,
      notes: 'فاتورة شهر يناير',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      description: 'تنظيف المبنى',
      amount: 1200,
      category: 'Cleaning',
      status: 'Paid',
      propertyId: '3',
      employeeId: '1',
      date: new Date('2024-01-25'),
      receiptUrl: null,
      notes: 'خدمات تنظيف أسبوعية',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    }
  ],

  leases: [
    {
      id: '1',
      tenantId: '1',
      unitId: '1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyRent: 5000,
      deposit: 10000,
      status: 'Active',
      contractUrl: null,
      notes: 'عقد إيجار سنوي',
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      tenantId: '2',
      unitId: '2',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      monthlyRent: 3500,
      deposit: 7000,
      status: 'Active',
      contractUrl: null,
      notes: 'عقد إيجار سنوي',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-02-01')
    }
  ],

  assets: [
    {
      id: '1',
      name: 'مكيف هواء',
      category: 'HVAC',
      status: 'Active',
      propertyId: '1',
      unitId: '1',
      purchaseDate: new Date('2023-01-01'),
      warrantyExpiryDate: new Date('2026-01-01'),
      purchasePrice: 2000,
      description: 'مكيف هواء مركزي',
      serialNumber: 'AC001',
      brand: 'Carrier',
      model: 'XC21',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: '2',
      name: 'غسالة أطباق',
      category: 'Appliances',
      status: 'Active',
      propertyId: '2',
      unitId: '2',
      purchaseDate: new Date('2023-06-01'),
      warrantyExpiryDate: new Date('2026-06-01'),
      purchasePrice: 800,
      description: 'غسالة أطباق حديثة',
      serialNumber: 'DW002',
      brand: 'Bosch',
      model: 'SMS46IW08E',
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date('2023-06-01')
    }
  ],

  leasePayments: [
    {
      id: '1',
      leaseId: '1',
      amount: 5000,
      dueDate: new Date('2024-02-01'),
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      paidDate: new Date('2024-02-01'),
      notes: 'دفعة شهرية عادية',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '2',
      leaseId: '1',
      amount: 5000,
      dueDate: new Date('2024-03-01'),
      status: 'Pending',
      paymentMethod: null,
      paidDate: null,
      notes: 'دفعة شهرية معلقة',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: '3',
      leaseId: '2',
      amount: 3500,
      dueDate: new Date('2024-02-01'),
      status: 'Overdue',
      paymentMethod: null,
      paidDate: null,
      notes: 'دفعة متأخرة',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-01')
    }
  ]
};

// Function to generate more demo data
export function generateDemoData(count: number = 50) {
  const departments = ['الإدارة', 'المحاسبة', 'الصيانة', 'الموارد البشرية', 'العمليات', 'المبيعات', 'التسويق'];
  const positions = ['مدير', 'محاسب', 'موظف', 'مشرف', 'منسق', 'محلل', 'أخصائي'];
  const propertyTypes = ['Villa', 'Apartment', 'Tower', 'Office', 'Retail', 'Warehouse'];
  const statuses = ['Active', 'Inactive', 'Maintenance'];
  const nationalities = ['Emirati', 'Saudi', 'Egyptian', 'Indian', 'Pakistani', 'Filipino', 'British'];
  const categories = ['Maintenance', 'Utilities', 'Cleaning', 'Security', 'Insurance', 'Marketing', 'Legal'];
  
  const demoData = {
    employees: [] as any[],
    properties: [] as any[],
    owners: [] as any[],
    tenants: [] as any[],
    expenses: [] as any[],
    leases: [] as any[],
    assets: [] as any[],
    leasePayments: [] as any[],
    units: [] as any[],
    cheques: [] as any[]
  };

  // Generate employees with unified password admin123
  const employeeNames = [
    'أحمد محمد', 'فاطمة علي', 'خالد أحمد', 'نور الدين', 'مريم حسن',
    'عبدالله سالم', 'عائشة محمد', 'يوسف أحمد', 'زينب علي', 'محمد حسن',
    'فاطمة الزهراء', 'علي محمود', 'خديجة أحمد', 'حسن محمد', 'آمنة علي',
    'مصطفى أحمد', 'زينب حسن', 'عبدالرحمن محمد', 'مريم أحمد', 'يوسف علي',
    'نورا حسن', 'أحمد عبدالله', 'فاطمة يوسف', 'خالد محمود', 'عائشة حسن',
    'محمد علي', 'زينب أحمد', 'حسن عبدالله', 'مريم يوسف', 'علي حسن',
    'خديجة محمود', 'يوسف أحمد', 'آمنة علي', 'مصطفى حسن', 'زينب محمد',
    'عبدالرحمن علي', 'مريم حسن', 'أحمد يوسف', 'فاطمة عبدالله', 'خالد حسن',
    'عائشة محمود', 'محمد يوسف', 'زينب أحمد', 'حسن علي', 'مريم عبدالله',
    'علي يوسف', 'خديجة حسن', 'يوسف محمود', 'آمنة أحمد', 'مصطفى علي'
  ];

  const allPermissions = [
    'dashboard:view-overview',
    'dashboard:view-calendar',
    'employees:read',
    'employees:create',
    'employees:update',
    'employees:delete',
    'employees:manage-permissions',
    'properties:read',
    'properties:create',
    'properties:update',
    'properties:delete',
    'tenants:read',
    'tenants:create',
    'tenants:update',
    'tenants:delete',
    'expenses:read-all',
    'expenses:read-own',
    'expenses:create',
    'expenses:approve',
    'expenses:update',
    'expenses:delete',
    'maintenance:read',
    'maintenance:create',
    'maintenance:update',
    'maintenance:delete',
    'assets:read',
    'assets:create',
    'assets:update',
    'assets:delete',
    'cheques:read',
    'cheques:create',
    'cheques:update',
    'cheques:delete',
    'reporting:execute',
    'settings:manage',
    'settings:view-logs',
    'settings:manage-notifications'
  ];

  for (let i = 4; i <= count; i++) {
    const nameIndex = (i - 4) % employeeNames.length;
    const selectedPosition = positions[Math.floor(Math.random() * positions.length)];
    const selectedDepartment = departments[Math.floor(Math.random() * departments.length)];
    
    // Assign different permission levels based on position and department
    let employeePermissions = ['dashboard:view-overview'];
    
    if (selectedPosition === 'مدير' || selectedDepartment === 'الإدارة') {
      // Managers get most permissions
      employeePermissions = allPermissions.slice(0, Math.floor(Math.random() * 20) + 15);
    } else if (selectedPosition === 'محاسب' || selectedDepartment === 'المحاسبة') {
      // Accountants get financial permissions
      employeePermissions = [
        'dashboard:view-overview',
        'dashboard:view-calendar',
        'expenses:read-all',
        'expenses:create',
        'expenses:approve',
        'expenses:update',
        'expenses:delete',
        'cheques:read',
        'cheques:create',
        'cheques:update',
        'cheques:delete',
        'reporting:execute'
      ];
    } else if (selectedPosition === 'موظف صيانة' || selectedDepartment === 'الصيانة') {
      // Maintenance staff get maintenance permissions
      employeePermissions = [
        'dashboard:view-overview',
        'maintenance:read',
        'maintenance:create',
        'maintenance:update',
        'maintenance:delete',
        'assets:read',
        'assets:create',
        'assets:update',
        'assets:delete',
        'properties:read'
      ];
    } else {
      // Regular employees get basic permissions
      employeePermissions = [
        'dashboard:view-overview',
        'dashboard:view-calendar',
        'expenses:read-own',
        'expenses:create',
        'maintenance:read',
        'assets:read'
      ];
    }

    demoData.employees.push({
      id: String(i),
      name: employeeNames[nameIndex],
      email: `employee${i}@company.com`,
      position: selectedPosition,
      department: selectedDepartment,
      startDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
      allowLogin: true, // All employees can login
      permissions: employeePermissions,
      phone: `+97150${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      emergencyContact: `+97150${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      emiratesId: `784-19${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}-${Math.floor(Math.random() * 10)}`,
      passportNumber: `P${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      dateOfBirth: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      managerId: Math.random() > 0.7 ? '1' : null,
      salary: 10000 + Math.floor(Math.random() * 20000),
      visaNumber: `V${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      visaExpiryDate: new Date(2025 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      insuranceNumber: `INS${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      insuranceExpiryDate: new Date(2025 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      telegramBotToken: null,
      telegramChannelId: null,
      enableEmailAlerts: Math.random() > 0.5,
      profilePictureUrl: null,
      assignedPropertyIds: [],
      password: 'admin123' // Unified password for all employees
    });
  }

  // Generate comprehensive owners data
  const ownerNames = [
    'أحمد محمد', 'فاطمة علي', 'خالد أحمد', 'نور الدين', 'مريم حسن', 'عبدالله سالم', 'عائشة محمد', 'يوسف أحمد', 'زينب علي', 'محمد حسن',
    'سارة عبدالله', 'علي محمود', 'نورا أحمد', 'عبدالرحمن خالد', 'فاطمة سالم', 'محمد علي', 'أميرة حسن', 'خالد سالم', 'مريم علي', 'يوسف محمد',
    'عبدالله أحمد', 'نور الدين', 'فاطمة محمد', 'خالد علي', 'سارة حسن', 'محمد عبدالله', 'عائشة أحمد', 'يوسف علي', 'زينب محمد', 'عبدالرحمن حسن',
    'مريم سالم', 'أحمد علي', 'فاطمة عبدالله', 'خالد محمد', 'نورا علي', 'محمد حسن', 'عائشة عبدالله', 'يوسف سالم', 'سارة محمد', 'عبدالله علي'
  ];
  
  const ownerTypes = ['Individual', 'Company', 'Investment Group', 'Real Estate Developer'];
  const ownerNationalities = ['Emirati', 'Saudi', 'Egyptian', 'Indian', 'Pakistani', 'British', 'American'];
  
  // Generate more owners to ensure good distribution
  for (let i = 1; i <= count * 2; i++) {
    const nameIndex = (i - 1) % ownerNames.length;
    const ownerType = ownerTypes[Math.floor(Math.random() * ownerTypes.length)];
    const nationality = ownerNationalities[Math.floor(Math.random() * ownerNationalities.length)];
    
    demoData.owners.push({
      id: String(i),
      name: ownerNames[nameIndex],
      email: `owner${i}@property.com`,
      phone: `+97150${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      type: ownerType,
      nationality: nationality,
      address: `${Math.floor(Math.random() * 1000) + 1} شارع ${ownerNames[nameIndex]}، دبي`,
      emiratesId: `784-19${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}-${Math.floor(Math.random() * 10)}`,
      passportNumber: `P${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      dateOfBirth: new Date(1960 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      occupation: ownerType === 'Company' ? 'Business Owner' : 'Real Estate Investor',
      companyName: ownerType === 'Company' ? `شركة ${ownerNames[nameIndex]} للاستثمار العقاري` : null,
      bankAccount: `AE${Math.floor(Math.random() * 1000000000000000000).toString().padStart(23, '0')}`,
      emergencyContact: `+97150${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      notes: `مالك عقار من نوع ${ownerType}`,
      createdAt: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date()
    });
  }

  // Generate properties with detailed information
  for (let i = 4; i <= count; i++) {
    const propertyTypes = ['فيلا', 'شقة', 'برج', 'مكتب', 'تجاري', 'مستودع'];
    const cities = ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين'];
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const totalUnits = Math.floor(Math.random() * 50) + 5; // 5-55 units per property
    const occupiedUnits = Math.floor(totalUnits * (0.7 + Math.random() * 0.3)); // 70-100% occupancy
    
    const ownerNames = ['أحمد محمد', 'فاطمة علي', 'خالد أحمد', 'نور الدين', 'مريم حسن', 'عبدالله سالم', 'عائشة محمد', 'يوسف أحمد', 'زينب علي', 'محمد حسن'];
    const purposes = ['Residential', 'Commercial', 'Mixed Use'];
    
    demoData.properties.push({
      id: String(i),
      name: `${propertyType} ${city} ${i}`,
      type: propertyType,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      address: `شارع ${Math.floor(Math.random() * 100) + 1}, ${city}`,
      city: city,
      state: 'الإمارات العربية المتحدة',
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'الإمارات العربية المتحدة',
      yearBuilt: 2015 + Math.floor(Math.random() * 9),
      totalUnits: totalUnits,
      occupiedUnits: occupiedUnits,
      status: Math.random() > 0.1 ? 'Active' : 'Under Maintenance',
      managerId: String(Math.floor(Math.random() * count) + 1),
      ownerId: demoData.owners[Math.floor(Math.random() * demoData.owners.length)].id,
      ownerName: demoData.owners[Math.floor(Math.random() * demoData.owners.length)].name,
      purchasePrice: 500000 + Math.floor(Math.random() * 4500000),
      currentValue: 600000 + Math.floor(Math.random() * 5000000),
      imageUrl: `https://picsum.photos/640/480?random=${i}`,
      description: `${propertyType} حديث في ${city} مع ${totalUnits} وحدة`,
      amenities: ['مسبح', 'حديقة', 'موقف سيارات', 'أمن', 'مصعد', 'نادي صحي'],
      createdAt: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date()
    });
  }

  // Generate detailed units for each property
  const unitTypes = ['شقة', 'استوديو', 'بنتهاوس', 'دوبلكس', 'مكتب', 'محل تجاري', 'مستودع', 'فيلا'];
  const unitStatuses = ['متاح', 'مشغول', 'تحت الصيانة', 'محجوز'];
  
  for (let propertyId = 1; propertyId <= count; propertyId++) {
    const property = demoData.properties.find(p => p.id === String(propertyId));
    if (!property) continue;
    
    const totalUnits = property.totalUnits;
    
    // Ensure at least 30% of units are occupied (minimum 1 unit)
    const minOccupiedUnits = Math.max(1, Math.floor(totalUnits * 0.3));
    const occupiedUnitIndices = Array.from({length: minOccupiedUnits}, (_, i) => i + 1);
    
    for (let unitIndex = 1; unitIndex <= totalUnits; unitIndex++) {
      const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
      
      // Determine if this unit should be occupied
      const isOccupied = occupiedUnitIndices.includes(unitIndex);
      const unitStatus = isOccupied ? 'مشغول' : unitStatuses[Math.floor(Math.random() * (unitStatuses.length - 1))]; // Exclude 'مشغول' for non-occupied
      
      const floor = Math.floor(unitIndex / 10) + 1;
      const unitNumber = `${floor}${String.fromCharCode(65 + (unitIndex % 26))}`;
      
      // Generate tenant info for occupied units
      const tenantNames = ['أحمد محمد', 'فاطمة علي', 'خالد أحمد', 'سارة حسن', 'محمد عبدالله', 'نور الدين', 'عائشة محمد', 'عبدالرحمن خالد'];
      const businessNames = ['شركة التقنية المتقدمة', 'مؤسسة النجاح التجارية', 'شركة الابتكار الحديث', 'مؤسسة التميز العقارية', 'شركة المستقبل للخدمات'];
      
      // Get the property owner for this unit
      const propertyOwner = demoData.properties.find(p => p.id === String(propertyId));
      const unitOwner = propertyOwner ? demoData.owners.find(o => o.id === propertyOwner.ownerId) : null;
      
      const tenantName = isOccupied ? tenantNames[Math.floor(Math.random() * tenantNames.length)] : null;
      const businessName = isOccupied && unitType === 'تجاري' ? businessNames[Math.floor(Math.random() * businessNames.length)] : null;
      const activeLeaseId = isOccupied ? `lease-${propertyId}-${unitIndex}` : null;
      const leaseEndDate = isOccupied ? new Date(Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)) : null;
      const nextPaymentDueDate = isOccupied ? new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : null;
      
      demoData.units.push({
        id: `${propertyId}-${unitIndex}`,
        propertyId: String(propertyId),
        unitNumber: unitNumber,
        type: unitType,
        status: unitStatus,
        rent: 2000 + Math.floor(Math.random() * 8000),
        price: 2000 + Math.floor(Math.random() * 8000),
        size: 50 + Math.floor(Math.random() * 150),
        bedrooms: unitType === 'استوديو' ? 0 : 1 + Math.floor(Math.random() * 4),
        bathrooms: 1 + Math.floor(Math.random() * 3),
        floor: floor,
        balcony: Math.random() > 0.5,
        parking: Math.random() > 0.3,
        furnished: Math.random() > 0.6,
        description: `${unitType} في الطابق ${floor} - ${unitNumber}`,
        amenities: ['تكييف', 'إنترنت', 'أمن', 'موقف سيارات'],
        tenantName: tenantName,
        businessName: businessName,
        activeLeaseId: activeLeaseId,
        leaseEndDate: leaseEndDate,
        nextPaymentDueDate: nextPaymentDueDate,
        accountNumber: `ACC-${propertyId}-${unitIndex}`,
        hasPendingExtension: Math.random() > 0.8,
        contractUrl: isOccupied ? `/uploads/contracts/contract-${propertyId}-${unitIndex}.pdf` : null,
        ownerId: unitOwner?.id || null,
        ownerName: unitOwner?.name || null,
        ownerEmail: unitOwner?.email || null,
        ownerPhone: unitOwner?.phone || null,
        createdAt: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        updatedAt: new Date()
      });
    }
  }

  // Generate tenants
  for (let i = 4; i <= count; i++) {
    demoData.tenants.push({
      id: String(i),
      name: `مستأجر ${i}`,
      email: `tenant${i}@example.com`,
      phone: `+97150${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      emiratesId: `784-19${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}-${Math.floor(Math.random() * 10)}`,
      passportNumber: `P${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      dateOfBirth: new Date(1980 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      address: `عنوان المستأجر ${i}`,
      emergencyContact: `+97150${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      allowLogin: Math.random() > 0.5,
      idDocumentUrl: null,
      createdAt: new Date(2022 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    });
  }

  // Generate expenses
  for (let i = 4; i <= count; i++) {
    const expenseStatuses = ['Paid', 'Pending', 'Approved', 'Rejected'];
    demoData.expenses.push({
      id: String(i),
      description: `مصروف ${i}`,
      amount: 100 + Math.floor(Math.random() * 5000),
      category: categories[Math.floor(Math.random() * categories.length)],
      status: expenseStatuses[Math.floor(Math.random() * expenseStatuses.length)],
      propertyId: String(Math.floor(Math.random() * count) + 1),
      employeeId: String(Math.floor(Math.random() * 10) + 1),
      date: new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      receiptUrl: null,
      notes: `ملاحظات المصروف ${i}`,
      createdAt: new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    });
  }

  // Generate realistic leases with proper unit-tenant relationships
  const tenants = demoData.tenants;
  const leaseClassifications = ['Residential', 'Commercial', 'Industrial', 'Office', 'Retail'];
  const paymentFrequencies = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'];
  
  // Create leases for each property with realistic data
  // Ensure every property has at least some units with tenants
  for (const property of demoData.properties) {
    const propertyUnits = demoData.units.filter(unit => unit.propertyId === property.id);
    
    // Ensure at least 30% of units are occupied (minimum 1 unit)
    const minOccupiedUnits = Math.max(1, Math.floor(propertyUnits.length * 0.3));
    const occupiedUnits = propertyUnits.slice(0, minOccupiedUnits);
    
    // Mark these units as occupied
    occupiedUnits.forEach(unit => {
      const unitIndex = demoData.units.findIndex(u => u.id === unit.id);
      if (unitIndex !== -1) {
        demoData.units[unitIndex].status = 'مشغول';
        demoData.units[unitIndex].tenantName = tenants[Math.floor(Math.random() * tenants.length)].name;
        demoData.units[unitIndex].activeLeaseId = `lease-${property.id}-${unit.id.split('-')[1]}`;
      }
    });
    
    for (const unit of occupiedUnits) {
      const tenant = tenants[Math.floor(Math.random() * tenants.length)];
      if (!tenant) continue;
      
      // Generate realistic lease dates
      const currentDate = new Date();
      const startDate = new Date(
        currentDate.getFullYear() - Math.floor(Math.random() * 3), // 0-3 years ago
        Math.floor(Math.random() * 12), // Random month
        Math.floor(Math.random() * 28) + 1 // Random day
      );
      
      const leaseDuration = [6, 12, 24, 36][Math.floor(Math.random() * 4)]; // 6, 12, 24, or 36 months
      const endDate = new Date(startDate.getTime() + leaseDuration * 30 * 24 * 60 * 60 * 1000);
      
      const monthlyRent = unit.rent || (2000 + Math.floor(Math.random() * 8000));
      const classification = leaseClassifications[Math.floor(Math.random() * leaseClassifications.length)];
      const paymentFrequency = paymentFrequencies[Math.floor(Math.random() * paymentFrequencies.length)];
      
      const totalLeaseAmount = monthlyRent * leaseDuration;
      const totalPaidAmount = Math.floor(Math.random() * totalLeaseAmount);
    
      demoData.leases.push({
        id: `lease-${unit.propertyId}-${unit.id.split('-')[1]}`,
        tenantId: tenant.id,
        propertyId: unit.propertyId,
        unitId: unit.id,
        startDate,
        endDate,
        monthlyRent: monthlyRent,
        depositAmount: monthlyRent * 2,
        paymentFrequency: paymentFrequency,
        classification: classification,
        terms: `عقد إيجار ${classification} للوحدة ${unit.unitNumber} في ${property.name}`,
        status: endDate > currentDate ? 'Active' : 'Expired',
        contractUrl: `/uploads/contracts/lease_${unit.propertyId}_${unit.id.split('-')[1]}.pdf`,
        ejariNumber: `EJ${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        ejariExpiryDate: new Date(endDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        paymentDueDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      lastPaymentDate: Math.random() > 0.3 ? new Date(startDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null,
      nextPaymentAmount: monthlyRent,
      missingAttachmentsCount: Math.floor(Math.random() * 3),
      totalLeaseAmount: totalLeaseAmount,
      totalPaidAmount: totalPaidAmount,
        paymentsCount: Math.floor(Math.random() * 12) + 1, // 1-12 payments
        createdAt: startDate,
        updatedAt: new Date()
      });
    }
  }

  // Generate assets
  for (let i = 3; i <= count; i++) {
    const assetCategories = ['HVAC', 'Appliances', 'Furniture', 'Electronics', 'Security', 'Kitchen', 'Bathroom'];
    const brands = ['Samsung', 'LG', 'Carrier', 'Bosch', 'Whirlpool', 'Philips', 'Sony'];
    const purchaseDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    demoData.assets.push({
      id: String(i),
      name: `أصل ${i}`,
      category: assetCategories[Math.floor(Math.random() * assetCategories.length)],
      status: Math.random() > 0.1 ? 'Active' : 'Maintenance',
      propertyId: String(Math.floor(Math.random() * count) + 1),
      unitId: String(Math.floor(Math.random() * count * 5) + 1),
      purchaseDate,
      warrantyExpiryDate: new Date(purchaseDate.getFullYear() + 3, purchaseDate.getMonth(), purchaseDate.getDate()),
      purchasePrice: 100 + Math.floor(Math.random() * 10000),
      description: `وصف الأصل ${i}`,
      serialNumber: `SN${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      brand: brands[Math.floor(Math.random() * brands.length)],
      model: `Model-${Math.floor(Math.random() * 1000)}`,
      createdAt: purchaseDate,
      updatedAt: purchaseDate
    });
  }

  // Generate lease payments with different statuses
  const paymentStatuses = ['Paid', 'Pending', 'Overdue', 'Partial', 'Cancelled'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Online Payment'];
  
  // Generate realistic payments for each lease
  for (const lease of demoData.leases) {
    const currentDate = new Date();
    const leaseStartDate = new Date(lease.startDate);
    const leaseEndDate = new Date(lease.endDate);
    
    // Calculate number of payments based on lease duration and frequency
    let numPayments = 0;
    let paymentInterval = 1; // months
    
    switch (lease.paymentFrequency) {
      case 'Monthly':
        numPayments = Math.ceil((leaseEndDate.getTime() - leaseStartDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
        paymentInterval = 1;
        break;
      case 'Quarterly':
        numPayments = Math.ceil((leaseEndDate.getTime() - leaseStartDate.getTime()) / (90 * 24 * 60 * 60 * 1000));
        paymentInterval = 3;
        break;
      case 'Semi-Annual':
        numPayments = Math.ceil((leaseEndDate.getTime() - leaseStartDate.getTime()) / (180 * 24 * 60 * 60 * 1000));
        paymentInterval = 6;
        break;
      case 'Annual':
        numPayments = Math.ceil((leaseEndDate.getTime() - leaseStartDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
        paymentInterval = 12;
        break;
      default:
        numPayments = 12; // Default to monthly
    }
    
    // Ensure at least 3 payments and at most 36
    numPayments = Math.max(3, Math.min(numPayments, 36));
    
    // Create payments with realistic dates and statuses
    for (let i = 0; i < numPayments; i++) {
      const dueDate = new Date(leaseStartDate.getTime() + (i * paymentInterval * 30 * 24 * 60 * 60 * 1000));
      
      // Determine payment status based on current date
      let status = 'Pending';
      let paidDate = null;
      
      if (dueDate < currentDate) {
        // Past due date - determine if paid, overdue, or partial
        const random = Math.random();
        if (random < 0.7) {
          status = 'Paid';
          paidDate = new Date(dueDate.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000); // Paid within 5 days
        } else if (random < 0.85) {
          status = 'Overdue';
        } else if (random < 0.95) {
          status = 'Partial';
          paidDate = new Date(dueDate.getTime() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000);
        } else {
          status = 'Cancelled';
        }
      } else if (dueDate.getTime() - currentDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
        // Due within 7 days - might be paid early
        if (Math.random() < 0.3) {
          status = 'Paid';
          paidDate = new Date(dueDate.getTime() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000);
        }
      }
      
      demoData.leasePayments.push({
        id: `${lease.id}-payment-${i + 1}`,
        leaseId: lease.id,
        amount: lease.monthlyRent * paymentInterval,
        dueDate: dueDate,
        status: status,
        paymentMethod: status === 'Paid' || status === 'Partial' ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)] : null,
        paidDate: paidDate,
        notes: `دفعة ${status === 'Paid' ? 'مدفوعة' : status === 'Pending' ? 'معلقة' : status === 'Overdue' ? 'متأخرة' : status === 'Partial' ? 'جزئية' : 'ملغية'}`,
        createdAt: new Date(dueDate.getTime() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: paidDate || dueDate
      });
    }
  }

  // Generate 1000 cheques with different statuses and dates
  const chequeStatuses = ['Submitted', 'Pending', 'Partially Paid', 'Cleared', 'Bounced', 'Cancelled'];
  const chequeTypes = ['Rent Payment', 'Security Deposit', 'Maintenance Fee', 'Utility Bill', 'Insurance Payment', 'Management Fee', 'Late Fee'];
  const banks = ['Emirates NBD', 'ADCB', 'FAB', 'Mashreq Bank', 'RAKBANK', 'Dubai Islamic Bank', 'ADIB'];
  const payees = ['أحمد محمد', 'فاطمة علي', 'خالد أحمد', 'نور الدين', 'مريم حسن', 'عبدالله سالم', 'عائشة محمد', 'يوسف أحمد', 'زينب علي', 'محمد حسن'];
  
  for (let i = 1; i <= 1000; i++) {
    const status = chequeStatuses[Math.floor(Math.random() * chequeStatuses.length)];
    const type = chequeTypes[Math.floor(Math.random() * chequeTypes.length)];
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const payee = payees[Math.floor(Math.random() * payees.length)];
    
    // Generate realistic dates
    const issueDate = new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const dueDate = new Date(issueDate.getTime() + (Math.floor(Math.random() * 90) + 1) * 24 * 60 * 60 * 1000); // 1-90 days from issue
    
    // Generate amounts based on type
    let amount = 0;
    switch (type) {
      case 'Rent Payment':
        amount = 3000 + Math.floor(Math.random() * 7000); // 3000-10000
        break;
      case 'Security Deposit':
        amount = 6000 + Math.floor(Math.random() * 14000); // 6000-20000
        break;
      case 'Maintenance Fee':
        amount = 500 + Math.floor(Math.random() * 1500); // 500-2000
        break;
      case 'Utility Bill':
        amount = 200 + Math.floor(Math.random() * 800); // 200-1000
        break;
      case 'Insurance Payment':
        amount = 1000 + Math.floor(Math.random() * 2000); // 1000-3000
        break;
      case 'Management Fee':
        amount = 300 + Math.floor(Math.random() * 700); // 300-1000
        break;
      case 'Late Fee':
        amount = 100 + Math.floor(Math.random() * 400); // 100-500
        break;
      default:
        amount = 1000 + Math.floor(Math.random() * 4000); // 1000-5000
    }
    
    // Calculate paid amount based on status
    let paidAmount = 0;
    let clearedDate = null;
    let bouncedDate = null;
    
    switch (status) {
      case 'Cleared':
        paidAmount = amount;
        clearedDate = new Date(dueDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
        break;
      case 'Partially Paid':
        paidAmount = Math.floor(amount * (0.3 + Math.random() * 0.6)); // 30-90% of amount
        break;
      case 'Bounced':
        bouncedDate = new Date(dueDate.getTime() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);
        break;
      case 'Cancelled':
        // No payment
        break;
    }
    
    const chequeNumber = `CHQ${String(i).padStart(6, '0')}`;
    const accountNumber = `${Math.floor(Math.random() * 900000000) + 100000000}`; // 9-digit account number
    
    demoData.cheques.push({
      id: String(i),
      chequeNumber: chequeNumber,
      amount: amount,
      issueDate: issueDate,
      dueDate: dueDate,
      status: status,
      type: type,
      bankId: String(Math.floor(Math.random() * 7) + 1), // 1-7 for banks
      bankName: bank,
      payeeId: String(Math.floor(Math.random() * 10) + 1), // 1-10 for payees
      payeeName: payee,
      tenantId: String(Math.floor(Math.random() * count) + 1), // Link to tenants
      tenantName: demoData.tenants[Math.floor(Math.random() * demoData.tenants.length)]?.name || 'Unknown Tenant',
      accountNumber: accountNumber,
      notes: `شيك ${type} - ${payee}`,
      paidAmount: paidAmount,
      remainingAmount: amount - paidAmount,
      clearedDate: clearedDate,
      bouncedDate: bouncedDate,
      createdById: String(Math.floor(Math.random() * count) + 1), // Link to employees
      createdByName: demoData.employees[Math.floor(Math.random() * demoData.employees.length)]?.name || 'Unknown Employee',
      createdAt: issueDate,
      updatedAt: new Date()
    });
  }

  return demoData;
}

// Combine original demo data with generated data
export function getFullDemoData(count: number = 50) {
  const generatedData = generateDemoData(count);
  
  return {
    employees: [...DEMO_DATA.employees, ...generatedData.employees],
    properties: [...DEMO_DATA.properties, ...generatedData.properties],
    owners: [...DEMO_DATA.owners, ...generatedData.owners],
    tenants: [...DEMO_DATA.tenants, ...generatedData.tenants],
    expenses: [...DEMO_DATA.expenses, ...generatedData.expenses],
    leases: [...DEMO_DATA.leases, ...generatedData.leases],
    assets: [...DEMO_DATA.assets, ...generatedData.assets],
    leasePayments: [...DEMO_DATA.leasePayments, ...generatedData.leasePayments],
    units: [...generatedData.units],
    cheques: [...generatedData.cheques]
  };
}
