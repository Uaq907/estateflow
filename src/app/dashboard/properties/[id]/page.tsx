

import { getEmployeeFromSession } from '@/lib/auth';
import { getPropertyById, getUnitsForProperty, getEmployees, getTenants, getEmployeesForProperty, getOwners, getPropertyDocuments } from '@/lib/db';
import PropertyDetailClient from '@/components/property-detail-client';
import { notFound, redirect } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { getFullDemoData } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loggedInEmployee = await getEmployeeFromSession();

  if (!loggedInEmployee) {
    redirect('/login');
  }

  // Check if this is demo admin or if we should use demo data
  if (loggedInEmployee?.id === 'demo-admin') {
    // Use demo data directly for demo admin
    const demoData = getFullDemoData(50);
    const demoProperty = demoData.properties.find(property => property.id === id);
    
    if (demoProperty) {
      // Find related data for the demo property
      const demoUnits = demoData.units.filter(unit => unit.propertyId === id);
      const demoEmployees = demoData.employees;
      const demoTenants = demoData.tenants;
      
      // Create demo owners
      const demoOwners = [
        { id: '1', name: 'أحمد محمد', email: 'ahmed@owner.com', phone: '+971501234567' },
        { id: '2', name: 'فاطمة علي', email: 'fatima@owner.com', phone: '+971509876543' },
        { id: '3', name: 'خالد أحمد', email: 'khalid@owner.com', phone: '+971507654321' }
      ];
      
      // Create demo documents
      const demoDocuments = [
        { 
          id: '1', 
          propertyId: id, 
          name: 'عقد الملكية', 
          type: 'Contract', 
          url: '/uploads/properties/contract.pdf',
          documentUrl: '/uploads/properties/contract.pdf',
          documentName: 'عقد الملكية',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-01-15')
        },
        { 
          id: '2', 
          propertyId: id, 
          name: 'رخصة البناء', 
          type: 'License', 
          url: '/uploads/properties/license.pdf',
          documentUrl: '/uploads/properties/license.pdf',
          documentName: 'رخصة البناء',
          createdAt: new Date('2023-02-20'),
          updatedAt: new Date('2023-02-20')
        }
      ];
      
      return (
        <PropertyDetailClient
          initialProperty={demoProperty}
          initialUnits={demoUnits}
          allEmployees={demoEmployees}
          allOwners={demoOwners}
          assignedEmployees={demoEmployees.slice(0, 3)} // First 3 employees as assigned
          tenants={demoTenants}
          documents={demoDocuments}
          loggedInEmployee={loggedInEmployee}
        />
      );
    }
  }

  // Always try demo data first for better fallback support
  const demoData = getFullDemoData(50);
  const demoProperty = demoData.properties.find(property => property.id === id);
  
  // Helper function to render demo property
  const renderDemoProperty = () => {
    if (!demoProperty) {
      console.log('Property not found in demo data, redirecting to dashboard. ID:', id);
      redirect('/dashboard');
    }
    
    console.log('Rendering demo property:', demoProperty.name, 'ID:', id);
    const demoUnits = demoData.units.filter(unit => unit.propertyId === id);
    const demoEmployees = demoData.employees;
    const demoTenants = demoData.tenants;
    
    const demoOwners = [
      { id: '1', name: 'أحمد محمد', email: 'ahmed@owner.com', phone: '+971501234567' },
      { id: '2', name: 'فاطمة علي', email: 'fatima@owner.com', phone: '+971509876543' },
      { id: '3', name: 'خالد أحمد', email: 'khalid@owner.com', phone: '+971507654321' }
    ];
    
    const demoDocuments = [
      { 
        id: '1', 
        propertyId: id, 
        name: 'عقد الملكية', 
        type: 'Contract', 
        url: '/uploads/properties/contract.pdf',
        documentUrl: '/uploads/properties/contract.pdf',
        documentName: 'عقد الملكية',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15')
      },
      { 
        id: '2', 
        propertyId: id, 
        name: 'رخصة البناء', 
        type: 'License', 
        url: '/uploads/properties/license.pdf',
        documentUrl: '/uploads/properties/license.pdf',
        documentName: 'رخصة البناء',
        createdAt: new Date('2023-02-20'),
        updatedAt: new Date('2023-02-20')
      }
    ];
    
    return (
      <PropertyDetailClient
        initialProperty={demoProperty}
        initialUnits={demoUnits}
        allEmployees={demoEmployees}
        allOwners={demoOwners}
        assignedEmployees={demoEmployees.slice(0, 3)}
        tenants={demoTenants}
        documents={demoDocuments}
        loggedInEmployee={loggedInEmployee}
      />
    );
  };
  
  try {
    const property = await getPropertyById(id);
    if (!property) {
      // If no database property but demo exists, use demo
      return renderDemoProperty();
    }

    // --- PERMISSION CHECK ---
    const canViewAll = hasPermission(loggedInEmployee, 'properties:read');
    const isManager = loggedInEmployee.id === property.managerId;

    // Users can view the page only if they have global permission OR are the designated manager.
    // Being assigned to a property is no longer sufficient.
    if (!canViewAll && !isManager) {
      redirect('/dashboard');
    }
    // --- END PERMISSION CHECK ---
    
    const [units, allEmployees, allOwners, documents, tenants, assignedEmployeesForThisProperty] = await Promise.all([
      getUnitsForProperty(id),
      getEmployees(),
      getOwners(),
      getPropertyDocuments(id),
      getTenants(),
      getEmployeesForProperty(id)
    ]);

    return (
      <PropertyDetailClient
        initialProperty={property}
        initialUnits={units}
        allEmployees={allEmployees}
        allOwners={allOwners}
        assignedEmployees={assignedEmployeesForThisProperty}
        tenants={tenants}
        documents={documents}
        loggedInEmployee={loggedInEmployee}
      />
    );
  } catch (error) {
    console.error('Error fetching property details:', error);
    
    // Use demo data as fallback
    return renderDemoProperty();
  }
}

